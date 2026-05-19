"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAcademicStore } from "@/lib/stores/academic.store";
import { toast } from "sonner";

export default function BatchSyllabusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params);
  const store    = useAcademicStore();
  const batch    = store.batches.find(b => b.id === id);

  if (!batch) return null;

  const completed = batch.syllabus.filter(t => t.completed).length;
  const pct       = batch.syllabus.length > 0 ? Math.round((completed/batch.syllabus.length)*100) : 0;

  function toggle(topicId: string) {
    store.toggleSyllabus(id, topicId);
    toast.success("Syllabus updated");
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/batches/${id}`} className="rounded-lg p-2 hover:bg-accent text-muted-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{batch.name} — Syllabus</h1>
          <p className="text-sm text-muted-foreground">{completed}/{batch.syllabus.length} topics completed</p>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span className="font-bold text-primary">{pct}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width:`${pct}%` }} />
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-2">
        {batch.syllabus.length === 0 ? (
          <div className="flex items-center justify-center h-40 rounded-xl border bg-card text-sm text-muted-foreground">
            No syllabus topics added yet.
          </div>
        ) : batch.syllabus.map((topic, i) => (
          <button key={topic.id} onClick={() => toggle(topic.id)}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
              topic.completed ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800" : "bg-card hover:bg-muted/50"
            )}>
            <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{i+1}</span>
            {topic.completed
              ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              : <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", topic.completed && "line-through text-muted-foreground")}>
                {topic.title}
              </p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{topic.sessions} sessions</span>
          </button>
        ))}
      </div>
    </div>
  );
}