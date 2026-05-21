"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EXAMPLE_PROMPTS = [
  "AI fitness coaching SaaS with subscriptions...",
  "B2B analytics platform for e-commerce stores...",
  "Marketplace connecting freelancers with startups...",
  "EdTech platform with AI tutoring and payments...",
];

export function Hero() {
  const [promptIndex, setPromptIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((i) => (i + 1) % EXAMPLE_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-background to-background" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <Badge variant="violet" className="px-4 py-1.5 text-sm gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Claude AI · Now in Beta
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
        >
          Describe your startup.
          <br />
          <span className="gradient-text">Launch your SaaS.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          LaunchForge AI generates your entire SaaS architecture — database schema,
          API routes, Stripe billing, auth setup, and deployment plan — in seconds.
        </motion.p>

        {/* Animated prompt preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto max-w-2xl mb-10"
        >
          <div className="glass rounded-2xl border border-white/10 p-1">
            <div className="rounded-xl bg-background/50 px-5 py-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-muted-foreground font-mono">prompt</span>
              </div>
              <motion.p
                key={promptIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-sm sm:text-base text-foreground/80"
              >
                &quot;{EXAMPLE_PROMPTS[promptIndex]}&quot;
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button size="xl" variant="gradient" asChild>
            <Link href="/signup" className="group">
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="xl" variant="ghost" asChild>
            <Link href="/generate">
              <Zap className="mr-2 h-4 w-4" />
              Try the Generator
            </Link>
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-xs text-muted-foreground"
        >
          No credit card required · Free tier available · 3 blueprints / month
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: "2,400+", label: "Blueprints generated" },
            { value: "< 10s", label: "Generation time" },
            { value: "9", label: "Output categories" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
