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

type PaidOrderWithItems = Order & {
  items: OrderItem[];
};

type EmailNotificationType = "ADMIN" | "CUSTOMER";

export type EmailNotificationResult =
  | {
      type: EmailNotificationType;
      status: "ACCEPTED";
      recipient: string;
      resendEmailId: string;
    }
  | {
      type: EmailNotificationType;
      status: "FAILED";
      recipient: string;
      errorName: string;
      errorMessage: string;
      statusCode?: number;
    }
  | {
      type: EmailNotificationType;
      status: "SKIPPED";
      reason: string;
    };

export type PaidOrderNotificationResult = {
  admin: EmailNotificationResult;
  customer: EmailNotificationResult;
};

type NotificationContext = {
  orderId: string;
  checkoutSessionId: string | null;
};

type NotificationEnvironment = {
  resendApiKeyPresent: boolean;
  fromEmail: string | null;
  adminEmail: string | null;
};

function maskEmail(email: string) {
  const [localPart, domain] = email.trim().split("@");

  if (!localPart || !domain) {
    return "[invalid email]";
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function notificationEnvironment(): NotificationEnvironment {
  return {
    resendApiKeyPresent: Boolean(process.env.RESEND_API_KEY?.trim()),
    fromEmail: process.env.QUOTE_FROM_EMAIL?.trim() || null,
    adminEmail: process.env.QUOTE_ADMIN_EMAIL?.trim() || null,
  };
}

function failedResult({
  context,
  type,
  recipient,
  error,
}: {
  context: NotificationContext;
  type: EmailNotificationType;
  recipient: string;
  error: unknown;
}): EmailNotificationResult {
  const errorRecord =
    typeof error === "object" && error !== null
      ? (error as Record<string, unknown>)
      : null;
  const errorName =
    typeof errorRecord?.name === "string"
      ? errorRecord.name
      : error instanceof Error
        ? error.name
        : "EmailNotificationError";
  const errorMessage =
    typeof errorRecord?.message === "string"
      ? errorRecord.message
      : error instanceof Error
        ? error.message
        : String(error);
  const rawStatusCode = errorRecord?.statusCode ?? errorRecord?.status;
  const statusCode =
    typeof rawStatusCode === "number" ? rawStatusCode : undefined;
  const result: EmailNotificationResult = {
    type,
    status: "FAILED",
    recipient: maskEmail(recipient),
    errorName,
    errorMessage,
    ...(statusCode === undefined ? {} : { statusCode }),
  };

  console.error("[ORDER_EMAIL_FAILED]", {
    ...context,
    notificationType: type,
    recipient: result.recipient,
    errorName,
    errorMessage,
    ...(statusCode === undefined ? {} : { statusCode }),
  });

  return result;
}

function skippedResult({
  context,
  type,
  reason,
}: {
  context: NotificationContext;
  type: EmailNotificationType;
  reason: string;
}): EmailNotificationResult {
  const result: EmailNotificationResult = {
    type,
    status: "SKIPPED",
    reason,
  };

  console.info(
    type === "ADMIN"
      ? "[ORDER_ADMIN_EMAIL_SKIPPED]"
      : "[ORDER_CUSTOMER_EMAIL_SKIPPED]",
    {
      ...context,
      notificationType: type,
      reason,
    },
  );

  return result;
}

function acceptedResult({
  context,
  type,
  recipient,
  resendEmailId,
}: {
  context: NotificationContext;
  type: EmailNotificationType;
  recipient: string;
  resendEmailId: string;
}): EmailNotificationResult {
  const result: EmailNotificationResult = {
    type,
    status: "ACCEPTED",
    recipient: maskEmail(recipient),
    resendEmailId,
  };

  console.info(
    type === "ADMIN"
      ? "[ORDER_ADMIN_EMAIL_ACCEPTED]"
      : "[ORDER_CUSTOMER_EMAIL_ACCEPTED]",
    {
      ...context,
      notificationType: type,
      recipient: result.recipient,
      resendEmailId,
    },
  );

  return result;
}

function missingEnvironmentResult({
  context,
  type,
  recipient,
  variableName,
}: {
  context: NotificationContext;
  type: EmailNotificationType;
  recipient: string;
  variableName: "RESEND_API_KEY" | "QUOTE_FROM_EMAIL";
}) {
  return failedResult({
    context,
    type,
    recipient,
    error: {
      name: "MissingEnvironmentVariable",
      message: `${variableName} is not configured`,
    },
  });
}

async function sendCustomerOrderConfirmation({
  order,
  customerEmail,
  context,
  environment,
}: {
  order: PaidOrderWithItems;
  customerEmail: string;
  context: NotificationContext;
  environment: NotificationEnvironment;
}): Promise<EmailNotificationResult> {
  if (!isEmail(customerEmail)) {
    return skippedResult({
      context,
      type: "CUSTOMER",
      reason: "Invalid customer email configuration",
    });
  }

  if (!environment.resendApiKeyPresent) {
    return missingEnvironmentResult({
      context,
      type: "CUSTOMER",
      recipient: customerEmail,
      variableName: "RESEND_API_KEY",
    });
  }

  if (!environment.fromEmail) {
    return missingEnvironmentResult({
      context,
      type: "CUSTOMER",
      recipient: customerEmail,
      variableName: "QUOTE_FROM_EMAIL",
    });
  }

  const payload = orderEmailPayload(order);

  try {
    const result = await resend.emails.send({
      from: environment.fromEmail,
      to: customerEmail,
      subject: "Your Frednes Wholesale order has been received",
      react: CustomerOrderConfirmationEmail(payload),
      text: customerOrderConfirmationText(payload),
    });

    if (result.error) {
      return failedResult({
        context,
        type: "CUSTOMER",
        recipient: customerEmail,
        error: result.error,
      });
    }

    if (!result.data?.id) {
      return failedResult({
        context,
        type: "CUSTOMER",
        recipient: customerEmail,
        error: {
          name: "MissingResendEmailId",
          message: "Resend returned no error and no email ID",
        },
      });
    }

    return acceptedResult({
      context,
      type: "CUSTOMER",
      recipient: customerEmail,
      resendEmailId: result.data.id,
    });
  } catch (error) {
    return failedResult({
      context,
      type: "CUSTOMER",
      recipient: customerEmail,
      error,
    });
  }
}

async function sendAdminOrderNotification({
  order,
  context,
  environment,
}: {
  order: PaidOrderWithItems;
  context: NotificationContext;
  environment: NotificationEnvironment;
}): Promise<EmailNotificationResult> {
  const adminEmail = environment.adminEmail;

  if (!adminEmail) {
    return skippedResult({
      context,
      type: "ADMIN",
      reason: "QUOTE_ADMIN_EMAIL is not configured",
    });
  }

  if (!isEmail(adminEmail)) {
    return skippedResult({
      context,
      type: "ADMIN",
      reason: "Invalid admin email configuration",
    });
  }

  if (!environment.resendApiKeyPresent) {
    return missingEnvironmentResult({
      context,
      type: "ADMIN",
      recipient: adminEmail,
      variableName: "RESEND_API_KEY",
    });
  }

  if (!environment.fromEmail) {
    return missingEnvironmentResult({
      context,
      type: "ADMIN",
      recipient: adminEmail,
      variableName: "QUOTE_FROM_EMAIL",
    });
  }

  const payload = orderEmailPayload(order);

  try {
    const result = await resend.emails.send({
      from: environment.fromEmail,
      to: adminEmail,
      subject: "New Paid Order",
      replyTo: order.customerEmail?.trim() || undefined,
      react: AdminOrderNotificationEmail(payload),
      text: adminOrderNotificationText(payload),
    });

    if (result.error) {
      return failedResult({
        context,
        type: "ADMIN",
        recipient: adminEmail,
        error: result.error,
      });
    }

    if (!result.data?.id) {
      return failedResult({
        context,
        type: "ADMIN",
        recipient: adminEmail,
        error: {
          name: "MissingResendEmailId",
          message: "Resend returned no error and no email ID",
        },
      });
    }

    return acceptedResult({
      context,
      type: "ADMIN",
      recipient: adminEmail,
      resendEmailId: result.data.id,
    });
  } catch (error) {
    return failedResult({
      context,
      type: "ADMIN",
      recipient: adminEmail,
      error,
    });
  }
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

export async function sendPaidOrderNotifications(
  order: PaidOrderWithItems,
): Promise<PaidOrderNotificationResult> {
  const customerEmail = order.customerEmail?.trim() || null;
  const context: NotificationContext = {
    orderId: order.id,
    checkoutSessionId: order.stripeCheckoutSession,
  };
  const environment = notificationEnvironment();

  console.info("[ORDER_NOTIFICATION_ENVIRONMENT]", {
    ...context,
    RESEND_API_KEY: environment.resendApiKeyPresent,
    QUOTE_ADMIN_EMAIL: Boolean(environment.adminEmail),
    QUOTE_FROM_EMAIL: Boolean(environment.fromEmail),
  });

  const customerPromise = customerEmail
    ? sendCustomerOrderConfirmation({
        order,
        customerEmail,
        context,
        environment,
      })
    : Promise.resolve(
        skippedResult({
          context,
          type: "CUSTOMER",
          reason: "Customer email missing",
        }),
      );
  const [admin, customer] = await Promise.all([
    sendAdminOrderNotification({ order, context, environment }),
    customerPromise,
  ]);
  const result: PaidOrderNotificationResult = {
    admin,
    customer,
  };

  console.info("[ORDER_NOTIFICATIONS_COMPLETED]", {
    ...context,
    admin,
    customer,
    acceptedResendEmailIds: [admin, customer].flatMap((notification) =>
      notification.status === "ACCEPTED"
        ? [notification.resendEmailId]
        : [],
    ),
  });

  return result;
}
