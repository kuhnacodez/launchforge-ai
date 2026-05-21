"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Zap, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PRICING_PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel anytime from your billing dashboard — no questions asked. Your access continues until the end of your billing period.",
  },
  {
    q: "What counts as a generation?",
    a: "Each time you click 'Generate SaaS Blueprint', that uses one generation. Editing your input and re-generating counts as a new generation.",
  },
  {
    q: "Can I export my blueprints?",
    a: "Free tier supports JSON export. Pro adds PDF and Markdown. Enterprise adds Figma-ready specs.",
  },
  {
    q: "Is there a trial for Pro?",
    a: "Pro starts with a 7-day free trial — no credit card required. You can upgrade mid-trial without losing access.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we offer a 14-day money-back guarantee for all paid plans. Contact support and we'll process it same day.",
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleUpgrade = async (planId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId, billing_period: billingPeriod }),
      });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-violet-600/8 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="violet" className="mb-4 px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Simple, transparent pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Start free.{" "}
              <span className="gradient-text">Scale as you grow.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              No hidden fees. No feature locks. Every plan includes real AI-generated blueprints.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center rounded-xl bg-muted p-1 gap-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "rounded-lg px-5 py-2 text-sm font-medium transition-all",
                  billingPeriod === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={cn(
                  "rounded-lg px-5 py-2 text-sm font-medium transition-all flex items-center gap-2",
                  billingPeriod === "yearly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Yearly
                <Badge variant="success" className="text-xs">Save 15%</Badge>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card
                  className={cn(
                    "h-full relative overflow-hidden",
                    plan.highlighted
                      ? "border-violet-500 shadow-2xl shadow-violet-500/15 bg-gradient-to-b from-violet-500/5 to-transparent"
                      : "border-border/50"
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
                  )}
                  <CardContent className="p-8">
                    {plan.highlighted && (
                      <Badge variant="violet" className="mb-4">Most Popular</Badge>
                    )}

                    <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                    <p className="text-sm text-muted-foreground mb-6">{plan.tagline}</p>

                    <div className="mb-6">
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold">
                          ${billingPeriod === "monthly" ? plan.price_monthly : Math.round(plan.price_yearly / 12)}
                        </span>
                        <span className="text-muted-foreground mb-1">/month</span>
                      </div>
                      {billingPeriod === "yearly" && plan.price_yearly > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Billed ${plan.price_yearly} yearly
                        </p>
                      )}
                    </div>

                    <Button
                      variant={plan.highlighted ? "gradient" : "outline"}
                      className="w-full mb-6"
                      disabled={checkoutLoading !== null}
                      onClick={() => {
                        if (plan.tier === "free") { router.push("/signup"); return; }
                        if (plan.tier === "enterprise") { router.push("/contact"); return; }
                        handleUpgrade(plan.tier);
                      }}
                    >
                      {checkoutLoading === plan.tier ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redirecting...</>
                      ) : plan.cta}
                    </Button>

                    <Separator className="mb-6" />

                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check className={cn(
                            "h-4 w-4 mt-0.5 flex-shrink-0",
                            plan.highlighted ? "text-violet-400" : "text-emerald-400"
                          )} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="h-8 w-8 mx-auto text-violet-400 mb-4" />
            <h2 className="text-3xl font-bold tracking-tight mb-2">Frequently asked questions</h2>
          </div>

          <div className="space-y-6">
            {FAQ.map((item, i) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl border border-border/50 p-6"
              >
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
