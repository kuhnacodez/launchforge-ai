import type {
  GenerationInput,
  GenerationOutput,
  DeploymentStep,
  FolderNode,
  ImplementationPhase,
} from "@/types";
import { PlannerAgent } from "./planner.agent";
import { FrontendAgent } from "./frontend.agent";
import { DatabaseAgent } from "./database.agent";
import { BackendAgent } from "./backend.agent";
import { StripeAgent } from "./stripe.agent";
import { generateId } from "@/lib/utils";

// Runs all agents in parallel and merges results
export async function runGenerationPipeline(
  input: GenerationInput
): Promise<GenerationOutput> {
  const [plannerResult, frontendResult, dbResult, backendResult, stripeResult] =
    await Promise.all([
      new PlannerAgent().run(input),
      new FrontendAgent().run(input),
      new DatabaseAgent().run(input),
      new BackendAgent().run(input),
      new StripeAgent().run(input),
    ]);

  if (!plannerResult.success || !plannerResult.data) {
    throw new Error(plannerResult.error ?? "PlannerAgent returned no data");
  }

  const overview = plannerResult.data;
  const pages = frontendResult.data ?? [];
  const database_schema = dbResult.data ?? [];
  const api_routes = backendResult.data ?? [];
  const stripe_plans = stripeResult.data ?? [];

  const deployment_steps = buildDeploymentSteps(input);
  const folder_structure = buildFolderStructure(overview.name);
  const implementation_phases = buildImplementationPhases(input);

  const output: GenerationOutput = {
    id: generateId(),
    created_at: new Date().toISOString(),
    input,
    overview,
    pages,
    database_schema,
    api_routes,
    stripe_plans,
    deployment_steps,
    folder_structure,
    implementation_phases,
    json_export: {
      startup_name: overview.name,
      industry: input.industry,
      features: input.features,
      pages: pages.map((p) => p.name),
      database_tables: database_schema.map((t) => t.name),
      api_routes: api_routes.map((r) => `${r.method} ${r.path}`),
      stripe_plans: stripe_plans.map((p) => p.name),
      tech_stack: overview.tech_stack,
    },
  };

  return output;
}

function buildDeploymentSteps(input: GenerationInput): DeploymentStep[] {
  return [
    {
      step: 1,
      title: "Repository Setup",
      description: "Initialize your Next.js project and push to GitHub",
      commands: [
        "npx create-next-app@latest my-app --typescript --tailwind --app",
        "cd my-app && git init && git remote add origin <your-repo>",
        "git push -u origin main",
      ],
    },
    {
      step: 2,
      title: "Supabase Project",
      description: "Create a Supabase project and configure authentication",
      commands: [
        "# Create project at supabase.com",
        "npm install @supabase/supabase-js @supabase/auth-helpers-nextjs",
        "# Copy SUPABASE_URL and SUPABASE_ANON_KEY to .env.local",
      ],
      env_vars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    },
    {
      step: 3,
      title: "Database Migration",
      description: "Run Prisma migrations against your Supabase PostgreSQL instance",
      commands: [
        "npm install prisma @prisma/client",
        "npx prisma init",
        "npx prisma migrate dev --name init",
        "npx prisma generate",
      ],
      env_vars: ["DATABASE_URL"],
    },
    {
      step: 4,
      title: "Stripe Configuration",
      description: "Set up Stripe products and webhook endpoints",
      commands: [
        "npm install stripe @stripe/stripe-js",
        "# Create products at dashboard.stripe.com",
        "stripe listen --forward-to localhost:3000/api/webhooks/stripe",
      ],
      env_vars: [
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      ],
    },
    {
      step: 5,
      title: "Claude AI Integration",
      description: "Connect the Anthropic Claude API for real AI generation",
      commands: [
        "npm install @anthropic-ai/sdk",
        "# Replace mock agent run() methods with callClaude() calls",
      ],
      env_vars: ["ANTHROPIC_API_KEY"],
    },
    {
      step: 6,
      title: "Deploy to Vercel",
      description: "Connect GitHub repo to Vercel and configure environment variables",
      commands: [
        "npm install -g vercel",
        "vercel --prod",
        "# Add all env vars in Vercel dashboard → Settings → Environment Variables",
      ],
    },
  ];
}

function buildFolderStructure(appName: string): FolderNode {
  return {
    name: appName.toLowerCase().replace(/\s+/g, "-"),
    type: "folder",
    children: [
      { name: "app", type: "folder", description: "Next.js App Router", children: [
        { name: "(auth)", type: "folder", children: [
          { name: "login", type: "folder", children: [{ name: "page.tsx", type: "file" }] },
          { name: "signup", type: "folder", children: [{ name: "page.tsx", type: "file" }] },
        ]},
        { name: "(dashboard)", type: "folder", children: [
          { name: "dashboard", type: "folder", children: [{ name: "page.tsx", type: "file" }] },
          { name: "settings", type: "folder", children: [{ name: "page.tsx", type: "file" }] },
        ]},
        { name: "api", type: "folder", children: [
          { name: "generate", type: "folder", children: [{ name: "route.ts", type: "file" }] },
          { name: "billing", type: "folder", children: [{ name: "checkout", type: "folder" }, { name: "portal", type: "folder" }] },
          { name: "webhooks", type: "folder", children: [{ name: "stripe", type: "folder" }] },
        ]},
        { name: "page.tsx", type: "file", description: "Landing page" },
        { name: "layout.tsx", type: "file" },
      ]},
      { name: "components", type: "folder", children: [
        { name: "ui", type: "folder", description: "shadcn/ui primitives" },
        { name: "landing", type: "folder" },
        { name: "dashboard", type: "folder" },
        { name: "generator", type: "folder" },
      ]},
      { name: "agents", type: "folder", description: "Modular AI agent system" },
      { name: "lib", type: "folder", description: "Utilities, clients, constants" },
      { name: "types", type: "folder" },
      { name: "hooks", type: "folder" },
      { name: "prisma", type: "folder", children: [{ name: "schema.prisma", type: "file" }] },
      { name: ".env.local", type: "file" },
      { name: "tailwind.config.ts", type: "file" },
      { name: "next.config.ts", type: "file" },
    ],
  };
}

function buildImplementationPhases(input: GenerationInput): ImplementationPhase[] {
  return [
    {
      phase: 1,
      title: "Foundation",
      duration: "Week 1–2",
      tasks: [
        "Initialize Next.js 15 project with TypeScript and Tailwind",
        "Set up Supabase project and configure Auth",
        "Configure Prisma ORM and run initial migration",
        "Build landing page with hero and feature sections",
        "Implement sign up / login flows",
      ],
      deliverables: ["Working auth flow", "Database connected", "Landing page live"],
    },
    {
      phase: 2,
      title: "Core Features",
      duration: "Week 3–5",
      tasks: [
        "Build main dashboard with stats and activity feed",
        "Implement core domain features for " + input.industry,
        "Set up Stripe subscriptions and webhook handler",
        "Build pricing page with checkout flow",
        "Integrate Claude AI for key user-facing features",
      ],
      deliverables: ["Stripe billing working", "Core features functional", "AI integration live"],
    },
    {
      phase: 3,
      title: "Polish & Launch",
      duration: "Week 6–8",
      tasks: [
        "Add analytics tracking and admin dashboard",
        "Performance optimization (Core Web Vitals)",
        "Comprehensive error handling and loading states",
        "Mobile responsiveness audit",
        "Deploy to Vercel with all environment variables",
        "Set up monitoring (Sentry, PostHog)",
      ],
      deliverables: ["Production deployment", "Monitoring configured", "Ready for users"],
    },
  ];
}
