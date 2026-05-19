// import { StatCard, ProgressBar, Badge } from "@coachgenie/ui";

// export default function AdminHome() {
//   return (
//     <main className="p-8 space-y-6">
//       <h1 className="text-3xl font-bold">CoachGenie Admin ✓</h1>
//       <div className="grid grid-cols-3 gap-4">
//         <StatCard title="Total Students" value="248" trend={{ value: 12, label: "vs last month" }} />
//         <StatCard title="Sessions Today" value="18"  subtitle="3 ongoing" />
//         <StatCard title="Revenue"        value="₹1.2L" trend={{ value: -3, label: "vs last month" }} />
//       </div>
//       <ProgressBar value={75} label="Attendance Rate" showValue variant="success" />
//       <div className="flex gap-2">
//         <Badge variant="success">Active</Badge>
//         <Badge variant="warning">Pending</Badge>
//         <Badge variant="destructive">Overdue</Badge>
//       </div>
//     </main>
//   );
// }

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}