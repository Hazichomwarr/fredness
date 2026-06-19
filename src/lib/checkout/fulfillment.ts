// src/lib/checkout/fulfillment.ts
import "server-only";

import type Stripe from "stripe";
import { prisma } from "@/src/lib/prisma";

class InventoryUnavailableError extends Error {
  constructor(
    readonly orderId: string,
    readonly productNames: string[],
  ) {
    super("Paid order needs inventory review");
  }
}

function appendNote(existingNote: string | null, nextNote: string) {
  return existingNote ? `${existingNote}\n${nextNote}` : nextNote;
}

function paymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : null;
}

function shippingAddress(session: Stripe.Checkout.Session) {
  const address = session.customer_details?.address;
  const lines = [address?.line1, address?.line2].filter(Boolean);

  return lines.length ? lines.join(", ") : null;
}

function inventoryReviewNote(productNames: string[]) {
  return `Payment received, but inventory needs review before fulfillment: ${productNames.join(
    ", ",
  )}.`;
}

async function markPaidForInventoryReview(
  orderId: string,
  session: Stripe.Checkout.Session,
  productNames: string[],
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return null;
    }

    if (order.status !== "PENDING") {
      return order;
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        customerName: session.customer_details?.name ?? order.customerName,
        customerEmail:
          session.customer_details?.email ??
          session.customer_email ??
          order.customerEmail,
        customerPhone: session.customer_details?.phone ?? order.customerPhone,
        stripePaymentIntent: paymentIntentId(session),
        shippingAddress: shippingAddress(session) ?? order.shippingAddress,
        city: session.customer_details?.address?.city ?? order.city,
        state: session.customer_details?.address?.state ?? order.state,
        zipCode:
          session.customer_details?.address?.postal_code ?? order.zipCode,
        notes: appendNote(order.notes, inventoryReviewNote(productNames)),
      },
      include: { items: true },
    });
  });
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return null;
  }

  const orderId =
    session.metadata?.orderId ??
    (
      await prisma.order.findUnique({
        where: { stripeCheckoutSession: session.id },
        select: { id: true },
      })
    )?.id;

  if (!orderId) {
    return null;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  inventory: true,
                  name: true,
                  trackInventory: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        return null;
      }

      if (order.status !== "PENDING") {
        return order;
      }

      const claimedOrder = await tx.order.updateMany({
        where: {
          id: order.id,
          status: "PENDING",
        },
        data: {
          status: "PROCESSING",
        },
      });

      if (claimedOrder.count !== 1) {
        return order;
      }

      const trackedItems = order.items.filter(
        (item) => item.product.trackInventory,
      );
      const unavailableItems = trackedItems.filter(
        (item) => item.product.inventory < item.quantity,
      );

      if (unavailableItems.length) {
        return tx.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            customerName: session.customer_details?.name ?? order.customerName,
            customerEmail:
              session.customer_details?.email ??
              session.customer_email ??
              order.customerEmail,
            customerPhone:
              session.customer_details?.phone ?? order.customerPhone,
            stripePaymentIntent: paymentIntentId(session),
            shippingAddress: shippingAddress(session) ?? order.shippingAddress,
            city: session.customer_details?.address?.city ?? order.city,
            state: session.customer_details?.address?.state ?? order.state,
            zipCode:
              session.customer_details?.address?.postal_code ?? order.zipCode,
            notes: appendNote(
              order.notes,
              inventoryReviewNote(
                unavailableItems.map((item) => item.productName),
              ),
            ),
          },
          include: { items: true },
        });
      }

      for (const item of trackedItems) {
        const updatedProduct = await tx.product.updateMany({
          where: {
            id: item.productId,
            inventory: {
              gte: item.quantity,
            },
          },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedProduct.count !== 1) {
          throw new InventoryUnavailableError(order.id, [item.productName]);
        }
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          customerName: session.customer_details?.name ?? order.customerName,
          customerEmail:
            session.customer_details?.email ??
            session.customer_email ??
            order.customerEmail,
          customerPhone: session.customer_details?.phone ?? order.customerPhone,
          stripePaymentIntent: paymentIntentId(session),
          shippingAddress: shippingAddress(session) ?? order.shippingAddress,
          city: session.customer_details?.address?.city ?? order.city,
          state: session.customer_details?.address?.state ?? order.state,
          zipCode:
            session.customer_details?.address?.postal_code ?? order.zipCode,
        },
        include: { items: true },
      });
    });
  } catch (error) {
    if (error instanceof InventoryUnavailableError) {
      return markPaidForInventoryReview(
        error.orderId,
        session,
        error.productNames,
      );
    }

    throw error;
  }
}
