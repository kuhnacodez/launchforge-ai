import type { GenerationOutput } from "@/types";
import { BaseBuildAgent, type GeneratedFile } from "./base-build.agent";

export class LandingBuildAgent extends BaseBuildAgent {
  name = "LandingBuildAgent";
  label = "Landing page";

  async run(output: GenerationOutput): Promise<GeneratedFile[]> {
    const [landingPage, layoutFile] = await Promise.all([
      this.generate(
        `You are a Next.js 15 expert and conversion copywriter. Generate a complete, production-ready landing page.
Return ONLY the raw TypeScript/TSX file content — no markdown, no explanation, no code fences.
Requirements:
- Server component (no "use client")
- Sections: Hero, Features (6 features), How It Works (3 steps), Pricing CTA, Footer
- Use Tailwind CSS — dark theme, gradient accents, professional SaaS look
- Include a sticky navbar with logo and CTA button linking to /signup
- Hero must have a compelling headline, subheadline, primary CTA, and secondary CTA
- Feature cards based on the app's key differentiators
- Responsive and mobile-first
- No external component imports — use only HTML elements and Tailwind`,
        `App context:\n${this.context(output)}`
      ),
      this.generate(
        `You are a Next.js 15 expert. Generate a complete app/layout.tsx root layout file.
Return ONLY the raw TypeScript/TSX file content — no markdown, no explanation, no code fences.
Requirements:
- Import Inter font from next/font/google
- Set appropriate metadata (title, description, og tags) based on the app
- Dark background, sans-serif font
- Include a ThemeProvider wrapper if needed
- No external component imports beyond next/font`,
        `App: ${output.overview.name}\nDescription: ${output.overview.description}`
      ),
    ]);

    return [
      { path: "app/page.tsx", content: landingPage },
      { path: "app/layout.tsx", content: layoutFile },
      {
        path: "app/globals.css",
        content: `@import "tailwindcss";\n\n:root {\n  --background: #09090b;\n  --foreground: #fafafa;\n}\n\nbody {\n  background: var(--background);\n  color: var(--foreground);\n  font-family: var(--font-inter), sans-serif;\n}\n`,
      },
    ];
  }
}
