import type { GenerationInput, DatabaseTable, AgentResult } from "@/types";
import { BaseAgent } from "./base.agent";
import { callAgentClaude } from "@/lib/agents";

export class DatabaseAgent extends BaseAgent<GenerationInput, DatabaseTable[]> {
  name = "DatabaseAgent";
  systemPrompt = `You are a PostgreSQL database architect. Design a normalized schema for the given SaaS app. Return ONLY a valid JSON array — no markdown, no explanation. Each element:
{
  "name": "table_name",
  "description": "string",
  "columns": [{ "name": "string", "type": "string", "nullable": boolean, "description": "string" }],
  "relationships": ["string"]
}`;

  async run(input: GenerationInput): Promise<AgentResult<DatabaseTable[]>> {
    const raw = await callAgentClaude(
      this.systemPrompt,
      `Startup: "${input.prompt}"\nIndustry: ${input.industry}\nFeatures: ${input.features.join(", ")}`
    );
    return this.success(JSON.parse(raw) as DatabaseTable[]);
  }

  private mock(input: GenerationInput): DatabaseTable[] {
    return [
      { name: "users", description: "Core user accounts linked to Supabase Auth", columns: [{ name: "id", type: "cuid()", nullable: false, description: "Primary key" }, { name: "email", type: "String @unique", nullable: false, description: "User email" }, { name: "full_name", type: "String?", nullable: true, description: "Display name" }, { name: "stripe_customer_id", type: "String? @unique", nullable: true, description: "Stripe customer reference" }, { name: "created_at", type: "DateTime", nullable: false, description: "Account creation timestamp" }], relationships: ["has many subscriptions", "has many projects"] },
      { name: "subscriptions", description: "Stripe subscription state", columns: [{ name: "id", type: "cuid()", nullable: false, description: "Primary key" }, { name: "user_id", type: "String", nullable: false, description: "FK → users.id" }, { name: "status", type: "String", nullable: false, description: "active | trialing | canceled | past_due" }, { name: "plan_id", type: "String", nullable: false, description: "free | pro | enterprise" }, { name: "current_period_end", type: "DateTime", nullable: false, description: "When period expires" }], relationships: ["belongs to users"] },
      { name: input.industry === "fitness" ? "workouts" : "records", description: `Core ${input.industry} data records`, columns: [{ name: "id", type: "cuid()", nullable: false, description: "Primary key" }, { name: "user_id", type: "String", nullable: false, description: "FK → users.id" }, { name: "name", type: "String", nullable: false, description: "Record name" }, { name: "data", type: "Json", nullable: false, description: "Structured payload" }, { name: "created_at", type: "DateTime", nullable: false, description: "Creation timestamp" }], relationships: ["belongs to users"] },
    ];
  }
}
