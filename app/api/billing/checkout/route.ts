import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { plan_id, billing_period } = await req.json();

    if (!plan_id || !billing_period) {
      return NextResponse.json({ error: "plan_id and billing_period required" }, { status: 400 });
    }

    // TODO: Replace with real Stripe Checkout Session creation
    // const { stripe } = await import("@/lib/stripe");
    // const session = await stripe.checkout.sessions.create({
    //   mode: "subscription",
    //   payment_method_types: ["card"],
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    // });
    // return NextResponse.json({ checkout_url: session.url });

    return NextResponse.json({
      checkout_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/pricing?demo=true`,
    });
  } catch (error) {
    console.error("[POST /api/billing/checkout]", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
