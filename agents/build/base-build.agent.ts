import { callAgentClaude } from "@/lib/agents";
import type { GenerationOutput } from "@/types";

export interface GeneratedFile {
  path: string;
  content: string;
}

export abstract class BaseBuildAgent {
  abstract name: string;
  abstract label: string;

  protected async generate(systemPrompt: string, userMessage: string): Promise<string> {
    return callAgentClaude(systemPrompt, userMessage);
  }

  protected context(output: GenerationOutput): string {
    return `
App Name: ${output.overview.name}
Tagline: ${output.overview.tagline}
Description: ${output.overview.description}
Industry: ${output.overview.industry}
Target Audience: ${output.overview.target_audience}
Key Differentiators: ${output.overview.key_differentiators.join(", ")}
Tech Stack: Next.js, TypeScript, Tailwind CSS, Supabase Auth, Prisma ORM, Stripe, Anthropic Claude
Pages: ${output.pages.map(p => `${p.name} (${p.path})`).join(", ")}
DB Tables: ${output.database_schema.map(t => `${t.name}(${t.columns?.map((c: {name:string}) => c.name).join(",")})`).join(", ")}
API Routes: ${output.api_routes.map(r => `${r.method} ${r.path}`).join(", ")}
Stripe Plans: ${output.stripe_plans.map(p => p.name).join(", ")}
    `.trim();
  }

  abstract run(output: GenerationOutput): Promise<GeneratedFile[]>;
}
