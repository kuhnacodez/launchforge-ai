"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wand2, FolderOpen, Zap, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

interface Project {
  id: string;
  name: string;
  industry: string;
  prompt: string;
  created_at: string;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const { user, profile, loading } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("projects")
      .select("id, name, industry, prompt, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setProjects(data ?? []);
        setProjectsLoading(false);
      });
  }, [user]);

  const generationsUsed = profile?.generations_used ?? 0;
  const generationsLimit = profile?.generations_limit ?? 3;
  const usagePercent = Math.min((generationsUsed / generationsLimit) * 100, 100);

  const lastProject = projects[0];
  const lastGeneratedLabel = lastProject
    ? formatDate(lastProject.created_at)
    : "Never";

  const stats = [
    {
      label: "Generations Used",
      value: generationsUsed,
      limit: generationsLimit,
      unit: `/ ${generationsLimit} this month`,
      icon: Zap,
      color: "text-violet-400",
    },
    {
      label: "Saved Projects",
      value: projects.length,
      limit: null,
      unit: "total",
      icon: FolderOpen,
      color: "text-blue-400",
    },
    {
      label: "Last Generated",
      value: lastGeneratedLabel,
      limit: null,
      unit: "",
      icon: Clock,
      color: "text-emerald-400",
    },
    {
      label: "Usage",
      value: `${Math.round(usagePercent)}%`,
      limit: null,
      unit: "of monthly limit",
      icon: TrendingUp,
      color: "text-amber-400",
    },
  ];

  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? "Loading…" : `Welcome back, ${displayName}. Ready to build something great?`}
        </p>
      </motion.div>

      {/* Quick action */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent border border-violet-500/20 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg mb-1">Generate a new SaaS blueprint</h2>
              <p className="text-sm text-muted-foreground">
                Describe your idea and get a full architecture in seconds.
              </p>
            </div>
            <Button
              variant="gradient"
              size="lg"
              asChild
              className="flex-shrink-0"
              disabled={generationsUsed >= generationsLimit}
            >
              <Link href="/generate" className="gap-2">
                <Wand2 className="h-4 w-4" />
                {generationsUsed >= generationsLimit ? "Limit Reached" : "Start Generating"}
              </Link>
            </Button>
          </div>
          {generationsUsed >= generationsLimit && (
            <p className="text-xs text-amber-400 mt-3">
              You&apos;ve reached your monthly limit.{" "}
              <Link href="/pricing" className="underline">Upgrade to Pro</Link> for unlimited generations.
            </p>
          )}
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold mb-1">{loading ? "—" : stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.unit}</div>
                {stat.limit && !loading && (
                  <Progress
                    value={(Number(stat.value) / stat.limit) * 100}
                    className="mt-3 h-1.5"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent projects */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Recent Projects</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-xl border border-border/50 animate-pulse bg-accent/30" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No projects yet.</p>
                <Button variant="gradient" size="sm" className="mt-4" asChild>
                  <Link href="/generate">Generate your first blueprint</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-start justify-between rounded-xl border border-border/50 p-4 hover:bg-accent/50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{project.name}</span>
                        <Badge variant="violet" className="text-xs">{project.industry}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-md">
                        {project.prompt}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(project.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                    >
                      <Link href={`/projects/${project.id}`}>
                        Open <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
