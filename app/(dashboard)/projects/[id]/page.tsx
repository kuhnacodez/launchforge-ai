"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OutputTabs } from "@/components/generator/output-tabs";
import { formatDate } from "@/lib/utils";
import type { GenerationOutput } from "@/types";

interface Project {
  id: string;
  name: string;
  industry: string;
  prompt: string;
  output: GenerationOutput;
  created_at: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then(({ project, error }) => {
        if (error || !project) { setNotFound(true); }
        else { setProject(project); }
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/projects");
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="h-8 w-48 rounded-lg bg-accent/50 animate-pulse mb-8" />
        <div className="h-96 rounded-2xl bg-accent/30 animate-pulse" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-semibold mb-2">Project not found</h2>
        <p className="text-sm text-muted-foreground mb-6">This project may have been deleted or doesn&apos;t exist.</p>
        <Button variant="outline" onClick={() => router.push("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-2 text-muted-foreground" onClick={() => router.push("/projects")}>
          <ArrowLeft className="h-4 w-4" /> Projects
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant="violet" className="capitalize">{project.industry}</Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">{project.prompt}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Generated {formatDate(project.created_at)}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            onClick={handleDelete}
            loading={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <OutputTabs output={project.output} />
      </motion.div>
    </div>
  );
}
