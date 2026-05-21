"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Founder, DataPulse",
    avatar: null,
    initials: "SC",
    quote: "LaunchForge saved me 2 weeks of architecture planning. I described my analytics SaaS and got a complete Prisma schema, Stripe billing structure, and deployment guide instantly.",
    stars: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO, FitPath",
    avatar: null,
    initials: "MR",
    quote: "The AI agent system is genuinely impressive. Each agent specializes in its domain — the database agent alone gave me a better schema than I would have designed in hours.",
    stars: 5,
  },
  {
    name: "Priya Kapoor",
    role: "Solo Founder",
    avatar: null,
    initials: "PK",
    quote: "I'm not technical but LaunchForge gave me the vocabulary and structure to work with my developer effectively. The phased roadmap was exactly what I needed to scope the project.",
    stars: 5,
  },
  {
    name: "James Wu",
    role: "Product Engineer, Scalar",
    avatar: null,
    initials: "JW",
    quote: "The JSON export integrates perfectly with my workflow. I feed it directly into Claude Code and get a working Next.js scaffold in minutes. Incredible time saver.",
    stars: 5,
  },
  {
    name: "Emma Laurent",
    role: "Indie Hacker",
    avatar: null,
    initials: "EL",
    quote: "Built three different product experiments using LaunchForge. The Stripe billing structure it generates is production-ready — I just swap in the real price IDs.",
    stars: 5,
  },
  {
    name: "Aiden Park",
    role: "Engineering Lead, Nexus",
    avatar: null,
    initials: "AP",
    quote: "What impressed me most is the API route design. It generates proper REST conventions with auth middleware, rate limiting, and typed request/response schemas.",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-3"
          >
            Loved by builders
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight"
          >
            Don&apos;t take our word for it
          </motion.h2>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
            >
              <Card className="h-full border-border/50 bg-card/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={t.avatar ?? undefined} />
                      <AvatarFallback className="text-xs bg-violet-500/20 text-violet-400">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
