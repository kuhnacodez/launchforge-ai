"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, Copy, Check, Lock, Globe, Database,
  Code2, CreditCard, Rocket, FolderTree, Map, FileJson
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GenerationOutput } from "@/types";

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-blue-400",
  PUT: "text-amber-400",
  PATCH: "text-amber-400",
  DELETE: "text-red-400",
};

interface OutputTabsProps {
  output: GenerationOutput;
}

export function OutputTabs({ output }: OutputTabsProps) {
  const [copied, setCopied] = useState(false);

  const copyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(output.json_export, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{output.overview.name}</h2>
          <p className="text-sm text-muted-foreground">{output.overview.tagline}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyJSON} className="gap-2">
            {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy JSON</>}
          </Button>
          <Button variant="gradient" size="sm" className="gap-2">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 mb-6">
          {[
            { value: "overview", icon: Globe, label: "Overview" },
            { value: "pages", icon: FolderTree, label: "Pages" },
            { value: "database", icon: Database, label: "Database" },
            { value: "api", icon: Code2, label: "API Routes" },
            { value: "stripe", icon: CreditCard, label: "Billing" },
            { value: "deployment", icon: Rocket, label: "Deploy" },
            { value: "roadmap", icon: Map, label: "Roadmap" },
            { value: "json", icon: FileJson, label: "JSON" },
          ].map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">App Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/80">{output.overview.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">{output.overview.industry}</Badge>
                  <Badge variant="outline" className="text-xs">{output.input.pricing_model}</Badge>
                </div>
                <div className="mt-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Target Audience</p>
                  <p className="text-sm">{output.overview.target_audience}</p>
                </div>
                <div className="mt-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Key Differentiators</p>
                  <ul className="space-y-2">
                    {output.overview.key_differentiators.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Tech Stack</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(output.overview.tech_stack).map(([layer, techs]) => (
                    <div key={layer}>
                      <p className="text-xs font-semibold capitalize mb-1.5">{layer}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(techs as string[]).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs font-normal">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* PAGES */}
        <TabsContent value="pages">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {output.pages.map((page, i) => (
              <motion.div key={page.path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{page.name}</span>
                      {page.auth_required ? (
                        <Badge variant="amber" className="gap-1 text-xs"><Lock className="h-3 w-3" />Protected</Badge>
                      ) : (
                        <Badge variant="success" className="gap-1 text-xs"><Globe className="h-3 w-3" />Public</Badge>
                      )}
                    </div>
                    <code className="text-xs text-violet-400 bg-violet-500/10 rounded px-2 py-0.5 block mb-2">{page.path}</code>
                    <p className="text-xs text-muted-foreground mb-3">{page.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {page.components.map((c) => (
                        <span key={c} className="text-xs bg-secondary rounded px-1.5 py-0.5">{c}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* DATABASE */}
        <TabsContent value="database">
          <div className="space-y-4">
            {output.database_schema.map((table, i) => (
              <motion.div key={table.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-mono text-violet-400">{table.name}</CardTitle>
                      <div className="flex gap-1">
                        {table.relationships.map((r) => (
                          <Badge key={r} variant="blue" className="text-xs font-normal">{r}</Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{table.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Column</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Type</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Nullable</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.columns.map((col, j) => (
                            <tr key={col.name} className={j % 2 === 0 ? "" : "bg-muted/20"}>
                              <td className="px-3 py-2 font-mono text-foreground font-medium">{col.name}</td>
                              <td className="px-3 py-2 font-mono text-blue-400">{col.type}</td>
                              <td className="px-3 py-2">{col.nullable ? "Yes" : <span className="text-emerald-400">No</span>}</td>
                              <td className="px-3 py-2 text-muted-foreground">{col.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* API */}
        <TabsContent value="api">
          <div className="space-y-2">
            {output.api_routes.map((route, i) => (
              <motion.div key={`${route.method}-${route.path}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="flex items-start gap-4 rounded-xl border border-border/50 px-4 py-3 hover:bg-accent/30 transition-colors">
                  <span className={`font-mono text-xs font-bold w-14 flex-shrink-0 pt-0.5 ${METHOD_COLORS[route.method]}`}>
                    {route.method}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono text-foreground">{route.path}</code>
                      {route.auth_required && <Badge variant="amber" className="text-xs gap-1"><Lock className="h-3 w-3" />Auth</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{route.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* STRIPE */}
        <TabsContent value="stripe">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {output.stripe_plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`h-full border-border/50 ${i === 1 ? "border-violet-500/50 bg-violet-500/5" : ""}`}>
                  {i === 1 && (
                    <div className="px-6 pt-4">
                      <Badge variant="violet" className="text-xs">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                    <div className="text-3xl font-bold mb-1">
                      ${(plan.price_monthly / 100).toFixed(0)}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      ${(plan.price_yearly / 100).toFixed(0)}/yr (save 15%)
                    </p>
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <code className="mt-4 block text-xs font-mono text-muted-foreground bg-muted rounded p-2">
                      {plan.stripe_product_id}
                    </code>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* DEPLOYMENT */}
        <TabsContent value="deployment">
          <div className="space-y-4">
            {output.deployment_steps.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <Card className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{step.description}</p>
                        {step.commands && (
                          <div className="rounded-lg bg-muted/80 p-3 font-mono text-xs space-y-1">
                            {step.commands.map((cmd, j) => (
                              <div key={j} className={cmd.startsWith("#") ? "text-muted-foreground" : "text-foreground"}>
                                {cmd}
                              </div>
                            ))}
                          </div>
                        )}
                        {step.env_vars && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {step.env_vars.map((v) => (
                              <code key={v} className="text-xs bg-amber-500/10 text-amber-400 rounded px-1.5 py-0.5">{v}</code>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ROADMAP */}
        <TabsContent value="roadmap">
          <div className="space-y-4">
            {output.implementation_phases.map((phase, i) => (
              <motion.div key={phase.phase} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold">
                          {phase.phase}
                        </div>
                        <div>
                          <h3 className="font-semibold">{phase.title}</h3>
                          <p className="text-xs text-muted-foreground">{phase.duration}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tasks</p>
                        <ul className="space-y-1.5">
                          {phase.tasks.map((t, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Deliverables</p>
                        <ul className="space-y-1.5">
                          {phase.deliverables.map((d, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <Check className="h-3.5 w-3.5 mt-0.5 text-emerald-400 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* JSON */}
        <TabsContent value="json">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <span className="text-xs text-muted-foreground font-mono">blueprint.json</span>
                <Button variant="ghost" size="sm" onClick={copyJSON} className="gap-1.5 text-xs">
                  {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
                </Button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-auto max-h-[600px] text-foreground/80 leading-relaxed">
                {JSON.stringify(output.json_export, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
