import { NextResponse } from "next/server";

export async function POST() {
  try {
    // TODO: Replace with real Stripe portal session
    // const { stripe } = await import("@/lib/stripe");
    // const session = await stripe.billingPortal.sessions.create({
    //   customer: user.stripe_customer_id,
    //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    // });
    // return NextResponse.json({ portal_url: session.url });

    return NextResponse.json({
      portal_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/profile`,
    });
  } catch (error) {
    console.error("[POST /api/billing/portal]", error);
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
