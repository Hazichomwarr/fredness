// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillCheckoutSession } from "@/src/lib/checkout/fulfillment";
import { getStripe } from "@/src/lib/stripe/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  console.info("[STRIPE_WEBHOOK_REQUEST_RECEIVED]", {
    signaturePresent: Boolean(signature),
  });

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    const payload = await request.text();
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
    console.info("[STRIPE_WEBHOOK_SIGNATURE_VERIFIED]", {
      eventId: event.id,
      eventType: event.type,
    });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_SIGNATURE_FAILED]", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid Stripe webhook payload",
      },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId ?? null;

    console.info("[STRIPE_CHECKOUT_COMPLETED_RECEIVED]", {
      eventId: event.id,
      sessionId: session.id,
      orderId,
      paymentStatus: session.payment_status,
    });

    await fulfillCheckoutSession(session);

    console.info("[STRIPE_CHECKOUT_COMPLETED_PROCESSED]", {
      eventId: event.id,
      sessionId: session.id,
      orderId,
    });
  }

  return NextResponse.json({ received: true });
}
