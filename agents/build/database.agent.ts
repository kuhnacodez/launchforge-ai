import type { GenerationOutput } from "@/types";
import { BaseBuildAgent, type GeneratedFile } from "./base-build.agent";

export class DatabaseBuildAgent extends BaseBuildAgent {
  name = "DatabaseBuildAgent";
  label = "Database schema";

  async run(output: GenerationOutput): Promise<GeneratedFile[]> {
    const schema = await this.generate(
      `You are a Prisma ORM expert. Generate a complete, production-ready prisma/schema.prisma file.
Return ONLY the raw Prisma schema file content — no markdown, no explanation, no code fences.
Requirements:
- Use postgresql provider with env("DATABASE_URL") and directUrl = env("DIRECT_URL")
- Include a User model linked to Supabase auth (supabase_id String @unique)
- Include all domain models based on the app context
- Add proper relations, indexes, and timestamps (createdAt, updatedAt)
- Use @@map for snake_case table names`,
      `App context:\n${this.context(output)}\n\nDatabase tables needed:\n${JSON.stringify(output.database_schema, null, 2)}`
    );

    const migration = await this.generate(
      `You are a PostgreSQL expert. Generate a complete Supabase SQL migration file.
Return ONLY raw SQL — no markdown, no explanation, no code fences.
Requirements:
- Create all tables with proper types and constraints
- Add a profiles table linked to auth.users with on delete cascade
- Enable Row Level Security on all tables
- Add RLS policies so users can only access their own data
- Add a trigger to auto-create a profile row when a new user signs up
- Use gen_random_uuid() for UUID primary keys`,
      `App context:\n${this.context(output)}\n\nTables needed:\n${JSON.stringify(output.database_schema, null, 2)}`
    );

    return [
      { path: "prisma/schema.prisma", content: schema },
      { path: "supabase/migrations/001_init.sql", content: migration },
    ];
  }
}
