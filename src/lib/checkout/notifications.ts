import "server-only";

import type { Order, OrderItem } from "@prisma/client";
import {
  AdminOrderNotificationEmail,
  adminOrderNotificationText,
} from "@/src/emails/admin-order-notification";
import {
  CustomerOrderConfirmationEmail,
  customerOrderConfirmationText,
} from "@/src/emails/customer-order-confirmation";
import { resend } from "@/src/lib/email/resend";

const orderEmailFrom = process.env.QUOTE_FROM_EMAIL!;

type PaidOrderWithItems = Order & {
  items: OrderItem[];
};

async function sendCustomerOrderConfirmation(
  order: PaidOrderWithItems,
  customerEmail: string,
) {
  const payload = orderEmailPayload(order);
  const result = await resend.emails.send({
    from: orderEmailFrom,
    to: customerEmail,
    subject: "Your Frednes Wholesale order has been received",
    react: CustomerOrderConfirmationEmail(payload),
    text: customerOrderConfirmationText(payload),
  });

  console.log("ORDER_CUSTOMER_RESEND_RESULT", {
    orderId: order.id,
    checkoutSessionId: order.stripeCheckoutSession,
    resendEmailId: result.data?.id ?? null,
    error: result.error
      ? {
          name: result.error.name,
          message: result.error.message,
          statusCode: result.error.statusCode,
        }
      : null,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

async function sendAdminOrderNotification(order: PaidOrderWithItems) {
  const adminEmail = process.env.QUOTE_ADMIN_EMAIL?.trim();

  if (!adminEmail) {
    console.info("ORDER_ADMIN_RESEND_SKIPPED", {
      orderId: order.id,
      checkoutSessionId: order.stripeCheckoutSession,
      reason: "QUOTE_ADMIN_EMAIL is not configured",
    });
    return null;
  }

  const payload = orderEmailPayload(order);
  const result = await resend.emails.send({
    from: orderEmailFrom,
    to: adminEmail,
    subject: "New Paid Order",
    replyTo: order.customerEmail?.trim() || undefined,
    react: AdminOrderNotificationEmail(payload),
    text: adminOrderNotificationText(payload),
  });

  console.log("ORDER_ADMIN_RESEND_RESULT", {
    orderId: order.id,
    checkoutSessionId: order.stripeCheckoutSession,
    resendEmailId: result.data?.id ?? null,
    error: result.error
      ? {
          name: result.error.name,
          message: result.error.message,
          statusCode: result.error.statusCode,
        }
      : null,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

function orderEmailPayload(order: PaidOrderWithItems) {
  return {
    orderId: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    city: order.city,
    state: order.state,
    zipCode: order.zipCode,
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,
    stripePaymentIntent: order.stripePaymentIntent,
  };
}

export async function sendPaidOrderNotifications(order: PaidOrderWithItems) {
  const customerEmail = order.customerEmail?.trim() || null;

  if (!customerEmail) {
    console.info("ORDER_CUSTOMER_RESEND_SKIPPED", {
      orderId: order.id,
      checkoutSessionId: order.stripeCheckoutSession,
      reason: "Customer email missing",
    });
  }

  const [adminResult, customerResult] = await Promise.allSettled([
    sendAdminOrderNotification(order),
    customerEmail
      ? sendCustomerOrderConfirmation(order, customerEmail)
      : Promise.resolve(null),
  ]);

  console.log("ORDER_NOTIFICATION_RESULTS", {
    orderId: order.id,
    admin: adminResult.status,
    customer: customerResult.status,
  });
}
