import type { GenerationInput, StripePlan, AgentResult } from "@/types";
import { BaseAgent } from "./base.agent";
import { callAgentClaude } from "@/lib/agents";

export class StripeAgent extends BaseAgent<GenerationInput, StripePlan[]> {
  name = "StripeAgent";
  systemPrompt = `You are a Stripe billing architect. Design subscription pricing tiers for the given SaaS. Return ONLY a valid JSON array — no markdown, no explanation. Each element:
{
  "name": "string",
  "price_monthly": number (cents, e.g. 2900 = $29),
  "price_yearly": number (cents),
  "features": ["string"],
  "limits": { "key": "value" },
  "stripe_product_id": "prod_placeholder_name"
}`;

  async run(input: GenerationInput): Promise<AgentResult<StripePlan[]>> {
    const raw = await callAgentClaude(
      this.systemPrompt,
      `Startup: "${input.prompt}"\nIndustry: ${input.industry}\nPricing model: ${input.pricing_model}\nFeatures: ${input.features.join(", ")}`
    );
    return this.success(JSON.parse(raw) as StripePlan[]);
  }

  private mock(input: GenerationInput): StripePlan[] {
    const isFreemium = input.pricing_model === "freemium";
    return [
      { name: "Starter", price_monthly: isFreemium ? 0 : 990, price_yearly: isFreemium ? 0 : 8910, features: ["Core features", "Up to 100 users", "5GB storage", "Email support", "Basic analytics"], limits: { users: 100, storage_gb: 5, support: "email" }, stripe_product_id: "prod_starter" },
      { name: "Growth", price_monthly: 2900, price_yearly: 26100, features: ["Everything in Starter", "Up to 1,000 users", "50GB storage", "Priority support", "Advanced analytics", "Custom domain", "Webhooks"], limits: { users: 1000, storage_gb: 50, support: "priority" }, stripe_product_id: "prod_growth" },
      { name: "Scale", price_monthly: 9900, price_yearly: 89100, features: ["Everything in Growth", "Unlimited users", "500GB storage", "Dedicated support", "White-label", "SSO & SAML", "99.99% SLA"], limits: { users: "unlimited", storage_gb: 500, support: "dedicated" }, stripe_product_id: "prod_scale" },
    ];
  }
}
