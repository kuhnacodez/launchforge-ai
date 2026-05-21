"use client";

import { useState } from "react";
import { Wand2, ChevronDown, ChevronUp, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { INDUSTRIES, PRICING_MODELS, FEATURE_CATEGORIES } from "@/lib/constants";
import type { GenerationInput, Industry, PricingModel } from "@/types";

interface GenerationFormProps {
  onGenerate: (input: GenerationInput) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function GenerationForm({ onGenerate, isGenerating, disabled = false }: GenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState<Industry>("fitness");
  const [pricingModel, setPricingModel] = useState<PricingModel>("subscription");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "User Authentication",
    "Subscription Billing",
    "Admin Dashboard",
  ]);
  const [showFeatures, setShowFeatures] = useState(false);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!prompt.trim() || disabled) return;
    onGenerate({ prompt: prompt.trim(), industry, features: selectedFeatures, pricing_model: pricingModel });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          Describe your SaaS idea
        </Label>
        <Textarea
          id="prompt"
          placeholder="e.g. An AI fitness coaching SaaS with personalized workout plans, meal tracking, progress dashboards, and Stripe subscriptions for individual users and gyms..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] resize-none text-sm leading-relaxed"
          required
        />
        <p className="text-xs text-muted-foreground">
          {prompt.length}/500 characters — Be specific for better results
        </p>
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Industry</Label>
        <div className="grid grid-cols-3 gap-2">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.value}
              type="button"
              onClick={() => setIndustry(ind.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                industry === ind.value
                  ? "border-violet-500 bg-violet-500/10 text-violet-400"
                  : "border-border/50 hover:border-border hover:bg-accent"
              )}
            >
              <span>{ind.emoji}</span>
              <span className="truncate">{ind.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing model */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Pricing Model</Label>
        <div className="grid grid-cols-2 gap-2">
          {PRICING_MODELS.map((model) => (
            <button
              key={model.value}
              type="button"
              onClick={() => setPricingModel(model.value)}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                pricingModel === model.value
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-border/50 hover:border-border hover:bg-accent"
              )}
            >
              <div className={cn(
                "mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                pricingModel === model.value ? "border-violet-500" : "border-muted-foreground"
              )}>
                {pricingModel === model.value && (
                  <div className="h-2 w-2 rounded-full bg-violet-500" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium">{model.label}</p>
                <p className="text-xs text-muted-foreground">{model.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature categories */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            Features
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              ({selectedFeatures.length} selected)
            </span>
          </Label>
          <button
            type="button"
            onClick={() => setShowFeatures(!showFeatures)}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            {showFeatures ? (
              <><ChevronUp className="h-3 w-3" />Hide</>
            ) : (
              <><ChevronDown className="h-3 w-3" />Customize</>
            )}
          </button>
        </div>

        {/* Selected feature chips */}
        <div className="flex flex-wrap gap-2">
          {selectedFeatures.map((feature) => (
            <Badge
              key={feature}
              variant="violet"
              className="gap-1.5 pr-1.5 cursor-pointer hover:bg-violet-500/30 transition-colors"
              onClick={() => toggleFeature(feature)}
            >
              {feature}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <button
            type="button"
            onClick={() => setShowFeatures(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/50 px-2.5 py-0.5 text-xs text-muted-foreground hover:border-violet-500/50 hover:text-violet-400 transition-all"
          >
            <Plus className="h-3 w-3" />
            Add feature
          </button>
        </div>

        {/* Feature picker */}
        <AnimatePresence>
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-3 pb-1">
                {FEATURE_CATEGORIES.filter((f) => !selectedFeatures.includes(f)).map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2.5 py-0.5 text-xs hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-400 transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    {feature}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="gradient"
        size="lg"
        className="w-full"
        loading={isGenerating}
        disabled={!prompt.trim() || isGenerating || disabled}
      >
        <Wand2 className="mr-2 h-4 w-4" />
        {isGenerating ? "Generating blueprint..." : "Generate SaaS Blueprint"}
      </Button>
    </form>
  );
}
