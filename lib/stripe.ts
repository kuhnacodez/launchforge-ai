import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    generations: 3,
    price_monthly: 0,
    price_yearly: 0,
  },
  pro: {
    name: "Pro",
    generations: 50,
    price_monthly: 2900,
    price_yearly: 24900,
    stripe_price_id_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripe_price_id_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
  enterprise: {
    name: "Enterprise",
    generations: -1, // unlimited
    price_monthly: 9900,
    price_yearly: 99900,
    stripe_price_id_monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
  },
} as const;
