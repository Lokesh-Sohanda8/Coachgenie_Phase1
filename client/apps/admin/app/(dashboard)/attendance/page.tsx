"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAcademicStore }    from "@/lib/stores/academic.store";
import { AttendanceGrid }      from "@/components/attendance/AttendanceGrid";
import { useAttendanceSession } from "@/hooks/useAttendanceSession";

function AttendanceSession({ batchId, date }: { batchId: string; date: string }) {
  const store   = useAcademicStore();
  const batch   = store.batches.find(b => b.id === batchId);
  const students = store.students.filter(s => batch?.studentIds.includes(s.id));

  const { entries, mark, markAll, save, saved, saving } = useAttendanceSession(
    students.map(s => s.id)
  );

  async function handleSave() {
    await save(async (data) => {
      store.markAttendance(data.map(e => ({
        studentId: e.studentId,
        batchId,
        date,
        status: e.status,
      })));
      await new Promise(r => setTimeout(r, 400));
    });
    toast.success("Attendance saved successfully!");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{batch?.name}</p>
          <p className="text-sm text-muted-foreground">{students.length} students · {format(new Date(date), "dd MMM yyyy")}</p>
        </div>
        <button onClick={handleSave} disabled={saving || saved}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
          {saved
            ? <><CheckCircle className="h-4 w-4" /> Saved!</>
            : saving
              ? "Saving…"
              : <><Save className="h-4 w-4" /> Save Attendance</>
          }
        </button>
      </div>
      <AttendanceGrid students={students} entries={entries} onMark={mark} onMarkAll={markAll} />
    </div>
  );
}

export default function AttendancePage() {
  const { batches } = useAcademicStore();
  // const activeBatches = batches.filter(b => b.status === "ACTIVE");
  const activeBatches = batches;
  const [selectedBatch, setSelectedBatch] = useState(activeBatches[0]?.id ?? "");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [started, setStarted] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mark Attendance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Select a batch and date to begin</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Batch</label>
          <select value={selectedBatch} onChange={e => { setSelectedBatch(e.target.value); setStarted(false); }}
            className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[200px]">
            {activeBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Date</label>
          <input type="date" value={date}
            onChange={e => { setDate(e.target.value); setStarted(false); }}
            className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <button onClick={() => setStarted(true)}
          className="h-10 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Start Session
        </button>
      </div>

      {started && selectedBatch && (
        <div className="rounded-xl border bg-card p-5">
          <AttendanceSession batchId={selectedBatch} date={date} />
        </div>
      )}
    </div>
  );
}