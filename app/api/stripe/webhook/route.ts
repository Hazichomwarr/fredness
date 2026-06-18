// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillCheckoutSession } from "@/src/lib/checkout/fulfillment";
import { getStripe } from "@/src/lib/stripe/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

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
  } catch (error) {
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
    await fulfillCheckoutSession(event.data.object);
  }

  return NextResponse.json({ received: true });
}
