"use client";
import { useState } from "react";
import { MessageSquare, Mail, Phone, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/lib/stores/finance.store";
import type { NotificationChannel, NotificationStatus } from "@/lib/types/finance";

const CHANNEL_CONFIG: Record<NotificationChannel, { label: string; icon: React.ElementType; color: string }> = {
  SMS:       { label: "SMS",       icon: Phone,          color: "text-blue-600" },
  WHATSAPP:  { label: "WhatsApp",  icon: MessageSquare,  color: "text-emerald-600" },
  EMAIL:     { label: "Email",     icon: Mail,            color: "text-violet-600" },
};
const STATUS_CONFIG: Record<NotificationStatus, { label: string; className: string; icon: React.ElementType }> = {
  SENT:    { label: "Sent",    className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  FAILED:  { label: "Failed",  className: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
};

export default function NotificationsPage() {
  const { notifications } = useFinanceStore();
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | "ALL">("ALL");

  const filtered = channelFilter === "ALL"
    ? notifications
    : notifications.filter(n => n.channel === channelFilter);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notification Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{notifications.length} notifications sent</p>
      </div>

      {/* Channel filter */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL","SMS","WHATSAPP","EMAIL"] as const).map(c => (
          <button key={c} onClick={() => setChannelFilter(c)}
            className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              channelFilter === c ? "bg-foreground text-background" : "hover:bg-accent"
            )}>
            {c} ({c==="ALL" ? notifications.length : notifications.filter(n=>n.channel===c).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((n, i) => {
          const chanCfg   = CHANNEL_CONFIG[n.channel];
          const statusCfg = STATUS_CONFIG[n.status];
          const StatusIcon = statusCfg.icon;
          return (
            <div key={n.id} className="rounded-xl border bg-card p-4 fade-in" style={{ animationDelay:`${i*40}ms` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 rounded-lg p-2 bg-muted shrink-0")}>
                    <chanCfg.icon className={cn("h-4 w-4", chanCfg.color)} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{chanCfg.label}</span>
                      <span className="text-xs text-muted-foreground font-mono">{n.to}</span>
                      {n.subject && <span className="text-xs font-medium text-muted-foreground">· {n.subject}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={cn("flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium", statusCfg.className)}>
                    <StatusIcon className="h-2.5 w-2.5" /> {statusCfg.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(n.sentAt), "dd MMM, hh:mm a")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-40 rounded-xl border bg-card text-sm text-muted-foreground">
            No notifications found.
          </div>
        )}
      </div>
    </div>
  );
}