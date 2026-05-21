"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderOpen, Trash2, ArrowRight, Wand2, Search, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function ProjectsPage() {
  const { user, loading: userLoading } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("projects")
      .select("id, name, industry, prompt, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!userLoading) fetchProjects();
  }, [userLoading, fetchProjects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.prompt.toLowerCase().includes(search.toLowerCase()) ||
    p.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your saved SaaS blueprints in one place.
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/generate" className="gap-2">
            <Wand2 className="h-4 w-4" />
            New Blueprint
          </Link>
        </Button>
      </motion.div>

      {/* Search */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </motion.div>
      )}

      {/* Content */}
      {loading || userLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-border/50 animate-pulse bg-accent/30" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
            <FolderOpen className="h-8 w-8 text-violet-400" />
          </div>
          <h2 className="font-semibold text-lg mb-2">
            {search ? "No matching projects" : "No projects yet"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {search
              ? "Try a different search term."
              : "Generate your first SaaS blueprint and it will appear here automatically."}
          </p>
          {!search && (
            <Button variant="gradient" asChild>
              <Link href="/generate">Generate your first blueprint</Link>
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="border-border/50 hover:border-violet-500/30 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-semibold text-sm">{project.name}</span>
                        <Badge variant="violet" className="text-xs capitalize">
                          {project.industry}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {project.prompt}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(project.id)}
                        disabled={deleting === project.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Link href={`/projects/${project.id}`} className="gap-1">
                          Open <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <p className="text-center text-xs text-muted-foreground pt-4">
            {filtered.length} {filtered.length === 1 ? "project" : "projects"}
            {search && ` matching "${search}"`}
          </p>
        </motion.div>
      )}
    </div>
  );
}
