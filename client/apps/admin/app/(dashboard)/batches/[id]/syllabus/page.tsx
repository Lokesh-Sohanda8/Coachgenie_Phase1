// "use client";
// import { use, useState } from "react";
// import Link from "next/link";
// import { ArrowLeft, CheckCircle2, Circle, Plus, X } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAcademicStore } from "@/lib/stores/academic.store";
// import { toast } from "sonner";

// export default function BatchSyllabusPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = use(params);
//   const store  = useAcademicStore();
//   const batch  = store.batches.find(b => b.id === id);

//   const [showForm, setShowForm] = useState(false);
//   const [title, setTitle]       = useState("");
//   const [sessions, setSessions] = useState("1");

//   if (!batch) return null;

//   const completed = batch.syllabus.filter(t => t.completed).length;
//   const pct       = batch.syllabus.length > 0
//     ? Math.round((completed / batch.syllabus.length) * 100)
//     : 0;

//   function toggle(topicId: string) {
//     store.toggleSyllabus(id, topicId);
//     toast.success("Syllabus updated");
//   }

//   function handleAdd() {
//     const trimmed = title.trim();
//     if (!trimmed) { toast.error("Topic title is required"); return; }
//     const numSessions = parseInt(sessions, 10);
//     if (!numSessions || numSessions < 1) { toast.error("Enter a valid session count"); return; }

//     store.addSyllabusTopic(id, { title: trimmed, sessions: numSessions });
//     toast.success("Topic added");
//     setTitle("");
//     setSessions("1");
//     setShowForm(false);
//   }

//   return (
//     <div className="space-y-5 max-w-2xl">
//       {/* Header */}
//       <div className="flex items-center gap-3">
//         <Link href={`/batches/${id}`} className="rounded-lg p-2 hover:bg-accent text-muted-foreground transition-colors">
//           <ArrowLeft className="h-4 w-4" />
//         </Link>
//         <div className="flex-1">
//           <h1 className="text-xl font-bold">{batch.name} — Syllabus</h1>
//           <p className="text-sm text-muted-foreground">{completed}/{batch.syllabus.length} topics completed</p>
//         </div>
//         <button
//           onClick={() => setShowForm(v => !v)}
//           className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
//         >
//           <Plus className="h-4 w-4" />
//           Add Topic
//         </button>
//       </div>

//       {/* Add Topic Form */}
//       {showForm && (
//         <div className="rounded-xl border bg-card p-5 space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-sm font-semibold">New Topic</h2>
//             <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//           <div className="flex gap-3">
//             <input
//               autoFocus
//               value={title}
//               onChange={e => setTitle(e.target.value)}
//               onKeyDown={e => e.key === "Enter" && handleAdd()}
//               placeholder="Topic title e.g. Kinematics"
//               className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
//             />
//             <input
//               type="number"
//               min={1}
//               value={sessions}
//               onChange={e => setSessions(e.target.value)}
//               placeholder="Sessions"
//               className="w-24 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
//             />
//             <button
//               onClick={handleAdd}
//               className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
//             >
//               Add
//             </button>
//           </div>
//           <p className="text-xs text-muted-foreground">Press Enter or click Add. Sessions = number of classes for this topic.</p>
//         </div>
//       )}

//       {/* Progress */}
//       <div className="rounded-xl border bg-card p-5 space-y-3">
//         <div className="flex justify-between text-sm">
//           <span className="font-medium">Overall Progress</span>
//           <span className="font-bold text-primary">{pct}%</span>
//         </div>
//         <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
//           <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
//         </div>
//       </div>

//       {/* Topics */}
//       <div className="space-y-2">
//         {batch.syllabus.length === 0 ? (
//           <div className="flex flex-col items-center justify-center gap-3 h-40 rounded-xl border bg-card text-sm text-muted-foreground">
//             <p>No syllabus topics added yet.</p>
//             <button
//               onClick={() => setShowForm(true)}
//               className="flex items-center gap-1.5 text-primary text-xs font-medium hover:underline"
//             >
//               <Plus className="h-3.5 w-3.5" /> Add your first topic
//             </button>
//           </div>
//         ) : batch.syllabus.map((topic, i) => (
//           <button key={topic.id} onClick={() => toggle(topic.id)}
//             className={cn(
//               "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
//               topic.completed
//                 ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
//                 : "bg-card hover:bg-muted/50"
//             )}>
//             <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{i + 1}</span>
//             {topic.completed
//               ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
//               : <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
//             }
//             <div className="flex-1 min-w-0">
//               <p className={cn("text-sm font-medium", topic.completed && "line-through text-muted-foreground")}>
//                 {topic.title}
//               </p>
//             </div>
//             <span className="text-xs text-muted-foreground shrink-0">{topic.sessions} sessions</span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

