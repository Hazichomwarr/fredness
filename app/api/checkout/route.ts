// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { checkoutSchema } from "@/src/lib/checkout/checkout-schema";
import { prisma } from "@/src/lib/prisma";
import { getStripe } from "@/src/lib/stripe/server";

export const runtime = "nodejs";

function toCents(value: Prisma.Decimal) {
  return Math.round(Number(value) * 100);
}

function getBaseUrl(request: Request) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    request.headers.get("origin") ??
    new URL(request.url).origin
  );
}

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;

    return NextResponse.json(
      {
        error:
          fieldErrors.customerEmail?.[0] ?? "Invalid checkout request",
        fieldErrors,
      },
      { status: 400 },
    );
  }

  const requestedItems = parsed.data.items;
  const productIds = requestedItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      isActive: true,
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        take: 1,
        select: {
          url: true,
        },
      },
      variants: {
        select: {
          id: true,
          label: true,
          sku: true,
          retailPrice: true,
          inventory: true,
          isActive: true,
        },
      },
    },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  const orderItems = [];

  for (const item of requestedItems) {
    const product = productById.get(item.productId);

    if (!product) {
      return NextResponse.json(
        { error: "One or more products are no longer available" },
        { status: 400 },
      );
    }

    const activeVariants = product.variants.filter((variant) => variant.isActive);
    const selectedVariant = item.variantId
      ? activeVariants.find((variant) => variant.id === item.variantId)
      : null;

    if (!item.variantId && activeVariants.length > 0) {
      return NextResponse.json(
        { error: `Select a Pack / Size for ${product.name}` },
        { status: 400 },
      );
    }

    if (item.variantId && !selectedVariant) {
      return NextResponse.json(
        { error: "One or more product variants are no longer available" },
        { status: 400 },
      );
    }

    const inventory = selectedVariant?.inventory ?? product.inventory;
    const unitPrice = selectedVariant?.retailPrice ?? product.retailPrice;
    const sku = selectedVariant?.sku ?? product.sku;
    const productName = selectedVariant
      ? `${product.name} - ${selectedVariant.label}`
      : product.name;

    if (product.trackInventory && inventory <= 0) {
      return NextResponse.json(
        { error: `${productName} is out of stock` },
        { status: 400 },
      );
    }

    if (product.trackInventory && item.quantity > inventory) {
      return NextResponse.json(
        {
          error: `Only ${inventory} ${
            inventory === 1 ? "unit" : "units"
          } of ${productName} available`,
        },
        { status: 400 },
      );
    }

    const quantity = item.quantity;
    const lineTotal = Number(unitPrice) * quantity;

    orderItems.push({
      product,
      selectedVariant,
      sku,
      unitPrice,
      productName,
      quantity,
      lineTotal,
    });
  }

  if (!orderItems.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const subtotal = orderItems.reduce(
    (total, item) => total + item.lineTotal,
    0,
  );
  const baseUrl = getBaseUrl(request);

  try {
    const stripe = getStripe();
    const order = await prisma.order.create({
      data: {
        customerName:
          parsed.data.customerName ||
          parsed.data.customerEmail?.split("@")[0] ||
          "Customer",
        customerEmail: parsed.data.customerEmail,
        status: "PENDING",
        subtotal: new Prisma.Decimal(subtotal),
        tax: new Prisma.Decimal(0),
        shipping: new Prisma.Decimal(0),
        total: new Prisma.Decimal(subtotal),
        items: {
          create: orderItems.map(
            ({
              product,
              selectedVariant,
              sku,
              unitPrice,
              quantity,
              lineTotal,
            }) => ({
              productId: product.id,
              variantId: selectedVariant?.id,
              productName: product.name,
              variantLabel: selectedVariant?.label,
              sku,
              quantity,
              unitPrice,
              lineTotal: new Prisma.Decimal(lineTotal),
            }),
          ),
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.data.customerEmail ?? undefined,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel?order=${order.id}`,
      metadata: {
        orderId: order.id,
      },
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      line_items: orderItems.map(({ product, productName, quantity, unitPrice, sku }) => {
        const imageUrl = product.images[0]?.url;

        return {
          quantity,
          price_data: {
            currency: "usd",
            unit_amount: toCents(unitPrice),
            product_data: {
              name: productName,
              images: imageUrl?.startsWith("http") ? [imageUrl] : undefined,
              metadata: {
                productId: product.id,
                sku,
              },
            },
          },
        };
      }),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeCheckoutSession: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout session",
      },
      { status: 500 },
    );
  }
}
