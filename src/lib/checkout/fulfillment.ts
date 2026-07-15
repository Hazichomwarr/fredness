// src/lib/checkout/fulfillment.ts
import "server-only";

import type Stripe from "stripe";
import { sendPaidOrderNotifications } from "@/src/lib/checkout/notifications";
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
      return { order: null, newlyPaid: false };
    }

    if (order.status !== "PENDING") {
      return { order, newlyPaid: false };
    }

    const paidOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        customerName: session.customer_details?.name ?? order.customerName,
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

    return { order: paidOrder, newlyPaid: true };
  });
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    console.info("[CHECKOUT_FULFILLMENT_SKIPPED]", {
      sessionId: session.id,
      reason: "payment_not_paid",
      paymentStatus: session.payment_status,
    });
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
    console.error("[CHECKOUT_FULFILLMENT_SKIPPED]", {
      sessionId: session.id,
      reason: "order_not_found",
    });
    return null;
  }

  console.info("[CHECKOUT_FULFILLMENT_STARTED]", {
    sessionId: session.id,
    orderId,
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
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
              variant: {
                select: {
                  id: true,
                  inventory: true,
                  label: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        return { order: null, newlyPaid: false };
      }

      if (order.status !== "PENDING") {
        return { order, newlyPaid: false };
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
        return { order, newlyPaid: false };
      }

      const trackedItems = order.items.filter(
        (item) => item.product.trackInventory,
      );
      const unavailableItems = trackedItems.filter(
        (item) =>
          (item.variant?.inventory ?? item.product.inventory) < item.quantity,
      );

      if (unavailableItems.length) {
        const paidOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            customerName: session.customer_details?.name ?? order.customerName,
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

        return { order: paidOrder, newlyPaid: true };
      }

      for (const item of trackedItems) {
        if (item.variantId) {
          const updatedVariant = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              productId: item.productId,
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

          if (updatedVariant.count !== 1) {
            throw new InventoryUnavailableError(order.id, [
              item.variantLabel
                ? `${item.productName} - ${item.variantLabel}`
                : item.productName,
            ]);
          }

          continue;
        }

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

      const paidOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          customerName: session.customer_details?.name ?? order.customerName,
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

      return { order: paidOrder, newlyPaid: true };
    });

    if (result.newlyPaid && result.order) {
      try {
        await sendPaidOrderNotifications(result.order);
      } catch (error) {
        console.error("Paid order notifications failed", {
          orderId: result.order.id,
          error,
        });
      }
    }

    console.info("[CHECKOUT_FULFILLMENT_COMPLETED]", {
      sessionId: session.id,
      orderId,
      orderStatus: result.order?.status ?? null,
      newlyPaid: result.newlyPaid,
      duplicate: !result.newlyPaid,
    });

    return result.order;
  } catch (error) {
    if (error instanceof InventoryUnavailableError) {
      const result = await markPaidForInventoryReview(
        error.orderId,
        session,
        error.productNames,
      );

      if (result.newlyPaid && result.order) {
        try {
          await sendPaidOrderNotifications(result.order);
        } catch (notificationError) {
          console.error("Paid order notifications failed", {
            orderId: result.order.id,
            error: notificationError,
          });
        }
      }

      console.info("[CHECKOUT_FULFILLMENT_COMPLETED]", {
        sessionId: session.id,
        orderId: error.orderId,
        orderStatus: result.order?.status ?? null,
        newlyPaid: result.newlyPaid,
        duplicate: !result.newlyPaid,
        inventoryReviewRequired: true,
      });

      return result.order;
    }

    throw error;
  }
}