function authHeaders(): HeadersInit {
  let token: string | null = null;
  let tenantId: string | null = null;
  try {
    const raw   = localStorage.getItem("coachgenie-auth");
    const state = raw ? JSON.parse(raw)?.state : null;
    token    = state?.accessToken ?? null;
    tenantId = state?.tenantId    ?? null;
  } catch {}
  return {
    "Content-Type": "application/json",
    ...(token    ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { "X-Tenant-Id": tenantId }          : {}),
  };
}

type Topic = {
  id: string;
  title: string;
  completed: boolean;
  sessions: number;
};

export default function BatchSyllabusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const [topics,    setTopics]    = useState<Topic[]>([]);
  const [batchName, setBatchName] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [title,     setTitle]     = useState("");
  const [sessions,  setSessions]  = useState("1");
  const [saving,    setSaving]    = useState(false);

  // ── Load syllabus from backend ──────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load batch name
        const bRes  = await fetch(`${API}/batches/${id}`, { headers: authHeaders() });
        if (bRes.ok) {
          const b = await bRes.json();
          setBatchName(b.name ?? "");
        }
        // Load syllabus topics
        const sRes  = await fetch(`${API}/batches/${id}/syllabus`, { headers: authHeaders() });
        if (sRes.ok) {
          const data = await sRes.json();
          const raw: any[] = Array.isArray(data) ? data : (data.data ?? data.topics ?? []);
          setTopics(raw.map(t => ({
            id:        String(t.id),
            title:     t.title ?? t.name ?? "",
            completed: t.completed ?? t.is_completed ?? false,
            sessions:  t.sessions  ?? t.session_count ?? 0,
          })));
        }
      } catch (err) {
        toast.error("Failed to load syllabus");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // ── Toggle topic complete ───────────────────────────────────
  async function toggle(topic: Topic) {
    // Optimistic update
    setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, completed: !t.completed } : t));
    try {
      const res = await fetch(`${API}/batches/${id}/syllabus/${topic.id}/progress`, {
        method:  "PATCH",
        headers: authHeaders(),
        body:    JSON.stringify({ completed: !topic.completed }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Syllabus updated");
    } catch {
      // Revert on failure
      setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, completed: topic.completed } : t));
      toast.error("Failed to update topic");
    }
  }

  // ── Add topic ───────────────────────────────────────────────
  async function handleAdd() {
    const trimmed = title.trim();
    if (!trimmed) { toast.error("Topic title is required"); return; }
    const numSessions = parseInt(sessions, 10);
    if (!numSessions || numSessions < 1) { toast.error("Enter a valid session count"); return; }
    setSaving(true);
    try {
      // Your backend uses subjects for syllabus topics — post to batch syllabus
      // Try batch-level syllabus endpoint first
      const res = await fetch(`${API}/batches/${id}/syllabus`, {
        method:  "POST",
        headers: authHeaders(),
        body:    JSON.stringify({
          title:         trimmed,
          session_count: numSessions,
          completed:     false,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      setTopics(prev => [...prev, {
        id:        String(created.id),
        title:     created.title ?? trimmed,
        completed: false,
        sessions:  created.sessions ?? created.session_count ?? numSessions,
      }]);
      setTitle(""); setSessions("1"); setShowForm(false);
      toast.success("Topic added");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add topic");
    } finally {
      setSaving(false);
    }
  }

  const completed = topics.filter(t => t.completed).length;
  const pct       = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0;

  if (loading) return (
    <div className="space-y-4 max-w-2xl">
      <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="h-20 rounded-xl bg-muted animate-pulse" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/batches/${id}`}
          className="rounded-lg p-2 hover:bg-accent text-muted-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{batchName} — Syllabus</h1>
          <p className="text-sm text-muted-foreground">{completed}/{topics.length} topics completed</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Topic
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">New Topic</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-3">
            <input autoFocus value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Topic title e.g. Kinematics"
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <input type="number" min={1} value={sessions}
              onChange={e => setSessions(e.target.value)}
              placeholder="Sessions"
              className="w-24 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button onClick={handleAdd} disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {saving ? "Adding…" : "Add"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Press Enter or click Add.</p>
        </div>
      )}

      {/* Progress */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span className="font-bold text-primary">{pct}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-2">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 h-40 rounded-xl border bg-card text-sm text-muted-foreground">
            <p>No syllabus topics added yet.</p>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 text-primary text-xs font-medium hover:underline">
              <Plus className="h-3.5 w-3.5" /> Add your first topic
            </button>
          </div>
        ) : topics.map((topic, i) => (
          <button key={topic.id} onClick={() => toggle(topic)}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
              topic.completed
                ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                : "bg-card hover:bg-muted/50"
            )}>
            <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{i + 1}</span>
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