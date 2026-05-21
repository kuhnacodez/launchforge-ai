# LaunchForge AI

**Describe your startup. Launch your SaaS.**

LaunchForge AI is a premium AI-powered SaaS blueprint generator. Enter your startup idea in plain English and receive a complete product architecture — database schema, API routes, Stripe billing structure, auth strategy, and a phased implementation roadmap — in seconds.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| UI | Custom component system (shadcn/ui primitives + Radix UI) |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Payments | Stripe Subscriptions |
| AI | Anthropic Claude API (modular agent architecture) |
| Deployment | Vercel |

---

## Project Structure

```
launchforge-ai/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (dashboard)/     # Protected app routes
│   │   ├── dashboard/   # Main dashboard
│   │   ├── generate/    # AI generator page
│   │   ├── profile/     # User profile & billing
│   │   └── projects/    # Saved blueprints
│   ├── (marketing)/     # Landing, pricing pages
│   ├── api/
│   │   ├── generate/    # POST — AI generation pipeline
│   │   ├── billing/     # Stripe checkout & portal
│   │   └── webhooks/    # Stripe webhook handler
│   └── layout.tsx
├── agents/              # Modular AI agent system
│   ├── base.agent.ts    # Abstract base class
│   ├── planner.agent.ts # Product overview + tech stack
│   ├── frontend.agent.ts# Page structure + components
│   ├── database.agent.ts# Schema design + relationships
│   ├── backend.agent.ts # API route design
│   ├── stripe.agent.ts  # Billing tiers + pricing
│   └── orchestrator.ts  # Parallel pipeline runner
├── components/
│   ├── ui/              # Button, Card, Badge, Input, etc.
│   ├── landing/         # Hero, Features, Testimonials, CTA
│   ├── generator/       # GenerationForm, OutputTabs
│   ├── layout/          # Navbar, Footer, DashboardLayout
│   └── providers/       # ThemeProvider
├── lib/
│   ├── utils.ts         # cn(), formatDate(), formatPrice()
│   ├── supabase/        # Client + server Supabase clients
│   ├── stripe.ts        # Stripe client + plan constants
│   ├── claude.ts        # Anthropic SDK wrapper
│   └── constants.ts     # Industries, features, pricing plans
├── types/index.ts       # All TypeScript interfaces
├── prisma/schema.prisma # PostgreSQL schema
└── .env.example         # Environment variable template
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/launchforge-ai.git
cd launchforge-ai
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server only) |
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

### 3. Database Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## AI Agent Architecture

The generation pipeline runs 5 agents in parallel via `agents/orchestrator.ts`:

```
GenerationInput
     │
     ├─── PlannerAgent   → AppOverview (name, tech stack, differentiators)
     ├─── FrontendAgent  → PageDefinition[] (routes, components, auth)
     ├─── DatabaseAgent  → DatabaseTable[] (columns, types, relationships)
     ├─── BackendAgent   → ApiRoute[] (methods, auth, schemas)
     └─── StripeAgent    → StripePlan[] (tiers, features, limits)
                │
                └─→ orchestrator merges into GenerationOutput
```

Currently uses **realistic mock outputs**. To wire real Claude API calls, replace each agent's `mock()` body:

```typescript
// agents/planner.agent.ts
async run(input: GenerationInput): Promise<AgentResult<AppOverview>> {
  const raw = await callClaude(this.systemPrompt, JSON.stringify(input));
  return this.success(JSON.parse(raw));
}
```

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all env vars in **Settings → Environment Variables**
4. Deploy

Stripe webhook URL after deploy: `https://your-domain.vercel.app/api/webhooks/stripe`

---

## Stripe Local Testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Roadmap

- [ ] Real Claude API in all agents
- [ ] Supabase middleware for protected routes
- [ ] Save/load projects from database
- [ ] PDF blueprint export
- [ ] Public blueprint showcase gallery
- [ ] Team workspaces
- [ ] AI-powered prompt suggestions
