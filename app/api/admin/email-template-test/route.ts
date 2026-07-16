import "server-only";

import type { ReactElement } from "react";
import {
  AdminOrderNotificationEmail,
  adminOrderNotificationText,
} from "@/src/emails/admin-order-notification";
import {
  CustomerOrderConfirmationEmail,
  customerOrderConfirmationText,
} from "@/src/emails/customer-order-confirmation";
import { getAdminSession } from "@/src/lib/auth/admin";
import { orderEmailPayload } from "@/src/lib/checkout/notifications";
import { resend } from "@/src/lib/email/resend";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";

type TemplateTestResult = {
  payload: "succeeded" | "failed";
  react: "succeeded" | "failed" | "not-run";
  text: "succeeded" | "failed" | "not-run";
  stage: "resend-returned" | "exception";
  resendEmailId: string | null;
  error: ReturnType<typeof serializeError> | null;
};

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      statusCode:
        "statusCode" in error && typeof error.statusCode === "number"
          ? error.statusCode
          : null,
    };
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;

    return {
      name: typeof record.name === "string" ? record.name : "UnknownError",
      message:
        typeof record.message === "string" ? record.message : String(error),
      statusCode:
        typeof record.statusCode === "number" ? record.statusCode : null,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
    statusCode: null,
  };
}

function valueShape(value: unknown) {
  return {
    type: typeof value,
    null: value === null,
    constructor:
      typeof value === "object" && value !== null
        ? value.constructor.name
        : null,
  };
}

async function testTemplate({
  createReact,
  createText,
  from,
  order,
  replyTo,
  subject,
  to,
}: {
  createReact: (
    payload: ReturnType<typeof orderEmailPayload>,
  ) => ReactElement;
  createText: (payload: ReturnType<typeof orderEmailPayload>) => string;
  from: string;
  order: Parameters<typeof orderEmailPayload>[0];
  replyTo?: string;
  subject: string;
  to: string;
}): Promise<TemplateTestResult> {
  let payloadStatus: TemplateTestResult["payload"] = "failed";
  let reactStatus: TemplateTestResult["react"] = "not-run";
  let textStatus: TemplateTestResult["text"] = "not-run";

  try {
    const payload = orderEmailPayload(order);
    payloadStatus = "succeeded";

    const reactEmail = createReact(payload);
    reactStatus = "succeeded";

    const textEmail = createText(payload);
    textStatus = "succeeded";

    const result = await resend.emails.send({
      from,
      to,
      subject,
      react: reactEmail,
      text: textEmail,
      ...(replyTo ? { replyTo } : {}),
    });

    return {
      payload: payloadStatus,
      react: reactStatus,
      text: textStatus,
      stage: "resend-returned",
      resendEmailId: result.data?.id ?? null,
      error: result.error ? serializeError(result.error) : null,
    };
  } catch (error) {
    return {
      payload: payloadStatus,
      react: reactStatus,
      text: textStatus,
      stage: "exception",
      resendEmailId: null,
      error: serializeError(error),
    };
  }
}

export async function POST(request: Request) {
  const diagnosticSecret = request.headers.get("x-diagnostic-secret");
  const secretAuthorized = Boolean(
    process.env.AUTH_SECRET &&
      diagnosticSecret &&
      diagnosticSecret === process.env.AUTH_SECRET,
  );
  const adminSession = secretAuthorized ? null : await getAdminSession();

  if (!secretAuthorized && !adminSession) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const from = process.env.QUOTE_FROM_EMAIL?.trim();
  const adminEmail = process.env.QUOTE_ADMIN_EMAIL?.trim();

  if (!from || !adminEmail) {
    return Response.json(
      {
        error: "Required email configuration is missing",
        QUOTE_FROM_EMAIL: Boolean(from),
        QUOTE_ADMIN_EMAIL: Boolean(adminEmail),
      },
      { status: 500 },
    );
  }

  const order = await prisma.order.findFirst({
    where: {
      status: "PAID",
      customerEmail: { not: null },
    },
    include: { items: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!order || !order.customerEmail) {
    return Response.json(
      { error: "No paid order with a customer email was found" },
      { status: 404 },
    );
  }

  const payload = orderEmailPayload(order);
  const admin = await testTemplate({
    order,
    from,
    to: adminEmail,
    replyTo: order.customerEmail,
    subject: "Frednes actual admin template test",
    createReact: AdminOrderNotificationEmail,
    createText: adminOrderNotificationText,
  });
  const customer = await testTemplate({
    order,
    from,
    to: order.customerEmail,
    subject: "Frednes actual customer template test",
    createReact: CustomerOrderConfirmationEmail,
    createText: customerOrderConfirmationText,
  });

  return Response.json({
    orderId: order.id,
    admin,
    customer,
    payload: {
      subtotal: valueShape(payload.subtotal),
      tax: valueShape(payload.tax),
      shipping: valueShape(payload.shipping),
      total: valueShape(payload.total),
      itemQuantity: valueShape(payload.items[0]?.quantity),
      itemUnitPrice: valueShape(payload.items[0]?.unitPrice),
      itemLineTotal: valueShape(payload.items[0]?.lineTotal),
      shippingAddress: valueShape(payload.shippingAddress),
      customerName: valueShape(payload.customerName),
      customerEmail: valueShape(payload.customerEmail),
      stripePaymentIntent: valueShape(payload.stripePaymentIntent),
    },
  });
}

export async function GET(request: Request) {
  const result = await POST(request);
  const body = await result.text();
  const escapedBody = body
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  return new Response(`<!doctype html><pre>${escapedBody}</pre>`, {
    status: result.status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
