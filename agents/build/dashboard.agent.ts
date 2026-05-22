import type { GenerationOutput } from "@/types";
import { BaseBuildAgent, type GeneratedFile } from "./base-build.agent";

export class DashboardBuildAgent extends BaseBuildAgent {
  name = "DashboardBuildAgent";
  label = "Dashboard & pages";

  async run(output: GenerationOutput): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Generate dashboard layout
    const layout = await this.generate(
      `You are a Next.js 15 expert. Generate a complete dashboard layout component (app/(dashboard)/layout.tsx).
Return ONLY the raw TypeScript/TSX file content — no markdown, no explanation, no code fences.
Requirements:
- "use client" directive
- Sidebar navigation with logo, nav links for each page, user avatar, sign out button
- Responsive: collapsible sidebar on desktop, drawer on mobile
- Use Tailwind CSS — dark theme, clean sidebar design
- Get user session from Supabase browser client
- Redirect to /login if no session
- Import createBrowserClient from @supabase/ssr`,
      `App context:\n${this.context(output)}`
    );
    files.push({ path: "app/(dashboard)/layout.tsx", content: layout });

    // Generate main dashboard page
    const dashboard = await this.generate(
      `You are a Next.js 15 expert. Generate a complete dashboard home page (app/(dashboard)/dashboard/page.tsx).
Return ONLY the raw TypeScript/TSX file content — no markdown, no explanation, no code fences.
Requirements:
- "use client" directive
- Show stats cards relevant to the app (usage, recent activity, key metrics)
- Show recent items list (fetched from Supabase)
- Welcome message with user's name
- Quick action CTA button
- Use Tailwind CSS — dark theme, card-based layout
- Fetch data from Supabase browser client on mount`,
      `App context:\n${this.context(output)}`
    );
    files.push({ path: "app/(dashboard)/dashboard/page.tsx", content: dashboard });

    // Generate additional pages in parallel (up to 3 extra pages from blueprint)
    const extraPages = output.pages.filter(p =>
      !["landing", "login", "signup", "dashboard"].includes(p.name.toLowerCase())
    ).slice(0, 4);

    if (extraPages.length > 0) {
      const pageFiles = await Promise.all(
        extraPages.map(page =>
          this.generate(
            `You are a Next.js 15 expert. Generate a complete page component for a SaaS dashboard.
Return ONLY the raw TypeScript/TSX file content — no markdown, no explanation, no code fences.
Requirements:
- "use client" directive
- Fully functional page with real UI, loading states, empty states
- Fetch relevant data from Supabase browser client
- Use Tailwind CSS — dark theme, consistent with dashboard style
- Include proper TypeScript types`,
            `App context:\n${this.context(output)}\n\nPage to build:\nName: ${page.name}\nRoute: ${page.route}\nDescription: ${page.description ?? ""}\nComponents: ${page.components?.join(", ") ?? "standard"}`
          ).then(content => ({
            path: `app/(dashboard)${page.route}/page.tsx`,
            content,
          }))
        )
      );
      files.push(...pageFiles);
    }

    return files;
  }
}
