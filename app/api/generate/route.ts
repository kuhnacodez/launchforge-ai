import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { runGenerationPipeline } from "@/agents/orchestrator";
import { hasClaudeKey } from "@/lib/agents";
import type { GenerationInput } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch profile to check generation limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("generations_used, generations_limit, subscription_tier")
    .eq("id", user.id)
    .single();

  if (profile && profile.generations_used >= profile.generations_limit) {
    return NextResponse.json(
      {
        error: "Generation limit reached",
        code: "LIMIT_REACHED",
        used: profile.generations_used,
        limit: profile.generations_limit,
      },
      { status: 429 }
    );
  }

  if (!hasClaudeKey()) {
    return NextResponse.json(
      { error: "AI service is not configured. ANTHROPIC_API_KEY is missing from environment variables." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json() as GenerationInput;

    if (!body.prompt || typeof body.prompt !== "string" || body.prompt.trim().length < 10) {
      return NextResponse.json(
        { error: "Prompt must be at least 10 characters." },
        { status: 400 }
      );
    }

    if (!body.industry || !body.pricing_model) {
      return NextResponse.json(
        { error: "Industry and pricing_model are required." },
        { status: 400 }
      );
    }

    const input: GenerationInput = {
      prompt: body.prompt.trim(),
      startup_name: body.startup_name?.trim(),
      industry: body.industry,
      features: Array.isArray(body.features) ? body.features : [],
      pricing_model: body.pricing_model,
    };

    const output = await runGenerationPipeline(input);

    // Auto-save project to Supabase
    const projectName = output.overview?.name ?? input.startup_name ?? "Untitled Blueprint";
    const { data: savedProject } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: projectName,
        prompt: input.prompt,
        industry: input.industry,
        output,
      })
      .select("id")
      .single();

    // Increment generations_used
    await supabase
      .from("profiles")
      .update({ generations_used: (profile?.generations_used ?? 0) + 1 })
      .eq("id", user.id);

    return NextResponse.json(
      { output, project_id: savedProject?.id ?? null },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/generate]", error);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
