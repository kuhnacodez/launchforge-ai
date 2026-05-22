import type { GenerationOutput } from "@/types";
import type { GeneratedFile } from "./base-build.agent";
import { SetupAgent } from "./setup.agent";
import { DatabaseBuildAgent } from "./database.agent";
import { AuthBuildAgent } from "./auth.agent";
import { LandingBuildAgent } from "./landing.agent";
import { DashboardBuildAgent } from "./dashboard.agent";
import { ApiBuildAgent } from "./api.agent";
import { DocsBuildAgent } from "./docs.agent";

export interface BuildStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
}

export const BUILD_STEPS: BuildStep[] = [
  { id: "setup", label: "Project scaffolding", status: "pending" },
  { id: "database", label: "Database schema", status: "pending" },
  { id: "auth", label: "Authentication", status: "pending" },
  { id: "landing", label: "Landing page", status: "pending" },
  { id: "dashboard", label: "Dashboard & pages", status: "pending" },
  { id: "api", label: "API routes", status: "pending" },
  { id: "docs", label: "Handover documents", status: "pending" },
];

export async function runBuildPipeline(
  output: GenerationOutput,
  onStep: (id: string, status: "running" | "done" | "error") => void
): Promise<GeneratedFile[]> {
  const allFiles: GeneratedFile[] = [];

  const agents = [
    { id: "setup", agent: new SetupAgent() },
    { id: "database", agent: new DatabaseBuildAgent() },
    { id: "auth", agent: new AuthBuildAgent() },
    { id: "landing", agent: new LandingBuildAgent() },
    { id: "dashboard", agent: new DashboardBuildAgent() },
    { id: "api", agent: new ApiBuildAgent() },
    { id: "docs", agent: new DocsBuildAgent() },
  ];

  // Run agents in parallel groups
  // Group 1: setup + database + auth (no dependencies)
  // Group 2: landing + dashboard + api + docs (may use overview data)
  const group1 = agents.slice(0, 3);
  const group2 = agents.slice(3);

  group1.forEach(({ id }) => onStep(id, "running"));
  const group1Results = await Promise.allSettled(
    group1.map(({ id, agent }) =>
      agent.run(output).then(files => {
        onStep(id, "done");
        return files;
      }).catch(err => {
        onStep(id, "error");
        console.error(`[BuildAgent:${id}]`, err);
        return [] as GeneratedFile[];
      })
    )
  );
  group1Results.forEach(r => {
    if (r.status === "fulfilled") allFiles.push(...r.value);
  });

  group2.forEach(({ id }) => onStep(id, "running"));
  const group2Results = await Promise.allSettled(
    group2.map(({ id, agent }) =>
      agent.run(output).then(files => {
        onStep(id, "done");
        return files;
      }).catch(err => {
        onStep(id, "error");
        console.error(`[BuildAgent:${id}]`, err);
        return [] as GeneratedFile[];
      })
    )
  );
  group2Results.forEach(r => {
    if (r.status === "fulfilled") allFiles.push(...r.value);
  });

  return allFiles;
}
