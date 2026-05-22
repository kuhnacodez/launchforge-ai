import type { GenerationOutput } from "@/types";
import { BaseBuildAgent, type GeneratedFile } from "./base-build.agent";

export class SetupAgent extends BaseBuildAgent {
  name = "SetupAgent";
  label = "Project scaffolding";

  async run(output: GenerationOutput): Promise<GeneratedFile[]> {
    const appSlug = output.overview.name.toLowerCase().replace(/\s+/g, "-");
    const files: GeneratedFile[] = [];

    files.push({
      path: "package.json",
      content: JSON.stringify({
        name: appSlug,
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev --turbopack",
          build: "next build",
          start: "next start",
          lint: "next lint",
          "db:push": "prisma db push",
          "db:migrate": "prisma migrate dev",
          "db:studio": "prisma studio",
        },
        dependencies: {
          "next": "^15.0.0",
          "react": "^19.0.0",
          "react-dom": "^19.0.0",
          "typescript": "^5.0.0",
          "@supabase/supabase-js": "^2.0.0",
          "@supabase/ssr": "^0.5.0",
          "@prisma/client": "^6.0.0",
          "stripe": "^17.0.0",
          "@stripe/stripe-js": "^5.0.0",
          "tailwindcss": "^4.0.0",
          "@anthropic-ai/sdk": "^0.37.0",
          "framer-motion": "^12.0.0",
          "lucide-react": "^0.475.0",
          "clsx": "^2.0.0",
          "tailwind-merge": "^2.0.0",
          "zod": "^3.0.0",
        },
        devDependencies: {
          "@types/node": "^22.0.0",
          "@types/react": "^19.0.0",
          "@types/react-dom": "^19.0.0",
          "prisma": "^6.0.0",
          "eslint": "^9.0.0",
          "eslint-config-next": "^15.0.0",
        },
      }, null, 2),
    });

    files.push({
      path: ".env.example",
      content: `# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DIRECT_URL=postgresql://user:password@host:5432/dbname

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
${output.stripe_plans.map((p, i) => `STRIPE_${p.name.toUpperCase().replace(/\s+/g,"_")}_PRICE_ID=price_...`).join("\n")}
`,
    });

    files.push({
      path: ".gitignore",
      content: `.env.local\n.env\n.next/\nnode_modules/\n.DS_Store\n*.log\n/prisma/migrations/\n`,
    });

    files.push({
      path: "next.config.ts",
      content: `import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {\n  images: { domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"] },\n};\n\nexport default nextConfig;\n`,
    });

    files.push({
      path: "tsconfig.json",
      content: JSON.stringify({
        compilerOptions: {
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: { "@/*": ["./*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"],
      }, null, 2),
    });

    return files;
  }
}
