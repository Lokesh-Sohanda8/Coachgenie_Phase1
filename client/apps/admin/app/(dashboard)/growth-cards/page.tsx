"use client";
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAcademicStore } from "@/lib/stores/academic.store";

export default function GrowthCardsPage() {
  const { students, exams } = useAcademicStore();

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Growth Cards
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-generated performance summaries for each student
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((student, i) => {
          const studentExams = exams.filter(e => e.results.some(r => r.studentId === student.id && r.marks !== null));
          const avgScore = studentExams.length > 0
            ? Math.round(studentExams.reduce((sum, e) => {
                const result = e.results.find(r => r.studentId === student.id);
                return sum + ((result?.marks ?? 0) / e.maxMarks) * 100;
              }, 0) / studentExams.length)
            : null;

          return (
            <Link key={student.id} href={`/growth-cards/${student.id}`}
              className="rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/20 transition-all group fade-in"
              style={{ animationDelay:`${i*50}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {student.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.grade}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Avg Score</span>
                  <span className={cn("font-semibold",
                    avgScore === null ? "text-muted-foreground" :
                    avgScore >= 75 ? "text-emerald-600" : avgScore >= 50 ? "text-amber-600" : "text-red-500"
                  )}>
                    {avgScore !== null ? `${avgScore}%` : "No data"}
                  </span>
                </div>
                {avgScore !== null && (
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full",
                      avgScore>=75?"bg-emerald-500":avgScore>=50?"bg-amber-500":"bg-red-500"
                    )} style={{ width:`${avgScore}%` }} />
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{studentExams.length} exams</span>
                  <span className="flex items-center gap-0.5 text-primary">
                    <Sparkles className="h-2.5 w-2.5" /> AI Card Ready
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}