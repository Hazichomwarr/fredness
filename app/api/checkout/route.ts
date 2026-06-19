// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { getStripe } from "@/src/lib/stripe/server";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  customerEmail: z.string().trim().email("Enter a valid email address"),
  customerName: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
      }),
    )
    .min(1, "Cart is empty"),
});

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
    return NextResponse.json(
      { error: "Invalid checkout request" },
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

    if (product.trackInventory && product.inventory <= 0) {
      return NextResponse.json(
        { error: `${product.name} is out of stock` },
        { status: 400 },
      );
    }

    if (product.trackInventory && item.quantity > product.inventory) {
      return NextResponse.json(
        {
          error: `Only ${product.inventory} ${
            product.inventory === 1 ? "unit" : "units"
          } of ${product.name} available`,
        },
        { status: 400 },
      );
    }

    const quantity = item.quantity;
    const lineTotal = Number(product.retailPrice) * quantity;

    orderItems.push({
      product,
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
          parsed.data.customerName || parsed.data.customerEmail.split("@")[0],
        customerEmail: parsed.data.customerEmail,
        status: "PENDING",
        subtotal: new Prisma.Decimal(subtotal),
        tax: new Prisma.Decimal(0),
        shipping: new Prisma.Decimal(0),
        total: new Prisma.Decimal(subtotal),
        items: {
          create: orderItems.map(({ product, quantity, lineTotal }) => ({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantity,
            unitPrice: product.retailPrice,
            lineTotal: new Prisma.Decimal(lineTotal),
          })),
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.data.customerEmail,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel?order=${order.id}`,
      metadata: {
        orderId: order.id,
      },
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      line_items: orderItems.map(({ product, quantity }) => {
        const imageUrl = product.images[0]?.url;

        return {
          quantity,
          price_data: {
            currency: "usd",
            unit_amount: toCents(product.retailPrice),
            product_data: {
              name: product.name,
              images: imageUrl?.startsWith("http") ? [imageUrl] : undefined,
              metadata: {
                productId: product.id,
                sku: product.sku,
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
