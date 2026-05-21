import type { GenerationInput, PageDefinition, AgentResult } from "@/types";
import { BaseAgent } from "./base.agent";
import { callAgentClaude, hasClaudeKey } from "@/lib/agents";

export class FrontendAgent extends BaseAgent<GenerationInput, PageDefinition[]> {
  name = "FrontendAgent";
  systemPrompt = `You are an expert frontend architect. Given a SaaS startup idea, design the full page structure. Return ONLY a valid JSON array — no markdown, no explanation. Each element must follow this shape:
{
  "name": "string",
  "path": "/string",
  "description": "string",
  "components": ["string"],
  "auth_required": boolean
}`;

  async run(input: GenerationInput): Promise<AgentResult<PageDefinition[]>> {
    try {
      if (hasClaudeKey()) {
        const raw = await callAgentClaude(
          this.systemPrompt,
          `Startup: "${input.prompt}"\nIndustry: ${input.industry}\nFeatures: ${input.features.join(", ")}`
        );
        return this.success(JSON.parse(raw) as PageDefinition[]);
      }
      return this.success(this.mock(input));
    } catch (err) {
      console.error("[FrontendAgent] falling back to mock:", err);
      return this.success(this.mock(input));
    }
  }

  private mock(input: GenerationInput): PageDefinition[] {
    const hasAI = input.features.some((f) => f.toLowerCase().includes("ai"));
    const hasTeam = input.features.some((f) => f.toLowerCase().includes("team"));
    const base: PageDefinition[] = [
      { name: "Landing Page", path: "/", description: "Marketing homepage with hero, features, testimonials, and pricing", components: ["HeroSection", "FeatureGrid", "TestimonialCarousel", "PricingSection", "CTABanner", "Footer"], auth_required: false },
      { name: "Sign Up", path: "/signup", description: "User registration with email/password and OAuth providers", components: ["SignupForm", "OAuthButtons", "TermsCheckbox"], auth_required: false },
      { name: "Login", path: "/login", description: "User authentication with remember me and forgot password", components: ["LoginForm", "OAuthButtons", "ForgotPasswordLink"], auth_required: false },
      { name: "Dashboard", path: "/dashboard", description: "Main user dashboard with stats, recent activity, and quick actions", components: ["StatsGrid", "RecentActivity", "QuickActions", "UsageChart"], auth_required: true },
      { name: "Settings", path: "/settings", description: "User account settings, billing, and preferences", components: ["ProfileForm", "BillingSection", "NotificationPrefs", "DangerZone"], auth_required: true },
      { name: "Pricing", path: "/pricing", description: "Subscription tiers with feature comparison and upgrade flow", components: ["PricingCards", "FeatureComparison", "FAQAccordion"], auth_required: false },
      { name: "Admin", path: "/admin", description: "Admin panel for user management, analytics, and system health", components: ["UserTable", "AnalyticsCharts", "SystemStatus", "RevenueMetrics"], auth_required: true },
    ];
    if (hasAI) base.push({ name: "AI Assistant", path: "/app/ai", description: "AI-powered assistant with contextual suggestions", components: ["ChatInterface", "SuggestionCards", "HistoryDrawer"], auth_required: true });
    if (hasTeam) base.push({ name: "Team Management", path: "/team", description: "Invite members, manage roles, and view team activity", components: ["MemberTable", "InviteModal", "RolePicker", "ActivityFeed"], auth_required: true });
    return base;
  }
}
