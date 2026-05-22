import type { GenerationInput, AppOverview, AgentResult } from "@/types";
import { BaseAgent } from "./base.agent";
import { callAgentClaude } from "@/lib/agents";

export class PlannerAgent extends BaseAgent<GenerationInput, AppOverview> {
  name = "PlannerAgent";
  systemPrompt = `You are a senior SaaS product architect. Given a startup idea, return ONLY a valid JSON object — no markdown, no explanation, no code fences. Use this exact shape:
{
  "name": "string",
  "tagline": "string",
  "description": "string (2-3 sentences)",
  "industry": "string",
  "target_audience": "string",
  "key_differentiators": ["string x5"],
  "tech_stack": {
    "frontend": ["string"],
    "backend": ["string"],
    "database": ["string"],
    "auth": ["string"],
    "payments": ["string"],
    "deployment": ["string"],
    "ai": ["string"]
  }
}`;

  async run(input: GenerationInput): Promise<AgentResult<AppOverview>> {
    const raw = await callAgentClaude(
      this.systemPrompt,
      `Startup idea: "${input.prompt}"\nIndustry: ${input.industry}\nPricing: ${input.pricing_model}\nFeatures: ${input.features.join(", ")}`
    );
    return this.success(JSON.parse(raw) as AppOverview);
  }

  private mock(input: GenerationInput): AppOverview {
    const name = input.startup_name ?? this.inferName(input.prompt);
    return {
      name,
      tagline: `The smartest way to ${input.prompt.split(" ").slice(0, 5).join(" ").toLowerCase()}`,
      description: `${name} is a modern ${input.industry} SaaS platform that helps businesses ${input.prompt.toLowerCase()}. Built with a scalable architecture, it offers seamless onboarding, powerful analytics, and a subscription-first business model.`,
      industry: input.industry,
      target_audience: `SMBs and startups in the ${input.industry} space looking to automate and scale`,
      key_differentiators: [
        "AI-powered workflows that cut manual effort by 80%",
        "One-click Stripe billing with smart dunning management",
        "Real-time analytics dashboard with actionable insights",
        "Mobile-first responsive design with offline support",
        "Open API with webhooks for deep integrations",
      ],
      tech_stack: {
        frontend: ["Next.js 15", "TypeScript", "Tailwind CSS", "Framer Motion"],
        backend: ["Next.js API Routes", "Node.js", "Prisma ORM"],
        database: ["PostgreSQL (Supabase)", "Redis (caching)"],
        auth: ["Supabase Auth", "JWT", "OAuth (Google, GitHub)"],
        payments: ["Stripe Subscriptions", "Stripe Webhooks", "Stripe Portal"],
        deployment: ["Vercel", "Supabase", "GitHub Actions CI/CD"],
        ai: ["Anthropic Claude API", "Modular Agent Architecture"],
      },
    };
  }

  private inferName(prompt: string): string {
    const words = prompt.split(" ").filter((w) => w.length > 3);
    const root = words[0] ?? "Launch";
    return `${root.charAt(0).toUpperCase() + root.slice(1)}AI`;
  }
}
