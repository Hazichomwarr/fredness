// src/lib/email/quote-confirmation.ts
import "server-only";

type QuoteConfirmationItem = {
  productName: string;
  sku: string;
  quantity: number;
};

type QuoteConfirmationEmail = {
  quoteId: string;
  to: string;
  name: string;
  businessName: string;
  items: QuoteConfirmationItem[];
};

type QuoteOwnerNotificationEmail = Omit<QuoteConfirmationEmail, "to"> & {
  email: string;
  phone: string | null;
  message: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function quoteSummaryText(payload: QuoteConfirmationEmail) {
  const lines = payload.items.map(
    (item) => `- ${item.productName} (${item.sku}) x ${item.quantity}`,
  );

  return [
    `Hi ${payload.name},`,
    "",
    "Thanks for requesting a wholesale quote from Frednes International Market.",
    `Quote reference: ${payload.quoteId.slice(-8).toUpperCase()}`,
    `Business: ${payload.businessName}`,
    "",
    "Requested products:",
    ...lines,
    "",
    "Our team will review your request and contact you with pricing and availability.",
  ].join("\n");
}

function quoteSummaryHtml(payload: QuoteConfirmationEmail) {
  const items = payload.items
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.productName)}</strong> (${escapeHtml(
          item.sku,
        )}) x ${item.quantity}</li>`,
    )
    .join("");

  return `
    <div>
      <p>Hi ${escapeHtml(payload.name)},</p>
      <p>Thanks for requesting a wholesale quote from Frednes International Market.</p>
      <p><strong>Quote reference:</strong> ${escapeHtml(
        payload.quoteId.slice(-8).toUpperCase(),
      )}</p>
      <p><strong>Business:</strong> ${escapeHtml(payload.businessName)}</p>
      <p><strong>Requested products:</strong></p>
      <ul>${items}</ul>
      <p>Our team will review your request and contact you with pricing and availability.</p>
    </div>
  `;
}

function ownerSummaryText(payload: QuoteOwnerNotificationEmail) {
  const lines = payload.items.map(
    (item) => `- ${item.productName} (${item.sku}) x ${item.quantity}`,
  );

  return [
    "New wholesale quote request",
    "",
    `Quote reference: ${payload.quoteId.slice(-8).toUpperCase()}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone ?? "Not provided"}`,
    `Business: ${payload.businessName}`,
    `Message: ${payload.message ?? "No message provided"}`,
    "",
    "Requested products:",
    ...lines,
  ].join("\n");
}

function ownerSummaryHtml(payload: QuoteOwnerNotificationEmail) {
  const items = payload.items
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.productName)}</strong> (${escapeHtml(
          item.sku,
        )}) x ${item.quantity}</li>`,
    )
    .join("");

  return `
    <div>
      <h1>New wholesale quote request</h1>
      <p><strong>Quote reference:</strong> ${escapeHtml(
        payload.quoteId.slice(-8).toUpperCase(),
      )}</p>
      <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(payload.phone ?? "Not provided")}</p>
      <p><strong>Business:</strong> ${escapeHtml(payload.businessName)}</p>
      <p><strong>Message:</strong> ${escapeHtml(
        payload.message ?? "No message provided",
      )}</p>
      <p><strong>Requested products:</strong></p>
      <ul>${items}</ul>
    </div>
  `;
}

async function sendResendEmail({
  to,
  subject,
  text,
  html,
  logLabel,
  quoteId,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
  logLabel: string;
  quoteId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.QUOTE_FROM_EMAIL;

  if (!apiKey || !from) {
    console.info(`${logLabel} skipped`, {
      quoteId,
      to,
    });
    return { sent: false };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      console.error(`${logLabel} failed`, {
        quoteId,
        status: response.status,
      });
      return { sent: false };
    }

    return { sent: true };
  } catch (error) {
    console.error(`${logLabel} failed`, error);
    return { sent: false };
  }
}

export async function sendQuoteConfirmationEmail(
  payload: QuoteConfirmationEmail,
) {
  return sendResendEmail({
    to: payload.to,
    subject: "We received your Frednes wholesale quote request",
    text: quoteSummaryText(payload),
    html: quoteSummaryHtml(payload),
    logLabel: "Quote confirmation email",
    quoteId: payload.quoteId,
  });
}

export async function sendQuoteOwnerNotificationEmail(
  payload: QuoteOwnerNotificationEmail,
) {
  const ownerEmail = process.env.QUOTE_OWNER_EMAIL;

  if (!ownerEmail) {
    console.info("Quote owner notification skipped", {
      quoteId: payload.quoteId,
    });
    return { sent: false };
  }

  return sendResendEmail({
    to: ownerEmail,
    subject: `New wholesale quote request from ${payload.businessName}`,
    text: ownerSummaryText(payload),
    html: ownerSummaryHtml(payload),
    logLabel: "Quote owner notification",
    quoteId: payload.quoteId,
  });
}
