"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, CheckCircle2, Circle, Loader2, Download, GitBranch, ExternalLink, AlertTriangle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { downloadZip } from "@/lib/zip";
import type { GenerationOutput } from "@/types";

const STEPS = [
  { id: "setup", label: "Project scaffolding" },
  { id: "database", label: "Database schema" },
  { id: "auth", label: "Authentication" },
  { id: "landing", label: "Landing page" },
  { id: "dashboard", label: "Dashboard & pages" },
  { id: "api", label: "API routes" },
  { id: "docs", label: "Handover documents" },
];

type StepStatus = "pending" | "running" | "done" | "error";

interface BuildPanelProps {
  output: GenerationOutput;
  projectId: string;
}

export function BuildPanel({ output, projectId }: BuildPanelProps) {
  const [githubToken, setGithubToken] = useState("");
  const [building, setBuilding] = useState(false);
  const [steps, setSteps] = useState<Record<string, StepStatus>>({});
  const [message, setMessage] = useState("");
  const [zipBase64, setZipBase64] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleBuild = async () => {
    setBuilding(true);
    setSteps({});
    setMessage("");
    setZipBase64(null);
    setRepoUrl(null);
    setError(null);
    setWarning(null);

    try {
      const res = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          output,
          project_id: projectId,
          github_token: githubToken.trim() || undefined,
        }),
      });

      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "step") {
              setSteps(prev => ({ ...prev, [event.id]: event.status }));
            } else if (event.type === "progress") {
              setMessage(event.message);
            } else if (event.type === "warning") {
              setWarning(event.message);
            } else if (event.type === "done") {
              setZipBase64(event.zip);
              setRepoUrl(event.repo_url);
              setFileCount(event.file_count);
              setMessage("");
            } else if (event.type === "error") {
              setError(event.message);
            }
          } catch {}
        }
      }
    } catch (err) {
      setError("Build failed. Please try again.");
    } finally {
      setBuilding(false);
    }
  };

  const isDone = zipBase64 !== null;
  const appSlug = output.overview.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Rocket className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-base">Build App</h2>
          <p className="text-sm text-muted-foreground">
            Generate the complete, production-ready codebase from this blueprint.
          </p>
        </div>
      </div>

      {/* GitHub token input */}
      {!building && !isDone && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <Label htmlFor="github-token" className="text-sm">
            GitHub Personal Access Token{" "}
            <span className="text-muted-foreground font-normal">(optional — for repo creation)</span>
          </Label>
          <Input
            id="github-token"
            type="password"
            placeholder="ghp_..."
            value={githubToken}
            onChange={e => setGithubToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Generate at GitHub → Settings → Developer settings → Personal access tokens → Fine-grained.
            Needs <Badge variant="outline" className="text-xs px-1 py-0 font-mono">repo</Badge> scope.
            Leave blank to get ZIP only.
          </p>
        </motion.div>
      )}

      {/* Build button */}
      {!building && !isDone && (
        <Button variant="gradient" size="lg" className="w-full gap-2" onClick={handleBuild}>
          <Hammer className="h-4 w-4" />
          Build Production App
        </Button>
      )}

      {/* Progress */}
      <AnimatePresence>
        {(building || isDone) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            {STEPS.map(step => {
              const status = steps[step.id] ?? "pending";
              return (
                <div key={step.id} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${status === "running" ? "bg-violet-500/10" : ""}`}>
                  {status === "pending" && <Circle className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />}
                  {status === "running" && <Loader2 className="h-4 w-4 text-violet-400 animate-spin flex-shrink-0" />}
                  {status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                  {status === "error" && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />}
                  <span className={`text-sm ${status === "running" ? "text-foreground font-medium" : status === "done" ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                    {step.label}
                  </span>
                  {status === "running" && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  )}
                </div>
              );
            })}

            {message && (
              <p className="text-xs text-muted-foreground px-3 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> {message}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning */}
      {warning && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span className="text-amber-400">{warning}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Done state */}
      {isDone && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-400">Build complete</p>
              <p className="text-xs text-muted-foreground">{fileCount} files generated — your app is ready to deploy.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="gradient"
              className="gap-2"
              onClick={() => downloadZip(zipBase64!, `${appSlug}.zip`)}
            >
              <Download className="h-4 w-4" />
              Download ZIP
            </Button>

            {repoUrl ? (
              <Button variant="outline" className="gap-2" asChild>
                <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                  <GitBranch className="h-4 w-4" />
                  View on GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            ) : (
              <Button variant="outline" className="gap-2" disabled>
                <GitBranch className="h-4 w-4" />
                No GitHub token provided
              </Button>
            )}
          </div>

          <div className="rounded-lg border border-border/50 bg-accent/20 px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Next steps:</p>
            <p>1. Download the ZIP and extract it (or clone from GitHub)</p>
            <p>2. Follow <span className="font-mono text-violet-400">DEPLOYMENT.md</span> — it has step-by-step setup instructions</p>
            <p>3. Run the SQL migration in Supabase, set your env vars in Vercel, and deploy</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
