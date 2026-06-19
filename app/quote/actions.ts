// app/quote/actions.ts
"use server";

import { redirect } from "next/navigation";
import {
  sendQuoteConfirmationEmail,
  sendQuoteOwnerNotificationEmail,
} from "@/src/lib/email/quote-confirmation";
import { prisma } from "@/src/lib/prisma";
import { quoteRequestSchema } from "@/src/lib/quotes/quote-request-schema";

function parseQuoteItems(formData: FormData) {
  const indexes = new Set<number>();

  for (const key of formData.keys()) {
    const match = key.match(/^items\.(\d+)\.productId$/);

    if (match) {
      indexes.add(Number(match[1]));
    }
  }

  return Array.from(indexes)
    .sort((left, right) => left - right)
    .map((index) => ({
      productId: String(formData.get(`items.${index}.productId`) ?? ""),
      selected: formData.get(`items.${index}.selected`) === "on",
      quantity: Number(formData.get(`items.${index}.quantity`) ?? 1),
    }));
}

export async function createQuoteAction(formData: FormData) {
  const parsed = quoteRequestSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    businessName: formData.get("businessName"),
    message: formData.get("message"),
    items: parseQuoteItems(formData),
  });

  if (!parsed.success) {
    redirect("/quote?error=invalid");
  }

  const selectedItems = parsed.data.items.filter((item) => item.selected);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: selectedItems.map((item) => item.productId),
      },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      sku: true,
      minimumWholesaleQty: true,
    },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  if (products.length !== selectedItems.length) {
    redirect("/quote?error=products");
  }

  for (const item of selectedItems) {
    const product = productById.get(item.productId);
    const minimumWholesaleQty = product?.minimumWholesaleQty ?? 1;

    if (!product || item.quantity < minimumWholesaleQty) {
      redirect("/quote?error=invalid");
    }
  }

  const quote = await prisma.quote.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      businessName: parsed.data.businessName,
      message: parsed.data.message,
      status: "NEW",
      items: {
        create: selectedItems.map((item) => {
          const product = productById.get(item.productId);

          if (!product) {
            throw new Error("Selected product is unavailable");
          }

          return {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantity: item.quantity,
            requestedPrice: null,
          };
        }),
      },
    },
    include: {
      items: true,
    },
  });

  await sendQuoteConfirmationEmail({
    quoteId: quote.id,
    to: quote.email,
    name: quote.name,
    businessName: quote.businessName,
    items: quote.items.map((item) => ({
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
    })),
  });
  await sendQuoteOwnerNotificationEmail({
    quoteId: quote.id,
    name: quote.name,
    email: quote.email,
    phone: quote.phone,
    businessName: quote.businessName,
    message: quote.message,
    items: quote.items.map((item) => ({
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
    })),
  });

  redirect(`/quote/success?quote=${quote.id}`);
}
