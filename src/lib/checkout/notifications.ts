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

async function sendCustomerOrderConfirmation(order: PaidOrderWithItems) {
  const payload = orderEmailPayload(order);

  const result = await resend.emails.send({
    from: orderEmailFrom,
    to: order.customerEmail,
    subject: "Your Frednes Wholesale order has been received",
    react: CustomerOrderConfirmationEmail(payload),
    text: customerOrderConfirmationText(payload),
  });

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

async function sendAdminOrderNotification(order: PaidOrderWithItems) {
  const adminEmail = process.env.QUOTE_ADMIN_EMAIL;

  if (!adminEmail) {
    console.info("Admin notification email skipped", {
      orderId: order.id,
      reason: "QUOTE_ADMIN_EMAIL is not configured",
    });
    return;
  }

  const payload = orderEmailPayload(order);

  const result = await resend.emails.send({
    from: orderEmailFrom,
    to: adminEmail,
    subject: "New Paid Order",
    replyTo: order.customerEmail,
    react: AdminOrderNotificationEmail(payload),
    text: adminOrderNotificationText(payload),
  });

  if (result.error) {
    throw result.error;
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

function logRejectedEmail(
  label: "Customer confirmation email" | "Admin notification email",
  orderId: string,
  result: PromiseSettledResult<unknown>,
) {
  if (result.status === "rejected") {
    console.error(`${label} failed`, {
      orderId,
      error: result.reason,
    });
  }
}

export async function sendPaidOrderNotifications(order: PaidOrderWithItems) {
  const [customerResult, adminResult] = await Promise.allSettled([
    sendCustomerOrderConfirmation(order),
    sendAdminOrderNotification(order),
  ]);

  logRejectedEmail("Customer confirmation email", order.id, customerResult);
  logRejectedEmail("Admin notification email", order.id, adminResult);
}
