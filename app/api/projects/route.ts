import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, prompt, industry, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    name: string;
    prompt: string;
    industry: string;
    output: unknown;
  };

  const { name, prompt, industry, output } = body;

  if (!name || !prompt || !industry || !output) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name, prompt, industry, output })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project }, { status: 201 });
}
