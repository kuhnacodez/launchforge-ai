import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Auto-create profile if it doesn't exist yet (use service role to bypass RLS)
        const serviceClient = createServiceClient();
        await serviceClient.from("profiles").upsert({
          id: user.id,
          full_name: user.user_metadata.full_name ?? user.user_metadata.name ?? null,
          avatar_url: user.user_metadata.avatar_url ?? null,
          subscription_tier: "free",
          generations_used: 0,
          generations_limit: 3,
        }, { onConflict: "id", ignoreDuplicates: true });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
