import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

const TIER_LIMITS: Record<string, number> = {
  pro: 50,
  enterprise: -1,
  free: 3,
};

function tierFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID) return "enterprise";
  return "free";
}

async function upsertSubscription(supabase: Awaited<ReturnType<typeof createServerClient>>, subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price.id ?? "";
  const tier = tierFromPriceId(priceId);
  const limit = TIER_LIMITS[tier] ?? 3;

  await supabase.from("profiles").update({
    subscription_tier: tier,
    generations_limit: limit,
    stripe_customer_id: subscription.customer as string,
  }).eq("id", userId);
}

async function cancelSubscription(supabase: Awaited<ReturnType<typeof createServerClient>>, subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  if (!userId) return;

  await supabase.from("profiles").update({
    subscription_tier: "free",
    generations_limit: 3,
  }).eq("id", userId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServerClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(supabase, subscription);
        }
        break;
      }
      case "customer.subscription.updated":
        await upsertSubscription(supabase, event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await cancelSubscription(supabase, event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("[Stripe Webhook] Payment failed for customer:", invoice.customer);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
