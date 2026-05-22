import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { runBuildPipeline } from "@/agents/build/build-orchestrator";
import { createZip } from "@/lib/zip";
import { createGitHubRepo } from "@/lib/github";
import type { GenerationOutput } from "@/types";

export const maxDuration = 300;

function send(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { output, project_id, github_token } = await req.json() as {
    output: GenerationOutput;
    project_id: string;
    github_token?: string;
  };

  const stream = new ReadableStream({
    async start(controller) {
      try {
        send(controller, { type: "start", message: "Starting build pipeline..." });

        const files = await runBuildPipeline(output, (id, status) => {
          send(controller, { type: "step", id, status });
        });

        send(controller, { type: "progress", message: "Packaging files into ZIP..." });
        const zipBase64 = await createZip(files);

        let repoUrl: string | null = null;
        if (github_token) {
          send(controller, { type: "progress", message: "Creating GitHub repository..." });
          try {
            repoUrl = await createGitHubRepo(github_token, output.overview.name, files);
          } catch (err) {
            console.error("[Build] GitHub push failed:", err);
            send(controller, { type: "warning", message: "GitHub push failed — ZIP download still available." });
          }
        }

        // Save build result to project
        await supabase.from("projects").update({ build_zip: zipBase64, repo_url: repoUrl }).eq("id", project_id);

        send(controller, { type: "done", zip: zipBase64, repo_url: repoUrl, file_count: files.length });
      } catch (err) {
        console.error("[POST /api/build]", err);
        send(controller, { type: "error", message: "Build failed. Please try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
