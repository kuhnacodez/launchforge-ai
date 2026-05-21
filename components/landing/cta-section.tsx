"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl border border-white/10 p-12"
        >
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-violet-500/30">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Ready to launch?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Join 2,400+ founders who turned their SaaS idea into a full product
            blueprint in under 10 seconds. Free to start.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="gradient" asChild>
              <Link href="/signup" className="group">
                Generate Your SaaS Blueprint
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            No credit card required · Cancel anytime · Built on Next.js + Supabase
          </p>
        </motion.div>
      </div>
    </section>
  );
}
