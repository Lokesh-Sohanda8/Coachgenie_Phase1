"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, RefreshCw, Trophy, TrendingUp, Target, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAcademicStore } from "@/lib/stores/academic.store";

// Pre-built AI growth card content keyed to avg performance
function generateGrowthContent(name: string, avgScore: number | null, subjects: string[]) {
  const firstName = name.split(" ")[0]!;
  if (avgScore === null) {
    return {
      summary:    `${firstName} has recently joined CoachGenie and is in the early stages of their learning journey. Initial assessments are being scheduled.`,
      strengths:  ["Eager to learn", "Regular attendance", "Participates actively in class"],
      areas:      ["Assessment data being collected", "Subject benchmarks being established"],
      goal:       `Complete initial assessment cycle and establish baseline performance metrics for ${firstName}.`,
      quote:      "Every expert was once a beginner.",
      rating:     3,
    };
  }
  if (avgScore >= 80) return {
    summary:    `${firstName} is an outstanding performer demonstrating exceptional grasp across ${subjects.join(", ")}. Consistently scoring in the top percentile with excellent analytical ability.`,
    strengths:  ["Strong conceptual understanding", "Excellent problem-solving approach", "High accuracy under exam conditions", "Self-motivated learner"],
    areas:      ["Push for 95%+ to secure top ranks", "Practice more time-bound mock exams", "Explore advanced topics beyond syllabus"],
    goal:       `Target top 3 rank in the next unit test and begin JEE/NEET advanced preparation.`,
    quote:      "Excellence is not a destination but a continuous journey.",
    rating:     5,
  };
  if (avgScore >= 60) return {
    summary:    `${firstName} is making good progress and shows solid understanding of core concepts in ${subjects.join(", ")}. With focused effort, significant improvement is achievable.`,
    strengths:  ["Good conceptual foundation", "Consistent effort", "Responds well to feedback", "Improving trend visible"],
    areas:      ["Work on time management during exams", "Strengthen weak topics identified in recent tests", "Increase practice problem volume"],
    goal:       `Achieve 80%+ in the next exam cycle through targeted revision of flagged topics.`,
    quote:      "Progress is progress, no matter how small.",
    rating:     4,
  };
  return {
    summary:    `${firstName} is working through challenges in ${subjects.join(", ")}. With dedicated support and consistent practice, we are confident in their ability to improve significantly.`,
    strengths:  ["Shows up consistently", "Willing to ask questions", "Responds to one-on-one attention"],
    areas:      ["Fundamental concepts need reinforcement", "Daily practice sessions recommended", "Parent-teacher coordination advised"],
    goal:       `Achieve 60%+ in the next assessment through focused daily practice and doubt-clearing sessions.`,
    quote:      "The secret of getting ahead is getting started.",
    rating:     2,
  };
}

export default function GrowthCardPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const router        = useRouter();
  const store         = useAcademicStore();
  const student       = store.students.find(s => s.id === studentId);
  const [generating, setGenerating] = useState(false);
  const [generated,  setGenerated]  = useState(false);

  if (!student) return null;

  const studentExams = store.exams.filter(e => e.results.some(r => r.studentId === studentId && r.marks !== null));
  const avgScore = studentExams.length > 0
    ? Math.round(studentExams.reduce((sum, e) => {
        const r = e.results.find(x => x.studentId === studentId);
        return sum + ((r?.marks ?? 0) / e.maxMarks) * 100;
      }, 0) / studentExams.length)
    : null;

  const content = generateGrowthContent(student.name, avgScore, student.subjects);

  async function handleRegenerate() {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    setGenerating(false);
    setGenerated(true);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.push("/growth-cards")}
            className="mt-1 rounded-lg p-2 hover:bg-accent text-muted-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {student.name}
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> AI Growth Card
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">{student.grade} · {student.subjects.join(", ")}</p>
          </div>
        </div>
        <button onClick={handleRegenerate} disabled={generating}
          className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60">
          <RefreshCw className={cn("h-4 w-4", generating && "animate-spin")} />
          {generating ? "Generating…" : "Regenerate"}
        </button>
      </div>

      {/* Card */}
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 space-y-5 shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Academic Growth Card</p>
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-sm text-muted-foreground">{student.grade} · Academic Year 2024–25</p>
          </div>
          <div className="text-center">
            <div className="flex gap-0.5 mb-1">
              {Array.from({length:5}).map((_,i) => (
                <Star key={i} className={cn("h-4 w-4", i < content.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Overall Rating</p>
            {avgScore !== null && (
              <p className="text-2xl font-bold text-primary mt-1">{avgScore}%</p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI Summary
          </p>
          <p className="text-sm leading-relaxed text-foreground">{content.summary}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Strengths */}
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" /> Strengths
            </p>
            <ul className="space-y-1.5">
              {content.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Areas to improve */}
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Areas to Improve
            </p>
            <ul className="space-y-1.5">
              {content.areas.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Goal */}
        <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
          <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Next Goal</p>
            <p className="text-sm font-medium">{content.goal}</p>
          </div>
        </div>

        {/* Quote */}
        <div className="text-center py-2">
          <p className="text-sm italic text-muted-foreground">"{content.quote}"</p>
        </div>

        {/* Exam performance */}
        {studentExams.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent Exams</p>
            <div className="space-y-2">
              {studentExams.slice(0,3).map(exam => {
                const result = exam.results.find(r => r.studentId === studentId);
                const pct    = result?.marks !== null ? Math.round(((result?.marks ?? 0)/exam.maxMarks)*100) : 0;
                return (
                  <div key={exam.id} className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground flex-1 truncate">{exam.name}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full",
                          pct>=75?"bg-emerald-500":pct>=50?"bg-amber-500":"bg-red-500"
                        )} style={{width:`${pct}%`}} />
                      </div>
                      <span className="font-semibold w-10 text-right">{pct}%</span>
                      <span className="text-muted-foreground">({result?.marks}/{exam.maxMarks})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}