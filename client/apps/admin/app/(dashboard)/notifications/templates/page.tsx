"use client";
import { useState } from "react";
import { Plus, X, Pencil, Trash2, MessageSquare, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/lib/stores/finance.store";
import type { NotificationTemplate, NotificationChannel } from "@/lib/types/finance";

const CHANNEL_ICONS: Record<NotificationChannel, React.ElementType> = {
  SMS: Phone, WHATSAPP: MessageSquare, EMAIL: Mail,
};

const schema = z.object({
  name:      z.string().min(2),
  channel:   z.enum(["SMS","WHATSAPP","EMAIL"]),
  subject:   z.string().optional(),
  body:      z.string().min(10),
  variables: z.string(),
  isActive:  z.boolean(),
});
type TemplateFormValues = z.infer<typeof schema>;

const inputCls = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function NotificationTemplatesPage() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useFinanceStore();
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState<NotificationTemplate | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TemplateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { channel: "WHATSAPP", isActive: true, variables: "", body: "", name: "", subject: "" },
  });

  function openEdit(t: NotificationTemplate) {
    setEditTarget(t);
    reset({
      name: t.name, channel: t.channel, subject: t.subject ?? "",
      body: t.body, variables: t.variables.join(", "), isActive: t.isActive,
    });
    setShowForm(true);
  }

  async function onSubmit(data: TemplateFormValues) {
    await new Promise(r => setTimeout(r, 500));
    const vars = data.variables.split(",").map(v=>v.trim()).filter(Boolean);
    if (editTarget) {
      updateTemplate(editTarget.id, { ...data, variables: vars });
      toast.success("Template updated!");
    } else {
      addTemplate({ ...data, variables: vars });
      toast.success("Template created!");
    }
    setShowForm(false);
    setEditTarget(null);
    reset();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{templates.length} templates</p>
        </div>
        <button onClick={() => { reset(); setEditTarget(null); setShowForm(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> New Template
        </button>
      </div>

      <div className="space-y-3">
        {templates.map((t, i) => {
          const Icon = CHANNEL_ICONS[t.channel];
          return (
            <div key={t.id} className="rounded-xl border bg-card p-5 fade-in" style={{ animationDelay:`${i*50}ms` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="rounded-lg bg-muted p-2 shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{t.name}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{t.channel}</span>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        t.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600"
                      )}>{t.isActive ? "Active" : "Inactive"}</span>
                    </div>
                    {t.subject && <p className="text-xs font-medium text-muted-foreground mb-1">Subject: {t.subject}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-2">{t.body}</p>
                    {t.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.variables.map(v => (
                          <code key={v} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{"{{"+v+"}}"}</code>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(t)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { deleteTemplate(t.id); toast.success("Template deleted"); }}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowForm(false); setEditTarget(null); }} />
          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl border bg-background shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-semibold">{editTarget ? "Edit Template" : "New Template"}</h2>
              <button onClick={() => { setShowForm(false); setEditTarget(null); }}
                className="rounded-lg p-1.5 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <input {...register("name")} placeholder="Payment Received" className={inputCls} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Channel</label>
                  <select {...register("channel")} className={inputCls}>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 self-end pb-1">
                  <input {...register("isActive")} type="checkbox" id="tplActive" className="h-4 w-4 accent-primary" />
                  <label htmlFor="tplActive" className="text-sm font-medium">Active</label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subject (Email only)</label>
                <input {...register("subject")} placeholder="Payment Received — CoachGenie" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Body</label>
                <textarea {...register("body")} rows={4} placeholder="Use {{variableName}} for dynamic values"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
                {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Variables (comma separated)</label>
                <input {...register("variables")} placeholder="parentName, studentName, amount" className={inputCls} />
                <p className="text-xs text-muted-foreground">These will render as {"{{variable}}"} placeholders.</p>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t">
                <button type="button" onClick={() => { setShowForm(false); setEditTarget(null); }}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
                  {editTarget ? "Save Changes" : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}