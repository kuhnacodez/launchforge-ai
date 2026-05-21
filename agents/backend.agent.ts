import type { GenerationInput, ApiRoute, AgentResult } from "@/types";
import { BaseAgent } from "./base.agent";
import { callAgentClaude, hasClaudeKey } from "@/lib/agents";

export class BackendAgent extends BaseAgent<GenerationInput, ApiRoute[]> {
  name = "BackendAgent";
  systemPrompt = `You are a REST API architect. Design API endpoints for the given SaaS. Return ONLY a valid JSON array — no markdown, no explanation. Each element:
{
  "method": "GET|POST|PUT|PATCH|DELETE",
  "path": "/api/string",
  "description": "string",
  "auth_required": boolean,
  "request_body": { "key": "type" },
  "response": { "key": "type" }
}`;

  async run(input: GenerationInput): Promise<AgentResult<ApiRoute[]>> {
    try {
      if (hasClaudeKey()) {
        const raw = await callAgentClaude(
          this.systemPrompt,
          `Startup: "${input.prompt}"\nIndustry: ${input.industry}\nFeatures: ${input.features.join(", ")}`
        );
        return this.success(JSON.parse(raw) as ApiRoute[]);
      }
      return this.success(this.mock(input));
    } catch (err) {
      console.error("[BackendAgent] falling back to mock:", err);
      return this.success(this.mock(input));
    }
  }

  private mock(input: GenerationInput): ApiRoute[] {
    const routes: ApiRoute[] = [
      { method: "POST", path: "/api/auth/signup", description: "Register a new user account", auth_required: false, request_body: { email: "string", password: "string", full_name: "string" }, response: { user: "User", session: "Session" } },
      { method: "POST", path: "/api/auth/login", description: "Authenticate and return session token", auth_required: false, request_body: { email: "string", password: "string" }, response: { user: "User", access_token: "string" } },
      { method: "GET", path: "/api/auth/me", description: "Return current authenticated user", auth_required: true, response: { user: "User" } },
      { method: "GET", path: "/api/projects", description: "List all projects for current user", auth_required: true, response: { projects: "Project[]", total: "number" } },
      { method: "POST", path: "/api/projects", description: "Save a generated blueprint as a project", auth_required: true, request_body: { name: "string", output: "GenerationOutput" }, response: { project: "Project" } },
      { method: "DELETE", path: "/api/projects/:id", description: "Delete a project", auth_required: true, response: { success: "boolean" } },
      { method: "POST", path: "/api/generate", description: "Run AI agent pipeline and return SaaS blueprint", auth_required: true, request_body: { prompt: "string", industry: "Industry", features: "string[]" }, response: { output: "GenerationOutput" } },
      { method: "POST", path: "/api/billing/checkout", description: "Create Stripe Checkout Session", auth_required: true, request_body: { plan_id: "string", billing_period: "monthly | yearly" }, response: { checkout_url: "string" } },
      { method: "POST", path: "/api/billing/portal", description: "Open Stripe Customer Portal", auth_required: true, response: { portal_url: "string" } },
      { method: "POST", path: "/api/webhooks/stripe", description: "Stripe webhook handler", auth_required: false, response: { received: "boolean" } },
    ];
    if (input.industry === "fitness") {
      routes.push(
        { method: "GET", path: "/api/workouts", description: "List user workouts", auth_required: true, response: { workouts: "Workout[]" } },
        { method: "POST", path: "/api/workouts", description: "Log a new workout", auth_required: true, request_body: { name: "string", exercises: "Exercise[]", duration_minutes: "number" }, response: { workout: "Workout" } }
      );
    }
    return routes;
  }
}
