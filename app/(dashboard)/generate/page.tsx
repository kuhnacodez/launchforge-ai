"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Cpu, Database, CreditCard, Globe, Layout, CheckCircle2, AlertTriangle } from "lucide-react";
import { GenerationForm } from "@/components/generator/generation-form";
import { OutputTabs } from "@/components/generator/output-tabs";
import { BuildPanel } from "@/components/builder/build-panel";
import { useUser } from "@/hooks/useUser";
import type { GenerationInput, GenerationOutput } from "@/types";

const GENERATION_STEPS = [
  { icon: Cpu, label: "Running planner agent...", color: "text-violet-400" },
  { icon: Layout, label: "Designing frontend structure...", color: "text-blue-400" },
  { icon: Database, label: "Generating database schema...", color: "text-emerald-400" },
  { icon: Globe, label: "Planning API routes...", color: "text-amber-400" },
  { icon: CreditCard, label: "Structuring Stripe billing...", color: "text-pink-400" },
];

export default function GeneratePage() {
  const { profile, loading } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [output, setOutput] = useState<GenerationOutput | null>(null);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generationsUsed = profile?.generations_used ?? 0;
  const generationsLimit = profile?.generations_limit ?? 3;
  const atLimit = !loading && generationsUsed >= generationsLimit;

  const handleGenerate = async (input: GenerationInput) => {
    setIsGenerating(true);
    setOutput(null);
    setSavedProjectId(null);
    setError(null);
    setCurrentStep(0);

    try {
      // Animate through steps while the real fetch runs
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => Math.min(prev + 1, GENERATION_STEPS.length - 1));
      }, 700);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      clearInterval(stepInterval);
      setCurrentStep(GENERATION_STEPS.length - 1);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError("You've reached your monthly generation limit. Upgrade to Pro for unlimited generations.");
        } else if (response.status === 503) {
          setError("AI service is not configured. Add ANTHROPIC_API_KEY to your environment variables, then redeploy.");
        } else {
          setError(data.error ?? "Generation failed. Please try again.");
        }
        return;
      }

      setOutput(data.output);
      if (data.project_id) setSavedProjectId(data.project_id);
    } catch {
      setError("Generation failed. Check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <h1 className="text-2xl font-bold tracking-tight">AI Generator</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Describe your SaaS idea and our AI agent pipeline will generate a complete product blueprint.
        </p>
      </div>

      {/* Generation limit warning banner */}
      {atLimit && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-amber-400">Monthly limit reached.</span>{" "}
            <span className="text-muted-foreground">
              You&apos;ve used {generationsUsed}/{generationsLimit} generations.{" "}
              <Link href="/pricing" className="text-amber-400 underline">Upgrade to Pro</Link> for unlimited access.
            </span>
          </div>
        </div>
      )}

      {/* Usage indicator */}
      {!loading && !atLimit && (
        <div className="mb-6 text-xs text-muted-foreground">
          {generationsUsed}/{generationsLimit} generations used this month
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Form sidebar */}
        <div className="xl:col-span-2">
          <div className="sticky top-6">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <h2 className="text-sm font-semibold mb-4">Configure your SaaS</h2>
              <GenerationForm
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                disabled={atLimit}
              />
            </div>
          </div>
        </div>

        {/* Output area */}
        <div className="xl:col-span-3">
          <AnimatePresence mode="wait">
            {isGenerating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                {/* Animated ring */}
                <div className="relative mb-8">
                  <div className="h-20 w-20 rounded-full border-2 border-violet-500/20 animate-ping absolute inset-0" />
                  <div className="h-20 w-20 rounded-full border-2 border-violet-500/40 animate-pulse absolute inset-0" />
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center relative">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>

                <p className="text-lg font-semibold mb-2">Generating blueprint</p>

                <div className="space-y-2 w-full max-w-xs">
                  {GENERATION_STEPS.map((step, i) => {
                    const isActive = i === currentStep;
                    const isDone = i < currentStep;
                    return (
                      <motion.div
                        key={step.label}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive ? "bg-violet-500/10" : ""}`}
                        animate={{ opacity: isDone ? 0.4 : isActive ? 1 : 0.3 }}
                      >
                        <step.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? step.color : "text-muted-foreground"}`} />
                        <span className={`text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                        {isDone && <span className="ml-auto text-xs text-emerald-400">✓</span>}
                        {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {!isGenerating && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl border border-destructive/30 bg-destructive/5 text-center p-8"
              >
                <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                <p className="font-semibold mb-2">Generation failed</p>
                <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
                {error.includes("limit") && (
                  <Link href="/pricing" className="mt-4 text-sm text-violet-400 underline">
                    View upgrade options
                  </Link>
                )}
              </motion.div>
            )}

            {!isGenerating && !output && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl border border-border/50 border-dashed text-center p-8"
              >
                <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-violet-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Your blueprint will appear here</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Fill in the form on the left with your SaaS idea and click Generate to run our
                  AI agent pipeline.
                </p>
              </motion.div>
            )}

            {!isGenerating && output && (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {savedProjectId && (
                  <BuildPanel output={output} projectId={savedProjectId} />
                )}
                <OutputTabs output={output} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
