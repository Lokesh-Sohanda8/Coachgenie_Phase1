"use client";
import { useState } from "react";
import { format, subDays } from "date-fns";
import { useAcademicStore }   from "@/lib/stores/academic.store";
import { AttendanceReport }   from "@/components/attendance/AttendanceReport";

export default function AttendanceReportsPage() {
  const store      = useAcademicStore();
  const [batchId, setBatchId]     = useState(store.batches[0]?.id ?? "");
  const [startDate, setStartDate] = useState(format(subDays(new Date(),30),"yyyy-MM-dd"));
  const [endDate, setEndDate]     = useState(format(new Date(),"yyyy-MM-dd"));

  const batch    = store.batches.find(b => b.id === batchId);
  const students = store.students.filter(s => batch?.studentIds.includes(s.id));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Filter by batch and date range</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end rounded-xl border bg-card p-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Batch</label>
          <select value={batchId} onChange={e => setBatchId(e.target.value)}
            className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[200px]">
            {store.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      <AttendanceReport
        students={students}
        records={store.attendance}
        startDate={new Date(startDate)}
        endDate={new Date(endDate)}
      />
    </div>
  );
}