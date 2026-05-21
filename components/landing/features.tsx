"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Database, CreditCard, Lock, Layout, Code2, Rocket,
  Cpu, FileJson, GitBranch
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Cpu,
    title: "AI Agent Pipeline",
    description: "Five specialized Claude AI agents run in parallel — planner, frontend, backend, database, and billing — each optimized for their domain.",
    gradient: "from-violet-600 to-purple-600",
  },
  {
    icon: Database,
    title: "Database Schema",
    description: "Auto-generate normalized PostgreSQL schemas with Prisma ORM, including tables, columns, types, and relationships.",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    icon: CreditCard,
    title: "Stripe Billing",
    description: "Get a complete Stripe product structure with pricing tiers, trial periods, webhook events, and customer portal configuration.",
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    icon: Lock,
    title: "Auth Architecture",
    description: "Full Supabase authentication setup with OAuth providers, protected routes, session management, and role-based access control.",
    gradient: "from-amber-600 to-orange-600",
  },
  {
    icon: Layout,
    title: "Frontend Blueprint",
    description: "Page-by-page frontend structure with component hierarchies, route definitions, and responsive design recommendations.",
    gradient: "from-pink-600 to-rose-600",
  },
  {
    icon: Code2,
    title: "API Route Design",
    description: "RESTful API endpoints with HTTP methods, auth middleware, request/response schemas, and rate limiting strategies.",
    gradient: "from-indigo-600 to-blue-600",
  },
  {
    icon: Rocket,
    title: "Deployment Plan",
    description: "Step-by-step Vercel deployment guide with environment variables, CI/CD configuration, and monitoring setup.",
    gradient: "from-violet-600 to-indigo-600",
  },
  {
    icon: FileJson,
    title: "JSON Export",
    description: "Export your entire blueprint as structured JSON to import into your codebase, project management tool, or AI coding assistant.",
    gradient: "from-teal-600 to-emerald-600",
  },
  {
    icon: GitBranch,
    title: "Implementation Roadmap",
    description: "Phased development timeline with milestones, deliverables, and time estimates tailored to your startup's scope.",
    gradient: "from-orange-600 to-amber-600",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-3"
          >
            Everything you need
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          >
            One prompt.{" "}
            <span className="gradient-text">Nine outputs.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            LaunchForge AI runs a full multi-agent pipeline that generates every layer
            of your SaaS — from database to deployment.
          </motion.p>
        </div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card
                hover
                className="h-full border-border/50 bg-card/50 backdrop-blur-sm group"
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}
                  >
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
