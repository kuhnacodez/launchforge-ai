import type { GenerationOutput } from "@/types";
import { BaseBuildAgent, type GeneratedFile } from "./base-build.agent";

export class AuthBuildAgent extends BaseBuildAgent {
  name = "AuthBuildAgent";
  label = "Authentication";

  async run(output: GenerationOutput): Promise<GeneratedFile[]> {
    const [loginPage, signupPage] = await Promise.all([
      this.generate(
        `You are a Next.js 15 expert. Generate a complete, production-ready login page component.
Return ONLY the raw TypeScript/TSX file content — no markdown, no explanation, no code fences.
Requirements:
- "use client" directive
- Support email/password login and Google OAuth via Supabase
- Use Tailwind CSS for styling — dark theme, clean and professional
- Show loading states, error messages
- Redirect to /dashboard on success
- Import createBrowserClient from @supabase/ssr for client-side auth`,
        `App: ${output.overview.name}\nTagline: ${output.overview.tagline}`
      ),
      this.generate(
        `You are a Next.js 15 expert. Generate a complete, production-ready signup page component.
Return ONLY the raw TypeScript/TSX file content — no markdown, no explanation, no code fences.
Requirements:
- "use client" directive
- Support email/password signup and Google OAuth via Supabase
- Collect full name, email, password
- Use Tailwind CSS for styling — dark theme, clean and professional
- Show loading states and validation errors
- Redirect to /dashboard on success`,
        `App: ${output.overview.name}\nTagline: ${output.overview.tagline}`
      ),
    ]);

    return [
      {
        path: "lib/supabase/client.ts",
        content: `import { createBrowserClient } from "@supabase/ssr";\n\nexport const createClient = () =>\n  createBrowserClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n  );\n`,
      },
      {
        path: "lib/supabase/server.ts",
        content: `import { createServerClient as _createServerClient } from "@supabase/ssr";\nimport { cookies } from "next/headers";\n\nexport async function createServerClient() {\n  const cookieStore = await cookies();\n  return _createServerClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,\n    {\n      cookies: {\n        getAll: () => cookieStore.getAll(),\n        setAll: (cookiesToSet) => {\n          cookiesToSet.forEach(({ name, value, options }) =>\n            cookieStore.set(name, value, options)\n          );\n        },\n      },\n    }\n  );\n}\n`,
      },
      {
        path: "lib/supabase/service.ts",
        content: `import { createClient } from "@supabase/supabase-js";\n\nexport function createServiceClient() {\n  return createClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.SUPABASE_SERVICE_ROLE_KEY!,\n    { auth: { autoRefreshToken: false, persistSession: false } }\n  );\n}\n`,
      },
      {
        path: "app/auth/callback/route.ts",
        content: `import { NextRequest, NextResponse } from "next/server";\nimport { createServerClient } from "@/lib/supabase/server";\nimport { createServiceClient } from "@/lib/supabase/service";\n\nexport async function GET(req: NextRequest) {\n  const { searchParams, origin } = new URL(req.url);\n  const code = searchParams.get("code");\n  const next = searchParams.get("next") ?? "/dashboard";\n\n  if (code) {\n    const supabase = await createServerClient();\n    const { error } = await supabase.auth.exchangeCodeForSession(code);\n    if (!error) {\n      const { data: { user } } = await supabase.auth.getUser();\n      if (user) {\n        const serviceClient = createServiceClient();\n        await serviceClient.from("profiles").upsert({\n          id: user.id,\n          full_name: user.user_metadata.full_name ?? null,\n          avatar_url: user.user_metadata.avatar_url ?? null,\n        }, { onConflict: "id", ignoreDuplicates: true });\n      }\n      return NextResponse.redirect(\`\${origin}\${next}\`);\n    }\n  }\n  return NextResponse.redirect(\`\${origin}/login?error=oauth_failed\`);\n}\n`,
      },
      { path: "app/(auth)/login/page.tsx", content: loginPage },
      { path: "app/(auth)/signup/page.tsx", content: signupPage },
    ];
  }
}
