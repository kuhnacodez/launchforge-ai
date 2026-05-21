// ============================================================
// LaunchForge AI — Core TypeScript Types
// ============================================================

export type SubscriptionTier = "free" | "pro" | "enterprise";
export type Industry =
  | "fitness"
  | "fintech"
  | "edtech"
  | "healthtech"
  | "ecommerce"
  | "productivity"
  | "analytics"
  | "social"
  | "marketplace"
  | "other";

export type PricingModel = "subscription" | "one-time" | "usage-based" | "freemium";

// ── User ────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  generations_used: number;
  generations_limit: number;
  created_at: string;
}

// ── Generation Input ─────────────────────────────────────────

export interface GenerationInput {
  prompt: string;
  startup_name?: string;
  industry: Industry;
  features: string[];
  pricing_model: PricingModel;
}

// ── Generation Output (what each agent produces) ─────────────

export interface AppOverview {
  name: string;
  tagline: string;
  description: string;
  industry: string;
  target_audience: string;
  key_differentiators: string[];
  tech_stack: TechStack;
}

export interface TechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  auth: string[];
  payments: string[];
  deployment: string[];
  ai?: string[];
}

export interface PageDefinition {
  name: string;
  path: string;
  description: string;
  components: string[];
  auth_required: boolean;
}

export interface DatabaseTable {
  name: string;
  description: string;
  columns: DatabaseColumn[];
  relationships: string[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
}

export interface ApiRoute {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth_required: boolean;
  request_body?: Record<string, string>;
  response: Record<string, string>;
}

export interface StripePlan {
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: Record<string, string | number>;
  stripe_product_id: string;
}

export interface DeploymentStep {
  step: number;
  title: string;
  description: string;
  commands?: string[];
  env_vars?: string[];
}

export interface FolderNode {
  name: string;
  type: "file" | "folder";
  children?: FolderNode[];
  description?: string;
}

export interface ImplementationPhase {
  phase: number;
  title: string;
  duration: string;
  tasks: string[];
  deliverables: string[];
}

export interface GenerationOutput {
  id: string;
  created_at: string;
  input: GenerationInput;
  overview: AppOverview;
  pages: PageDefinition[];
  database_schema: DatabaseTable[];
  api_routes: ApiRoute[];
  stripe_plans: StripePlan[];
  deployment_steps: DeploymentStep[];
  folder_structure: FolderNode;
  implementation_phases: ImplementationPhase[];
  json_export: Record<string, unknown>;
}

// ── Agent System ─────────────────────────────────────────────

export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  tokens_used?: number;
}

export type AgentType = "planner" | "frontend" | "backend" | "database" | "stripe";

// ── Saved Project ─────────────────────────────────────────────

export interface SavedProject {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  industry: Industry;
  output: GenerationOutput;
  created_at: string;
  updated_at: string;
}

// ── Pricing ───────────────────────────────────────────────────

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  price_monthly: number;
  price_yearly: number;
  tier: SubscriptionTier;
  features: string[];
  limits: {
    generations_per_month: number | "unlimited";
    saved_projects: number | "unlimited";
    export_formats: string[];
    support: string;
  };
  highlighted: boolean;
  cta: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
}
