import { NextRequest, NextResponse } from "next/server";

// Stripe webhook handler — syncs subscription state to the database
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  try {
    // TODO: Verify webhook signature and handle events
    // const { stripe } = await import("@/lib/stripe");
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    //
    // switch (event.type) {
    //   case "customer.subscription.created":
    //   case "customer.subscription.updated":
    //     await upsertSubscription(event.data.object as Stripe.Subscription);
    //     break;
    //   case "customer.subscription.deleted":
    //     await cancelSubscription(event.data.object as Stripe.Subscription);
    //     break;
    //   case "invoice.payment_failed":
    //     await handlePaymentFailed(event.data.object as Stripe.Invoice);
    //     break;
    // }

    console.log("[Stripe Webhook] Received event:", body.slice(0, 100));
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
