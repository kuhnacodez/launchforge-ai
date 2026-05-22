import type { GenerationOutput } from "@/types";
import { BaseBuildAgent, type GeneratedFile } from "./base-build.agent";

export class ApiBuildAgent extends BaseBuildAgent {
  name = "ApiBuildAgent";
  label = "API routes";

  async run(output: GenerationOutput): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Always include billing routes and webhook
    const [checkout, portal, webhook] = await Promise.all([
      this.generate(
        `Generate a Next.js 15 App Router API route for Stripe checkout session creation (app/api/billing/checkout/route.ts).
Return ONLY raw TypeScript — no markdown, no code fences.
Requirements:
- POST handler
- Verify user is authenticated via Supabase server client
- Create Stripe checkout session with the correct price ID from env vars
- Return { checkout_url } on success`,
        `Stripe plans: ${JSON.stringify(output.stripe_plans)}`
      ),
      this.generate(
        `Generate a Next.js 15 App Router API route for Stripe billing portal (app/api/billing/portal/route.ts).
Return ONLY raw TypeScript — no markdown, no code fences.
Requirements:
- POST handler
- Verify user is authenticated
- Get stripe_customer_id from user's profile in Supabase
- Create Stripe billing portal session
- Return { portal_url }`,
        `App: ${output.overview.name}`
      ),
      this.generate(
        `Generate a Next.js 15 App Router API route for Stripe webhooks (app/api/webhooks/stripe/route.ts).
Return ONLY raw TypeScript — no markdown, no code fences.
Requirements:
- POST handler
- Verify Stripe webhook signature using STRIPE_WEBHOOK_SECRET
- Handle: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
- Update user's subscription_tier and generations_limit in Supabase profiles table
- Use service role client to bypass RLS`,
        `Stripe plans: ${JSON.stringify(output.stripe_plans)}`
      ),
    ]);

    files.push(
      { path: "app/api/billing/checkout/route.ts", content: checkout },
      { path: "app/api/billing/portal/route.ts", content: portal },
      { path: "app/api/webhooks/stripe/route.ts", content: webhook },
    );

    // Generate domain-specific API routes (up to 4)
    const domainRoutes = output.api_routes
      .filter(r => !r.path.startsWith("/api/billing") && !r.path.startsWith("/api/webhooks") && !r.path.startsWith("/api/auth"))
      .slice(0, 4);

    if (domainRoutes.length > 0) {
      const routeFiles = await Promise.all(
        domainRoutes.map(route =>
          this.generate(
            `Generate a Next.js 15 App Router API route handler.
Return ONLY raw TypeScript — no markdown, no code fences.
Requirements:
- Verify authentication via Supabase server client
- Implement the described functionality with proper error handling
- Return appropriate HTTP status codes
- Use Prisma client for database operations`,
            `Route: ${route.method} ${route.path}\nDescription: ${route.description}\nApp context:\n${this.context(output)}`
          ).then(content => ({
            path: `app${route.path}/route.ts`,
            content,
          }))
        )
      );
      files.push(...routeFiles);
    }

    // Stripe lib
    files.push({
      path: "lib/stripe.ts",
      content: `import Stripe from "stripe";\n\nexport const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {\n  apiVersion: "2025-01-27.acacia",\n  typescript: true,\n});\n`,
    });

    return files;
  }
}
