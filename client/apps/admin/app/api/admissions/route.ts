// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// // GET — fetch all admissions (for the admissions page)
// export async function GET() {
//   const admissions = await prisma.admission.findMany({
//     orderBy: { createdAt: "desc" },
//     include: { lead: { select: { id: true, name: true } } },
//   });
//   return NextResponse.json(admissions);
// }

// // POST — create a new admission (called from the modal)
// export async function POST(req: Request) {
//   const body = await req.json();

//   const admission = await prisma.admission.create({
//     data: {
//       studentName:          body.studentName,
//       grade:                body.grade ?? "",
//       subjects:             body.subjects,
//       status:               body.status,
//       feeAmount:            body.feeAmount,
//       feePaid:              body.feePaid,
//       totalFee:             body.payment.totalFee,
//       amountPaid:           body.payment.amountPaid,
//       remaining:            body.payment.remaining,
//       paymentStatus:        body.payment.paymentStatus,
//       dateOfPayment:        body.payment.dateOfPayment,
//       modeOfPayment:        body.payment.modeOfPayment,
//       hasInstallments:      body.payment.hasInstallments,
//       numberOfInstallments: body.payment.numberOfInstallments,
//       installmentAmount:    body.payment.installmentAmount,
//       installmentSchedule:  body.payment.installmentSchedule,
//       notes:                body.payment.notes,
//       leadId:               body.leadId ?? null,  // ← keeps the lead link
//     },
//   });

//   return NextResponse.json(admission, { status: 201 });
// }

// Second code from here--------------------------------------------------------------------------------------------------------------------------------------------

// import { NextResponse } from "next/server";

// const API_BASE = `${process.env.API_URL ?? "http://localhost:8000"}/api/v1`;

// /**
//  * Build the headers FastAPI needs from the incoming Next.js request.
//  *
//  * FastAPI dependencies require:
//  *   - Authorization: Bearer <token>   → get_current_user / require_roles
//  *   - X-Tenant-Subdomain              → get_tenant (primary)
//  *   - X-Tenant-Id                     → get_tenant (UUID fallback)
//  */
// function forwardHeaders(req: Request): Record<string, string> {
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//   };

//   const auth      = req.headers.get("authorization");
//   const subdomain = req.headers.get("x-tenant-subdomain");
//   const tenantId  = req.headers.get("x-tenant-id");

//   if (auth)      headers["authorization"]      = auth;
//   if (subdomain) headers["x-tenant-subdomain"] = subdomain;
//   if (tenantId)  headers["x-tenant-id"]        = tenantId;

//   return headers;
// }

// // GET — list admissions
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);

//   const params = new URLSearchParams();
//   for (const [key, val] of searchParams.entries()) {
//     params.set(key, val);
//   }

//   const upstream = await fetch(
//     `${API_BASE}/admissions/?${params.toString()}`,
//     { headers: forwardHeaders(req), cache: "no-store" },
//   );

//   const data = await upstream.json();
//   return NextResponse.json(data, { status: upstream.status });
// }

// // POST — create admission
// export async function POST(req: Request) {
//   const body = await req.json();

//   const payload = {
//     student_name:       body.student_name  ?? body.studentName  ?? null,
//     batchName:          body.batchName     ?? null,
//     grade:              body.grade         ?? "",
//     subjects:           body.subjects      ?? [],
//     status:             body.status        ?? "PENDING_DOCS",
//     fee_amount:         body.fee_amount    ?? body.feeAmount    ?? 0,
//     fee_paid:           body.fee_paid      ?? body.feePaid      ?? 0,
//     lead_id:            body.lead_id       ?? body.leadId       ?? null,
//     documents:          body.documents     ?? [],
//     documents_verified: body.documents_verified ?? false,
//     remarks:            body.remarks       ?? null,
//     payment:            body.payment       ?? null,
//   };

//   const upstream = await fetch(`${API_BASE}/admissions/`, {
//     method:  "POST",
//     headers: forwardHeaders(req),
//     body:    JSON.stringify(payload),
//   });

//   const data = await upstream.json();
//   return NextResponse.json(data, { status: upstream.status });
// }

// ====================================================================================================================================================================================

// "use client";
// import { useState, useCallback } from "react";
// import Link from "next/link";
// import { format } from "date-fns";
// import {
//   FileCheck, Clock, CheckCircle, XCircle, Plus, X, ChevronRight,
// } from "lucide-react";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { useLeadStore } from "@/lib/stores/leads.store";
// import { useAuthStore } from "@/lib/stores/auth.store";
// import type { Admission } from "@/lib/types/lead";

// // ─── Types ─────────────────────────────────────────────────────────────────────
// export type PaymentMode = "upi" | "cash" | "bank" | "other";
// export type PaymentStatus = "PENDING" | "PARTIAL" | "FULL";

// export interface InstallmentSchedule {
//   number:  number;
//   amount:  number;
//   dueDate: string;
//   paid:    boolean;
// }

// export interface AdmissionPayment {
//   totalFee:             number;
//   amountPaid:           number;
//   remaining:            number;
//   paymentStatus:        PaymentStatus;
//   dateOfPayment:        string;
//   modeOfPayment:        PaymentMode;
//   hasInstallments:      boolean;
//   numberOfInstallments: number;
//   installmentAmount:    number;
//   installmentSchedule:  InstallmentSchedule[];
//   notes:                string;
// }

// export type AdmissionWithPayment = Admission & {
//   payment?: AdmissionPayment;
// };

// // ─── Constants ─────────────────────────────────────────────────────────────────
// const STATUS_CONFIG: Record<
//   Admission["status"],
//   { label: string; color: string; bg: string; border: string; icon: React.ElementType }
// > = {
//   PENDING_DOCS:   { label: "Pending Docs",   color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950",     border: "border-amber-200 dark:border-amber-800",    icon: Clock       },
//   DOCS_SUBMITTED: { label: "Docs Submitted", color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950",       border: "border-blue-200 dark:border-blue-800",      icon: FileCheck   },
//   FEE_PENDING:    { label: "Fee Pending",    color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950",   border: "border-orange-200 dark:border-orange-800",  icon: Clock       },
//   CONFIRMED:      { label: "Confirmed",      color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950", border: "border-emerald-200 dark:border-emerald-800", icon: CheckCircle },
//   CANCELLED:      { label: "Cancelled",      color: "text-red-600",     bg: "bg-red-50 dark:bg-red-950",         border: "border-red-200 dark:border-red-800",         icon: XCircle     },
// };

// // ─── Required Documents Master List ───────────────────────────────────────────
// export const REQUIRED_DOCUMENTS = [
//   { id: "aadhar",    label: "Aadhar Card",         required: true  },
//   { id: "marksheet", label: "Previous Marksheet",  required: true  },
//   { id: "photo",     label: "Passport Photo",       required: true  },
//   { id: "tc",        label: "Transfer Certificate", required: false },
//   { id: "address",   label: "Address Proof",        required: false },
//   { id: "birth",     label: "Birth Certificate",    required: false },
// ];

// // ─── Helpers ───────────────────────────────────────────────────────────────────
// function derivePaymentStatus(paid: number, total: number): PaymentStatus {
//   if (!total || paid <= 0) return "PENDING";
//   if (paid >= total) return "FULL";
//   return "PARTIAL";
// }

// function buildInstallmentSchedule(
//   remaining: number,
//   count: number,
//   dates: string[],
// ): InstallmentSchedule[] {
//   if (!count) return [];
//   const base  = Math.floor(remaining / count);
//   const extra = remaining - base * count;
//   return Array.from({ length: count }, (_, i) => ({
//     number:  i + 1,
//     amount:  i === 0 ? base + extra : base,
//     dueDate: dates[i] ?? "",
//     paid:    false,
//   }));
// }

// // ─── Form state ────────────────────────────────────────────────────────────────
// interface AddFormState {
//   studentName:          string;
//   batchName:            string;
//   totalFee:             string;
//   amountPaid:           string;
//   dateOfPayment:        string;
//   modeOfPayment:        PaymentMode;
//   hasInstallments:      boolean;
//   numberOfInstallments: number;
//   installmentDates:     string[];
//   notes:                string;
//   selectedDocs:         string[];
// }

// const DEFAULT_FORM: AddFormState = {
//   studentName:          "",
//   batchName:            "",
//   totalFee:             "",
//   amountPaid:           "",
//   dateOfPayment:        new Date().toISOString().split("T")[0],
//   modeOfPayment:        "upi",
//   hasInstallments:      false,
//   numberOfInstallments: 2,
//   installmentDates:     [],
//   notes:                "",
//   selectedDocs:         ["aadhar", "marksheet", "photo"],
// };

// // ─── Add Admission Modal ───────────────────────────────────────────────────────
// interface AddAdmissionModalProps {
//   onClose:  () => void;
//   onSave:   (data: AddFormState) => void;
//   isSaving: boolean;
// }

// function AddAdmissionModal({ onClose, onSave, isSaving }: AddAdmissionModalProps) {
//   const [form, setForm] = useState<AddFormState>(DEFAULT_FORM);

//   const totalFee   = parseFloat(form.totalFee) || 0;
//   const amountPaid = parseFloat(form.amountPaid) || 0;
//   const remaining  = Math.max(0, totalFee - amountPaid);
//   const payStatus  = derivePaymentStatus(amountPaid, totalFee);
//   const instAmt    =
//     form.hasInstallments && form.numberOfInstallments > 0 && remaining > 0
//       ? Math.ceil(remaining / form.numberOfInstallments)
//       : 0;

//   function setInstCount(n: number) {
//     setForm(f => ({
//       ...f,
//       numberOfInstallments: n,
//       installmentDates: Array.from({ length: n }, (_, i) => f.installmentDates[i] ?? ""),
//     }));
//   }

//   function setInstDate(i: number, val: string) {
//     setForm(f => {
//       const dates = [...f.installmentDates];
//       dates[i] = val;
//       return { ...f, installmentDates: dates };
//     });
//   }

//   function toggleInstallments(checked: boolean) {
//     setForm(f => ({
//       ...f,
//       hasInstallments: checked,
//       installmentDates: checked
//         ? Array.from({ length: f.numberOfInstallments }, (_, i) => f.installmentDates[i] ?? "")
//         : [],
//     }));
//   }

//   function toggleDoc(docId: string) {
//     setForm(f => ({
//       ...f,
//       selectedDocs: f.selectedDocs.includes(docId)
//         ? f.selectedDocs.filter(d => d !== docId)
//         : [...f.selectedDocs, docId],
//     }));
//   }

//   function handleSubmit() {
//     if (!form.studentName.trim()) { toast.error("Student name is required"); return; }
//     if (!form.batchName.trim())   { toast.error("Batch name is required");   return; }
//     onSave(form);
//   }

//   return (
//     <>
//       <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
//       <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2
//                       w-full max-w-2xl max-h-[90vh] flex flex-col
//                       rounded-2xl border bg-background shadow-2xl">

//         {/* Header */}
//         <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
//           <h2 className="text-lg font-semibold">Add New Admission</h2>
//           <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="overflow-y-auto px-6 py-5 flex-1">
//           <div className="space-y-5">

//             {/* Basic info */}
//             <div className="grid grid-cols-2 gap-4">
//               <Field label="Student Name">
//                 <input
//                   value={form.studentName}
//                   onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
//                   className={inputCls()}
//                   placeholder="e.g. Arjun Verma"
//                 />
//               </Field>
//               <Field label="Batch Name">
//                 <input
//                   value={form.batchName}
//                   onChange={e => setForm(f => ({ ...f, batchName: e.target.value }))}
//                   className={inputCls()}
//                   placeholder="e.g. JEE Mains 2025"
//                 />
//               </Field>
//             </div>

//             <Divider label="Payment Details" />

//             {/* Fee */}
//             <div className="grid grid-cols-3 gap-4">
//               <Field label="Total Fee (₹)">
//                 <input
//                   type="number" min="0"
//                   value={form.totalFee}
//                   onChange={e => setForm(f => ({ ...f, totalFee: e.target.value }))}
//                   className={inputCls()}
//                   placeholder="50000"
//                 />
//               </Field>
//               <Field label="Amount Paid (₹)">
//                 <input
//                   type="number" min="0"
//                   value={form.amountPaid}
//                   onChange={e => setForm(f => ({ ...f, amountPaid: e.target.value }))}
//                   className={inputCls()}
//                   placeholder="20000"
//                 />
//               </Field>
//               <Field label="Remaining (₹)">
//                 <div className={cn(inputCls(), "bg-muted text-muted-foreground select-none")}>
//                   {remaining > 0 ? `₹${remaining.toLocaleString("en-IN")}` : "—"}
//                 </div>
//               </Field>
//             </div>

//             {/* Payment status badge */}
//             <div className="flex items-center gap-2">
//               <span className="text-xs text-muted-foreground">Payment status:</span>
//               <span className={cn(
//                 "text-xs font-medium px-2.5 py-0.5 rounded-full",
//                 payStatus === "FULL"    && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
//                 payStatus === "PARTIAL" && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
//                 payStatus === "PENDING" && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
//               )}>
//                 {payStatus === "FULL" ? "Full Payment" : payStatus === "PARTIAL" ? "Partially Paid" : "Pending"}
//               </span>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <Field label="Date of Payment">
//                 <input
//                   type="date"
//                   value={form.dateOfPayment}
//                   onChange={e => setForm(f => ({ ...f, dateOfPayment: e.target.value }))}
//                   className={inputCls()}
//                 />
//               </Field>
//               <Field label="Mode of Payment">
//                 <select
//                   value={form.modeOfPayment}
//                   onChange={e => setForm(f => ({ ...f, modeOfPayment: e.target.value as PaymentMode }))}
//                   className={inputCls()}
//                 >
//                   <option value="upi">UPI</option>
//                   <option value="cash">Cash</option>
//                   <option value="bank">Bank Transfer</option>
//                   <option value="other">Other</option>
//                 </select>
//               </Field>
//             </div>

//             <Divider label="Installments" />

//             <label className="flex items-center gap-3 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={form.hasInstallments}
//                 onChange={e => toggleInstallments(e.target.checked)}
//                 className="h-4 w-4 rounded accent-primary"
//               />
//               <span className="text-sm font-medium">Pay in installments</span>
//             </label>

//             {form.hasInstallments && (
//               <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <Field label="Number of Installments">
//                     <select
//                       value={form.numberOfInstallments}
//                       onChange={e => setInstCount(Number(e.target.value))}
//                       className={inputCls()}
//                     >
//                       {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
//                         <option key={n} value={n}>{n} installments</option>
//                       ))}
//                     </select>
//                   </Field>
//                   <Field label="Per Installment (₹)">
//                     <div className={cn(inputCls(), "bg-muted text-muted-foreground select-none")}>
//                       {instAmt > 0 ? `₹${instAmt.toLocaleString("en-IN")}` : "—"}
//                     </div>
//                   </Field>
//                 </div>

//                 <div className="space-y-2">
//                   <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//                     Installment Due Dates
//                   </p>
//                   <div className="grid grid-cols-2 gap-2">
//                     {Array.from({ length: form.numberOfInstallments }, (_, i) => (
//                       <div key={i} className="flex items-center gap-2">
//                         <span className="text-xs text-muted-foreground w-24 shrink-0">
//                           Installment {i + 1}
//                         </span>
//                         <input
//                           type="date"
//                           value={form.installmentDates[i] ?? ""}
//                           onChange={e => setInstDate(i, e.target.value)}
//                           className={cn(inputCls(), "text-xs py-1.5")}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <Divider label="Required Documents" />

//             <div className="space-y-2">
//               <p className="text-xs text-muted-foreground">
//                 Select documents required for this admission
//               </p>
//               <div className="grid grid-cols-2 gap-2">
//                 {REQUIRED_DOCUMENTS.map((doc) => {
//                   const isSelected = form.selectedDocs.includes(doc.id);
//                   return (
//                     <label
//                       key={doc.id}
//                       className={cn(
//                         "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors",
//                         isSelected ? "border-primary/40 bg-primary/5" : "hover:bg-accent",
//                       )}
//                     >
//                       <input
//                         type="checkbox"
//                         checked={isSelected}
//                         onChange={() => toggleDoc(doc.id)}
//                         className="h-4 w-4 rounded accent-primary shrink-0"
//                       />
//                       <span className="text-sm flex-1 leading-tight">{doc.label}</span>
//                       {doc.required ? (
//                         <span className="text-[10px] font-medium text-destructive border border-destructive/30 rounded px-1.5 py-0.5 shrink-0">
//                           Required
//                         </span>
//                       ) : (
//                         <span className="text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 shrink-0">
//                           Optional
//                         </span>
//                       )}
//                     </label>
//                   );
//                 })}
//               </div>
//               {form.selectedDocs.length > 0 && (
//                 <p className="text-xs text-muted-foreground pt-1">
//                   {form.selectedDocs.length} document{form.selectedDocs.length !== 1 ? "s" : ""} selected
//                 </p>
//               )}
//             </div>

//             {/* Notes */}
//             <Field label="Payment Notes">
//               <textarea
//                 value={form.notes}
//                 onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
//                 className={cn(inputCls(), "resize-none h-auto")}
//                 rows={3}
//                 placeholder="Any notes..."
//               />
//             </Field>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-end gap-3 border-t px-6 py-4 shrink-0">
//           <button
//             onClick={onClose}
//             disabled={isSaving}
//             className="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isSaving}
//             className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
//           >
//             {isSaving ? "Saving…" : "Save Admission"}
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

// // ─── Page ──────────────────────────────────────────────────────────────────────
// export default function AdmissionsPage() {
//   const admissions   = useLeadStore((s) => s.admissions) as AdmissionWithPayment[];
//   const addAdmission = useLeadStore((s) => s.addAdmission);

//   // Pull auth values from the store — these are what FastAPI needs
//   const accessToken = useAuthStore((s) => s.accessToken);
//   const tenantId    = useAuthStore((s) => s.tenantId);

//   const [filter, setFilter]     = useState<Admission["status"] | "ALL">("ALL");
//   const [showForm, setShowForm] = useState(false);
//   const [saving, setSaving]     = useState(false);

//   const filtered =
//     filter === "ALL"
//       ? admissions
//       : admissions.filter((a) => a.status === filter);

//   const handleSave = useCallback(
//     async (data: AddFormState) => {
//       // Guard: should never happen if auth is enforced at the route level,
//       // but gives a clear error instead of a silent 403.
//       if (!accessToken || !tenantId) {
//         toast.error("You must be logged in to create an admission.");
//         return;
//       }

//       const totalFee   = parseFloat(data.totalFee) || 0;
//       const amountPaid = parseFloat(data.amountPaid) || 0;
//       const remaining  = Math.max(0, totalFee - amountPaid);
//       const payStatus  = derivePaymentStatus(amountPaid, totalFee);
//       const instAmt    =
//         data.hasInstallments && data.numberOfInstallments > 0 && remaining > 0
//           ? Math.ceil(remaining / data.numberOfInstallments)
//           : 0;
//       const schedule = buildInstallmentSchedule(
//         remaining,
//         data.hasInstallments ? data.numberOfInstallments : 0,
//         data.installmentDates,
//       );

//       let admStatus: Admission["status"] = "PENDING_DOCS";
//       if (payStatus === "FULL")         admStatus = "CONFIRMED";
//       else if (payStatus === "PARTIAL") admStatus = "FEE_PENDING";

//       const documents = REQUIRED_DOCUMENTS
//         .filter((d) => data.selectedDocs.includes(d.id))
//         .map((d) => ({ name: d.label, required: d.required, submitted: false }));

//       const payload = {
//         student_name: data.studentName,
//         batchName:    data.batchName,
//         status:       admStatus,
//         documents,
//         fee_amount:   totalFee,
//         fee_paid:     amountPaid,
//         payment: {
//           totalFee,
//           amountPaid,
//           remaining,
//           paymentStatus:        payStatus,
//           dateOfPayment:        data.dateOfPayment,
//           modeOfPayment:        data.modeOfPayment,
//           hasInstallments:      data.hasInstallments,
//           numberOfInstallments: data.numberOfInstallments,
//           installmentAmount:    instAmt,
//           installmentSchedule:  schedule,
//           notes:                data.notes,
//         } satisfies AdmissionPayment,
//       };

//       setSaving(true);
//       try {
//         const res = await fetch("/api/admissions", {
//           method:  "POST",
//           headers: {
//             "Content-Type":  "application/json",
//             // These two headers are what FastAPI's get_tenant + get_current_user need.
//             // accessToken  → Authorization: Bearer <token>  → require_roles
//             // tenantId     → X-Tenant-Id (UUID)             → get_tenant fallback
//             "Authorization": `Bearer ${accessToken}`,
//             "X-Tenant-Id":   tenantId,
//           },
//           body: JSON.stringify(payload),
//         });

//         const json = await res.json();

//         if (!res.ok) {
//           // FastAPI validation errors come back as { detail: [...] }
//           const message =
//             typeof json?.detail === "string"
//               ? json.detail
//               : Array.isArray(json?.detail)
//               ? json.detail.map((e: { msg: string }) => e.msg).join(", ")
//               : "Failed to create admission";
//           throw new Error(message);
//         }

//         // Backend wraps the created record as { success: true, data: {...} }
//         const created: AdmissionWithPayment = json.data ?? json;
//         addAdmission?.(created);
//         toast.success("Admission created!");
//         setShowForm(false);
//       } catch (err: unknown) {
//         toast.error(err instanceof Error ? err.message : "Something went wrong");
//       } finally {
//         setSaving(false);
//       }
//     },
//     [accessToken, tenantId, addAdmission],
//   );

//   return (
//     <div className="space-y-5">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Admissions</h1>
//           <p className="text-sm text-muted-foreground mt-0.5">
//             {admissions.length} total admissions
//           </p>
//         </div>
//         <button
//           onClick={() => setShowForm(true)}
//           className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
//         >
//           <Plus className="h-4 w-4" /> Add Admission
//         </button>
//       </div>

//       {/* Status filter pills */}
//       <div className="flex flex-wrap gap-2">
//         <button
//           onClick={() => setFilter("ALL")}
//           className={cn(
//             "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
//             filter === "ALL" ? "bg-foreground text-background" : "hover:bg-accent",
//           )}
//         >
//           All ({admissions.length})
//         </button>
//         {(Object.keys(STATUS_CONFIG) as Admission["status"][]).map((s) => {
//           const cfg   = STATUS_CONFIG[s];
//           const count = admissions.filter((a) => a.status === s).length;
//           return (
//             <button
//               key={s}
//               onClick={() => setFilter(filter === s ? "ALL" : s)}
//               className={cn(
//                 "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
//                 filter === s ? `${cfg.color} ${cfg.bg} ${cfg.border}` : "hover:bg-accent",
//               )}
//             >
//               {cfg.label} ({count})
//             </button>
//           );
//         })}
//       </div>

//       {/* List */}
//       <div className="space-y-3">
//         {filtered.length === 0 && (
//           <div className="flex items-center justify-center h-40 rounded-xl border bg-card text-sm text-muted-foreground">
//             No admissions found.
//           </div>
//         )}
//         {filtered.map((adm) => {
//           const cfg        = STATUS_CONFIG[adm.status];
//           const StatusIcon = cfg.icon;
//           const docsTotal  = adm.documents.filter((d) => d.required).length;
//           const docsOk     = adm.documents.filter((d) => d.required && d.submitted).length;

//           return (
//             <Link
//               href={`/admissions/${adm.id}`}
//               key={adm.id}
//               className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
//             >
//               <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", cfg.bg)}>
//                 <StatusIcon className={cn("h-5 w-5", cfg.color)} />
//               </div>

//               <div className="flex-1 min-w-0">
//                 <p className="font-semibold text-sm truncate">{adm.studentName}</p>
//                 <p className="text-xs text-muted-foreground">
//                   {adm.subjects.join(", ")}
//                   {adm.payment?.hasInstallments &&
//                     ` · ${adm.payment.numberOfInstallments} installments`}
//                 </p>
//               </div>

//               <div className="hidden sm:flex flex-col items-end gap-1 text-xs">
//                 <span className={cn("font-medium", cfg.color)}>{cfg.label}</span>
//                 <span className="text-muted-foreground">
//                   {docsTotal > 0 && `Docs: ${docsOk}/${docsTotal} · `}
//                   ₹{adm.feePaid.toLocaleString("en-IN")} / ₹{adm.feeAmount.toLocaleString("en-IN")}
//                 </span>
//               </div>

//               <div className="hidden md:block text-xs text-muted-foreground whitespace-nowrap">
//                 {format(new Date(adm.createdAt), "dd MMM yyyy")}
//               </div>

//               <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
//             </Link>
//           );
//         })}
//       </div>

//       {showForm && (
//         <AddAdmissionModal
//           onClose={() => setShowForm(false)}
//           onSave={handleSave}
//           isSaving={saving}
//         />
//       )}
//     </div>
//   );
// }

// // ─── Small helpers ─────────────────────────────────────────────────────────────
// function Field({ label, children }: { label: string; children: React.ReactNode }) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }

// function Divider({ label }: { label: string }) {
//   return (
//     <div className="flex items-center gap-3">
//       <div className="h-px flex-1 bg-border" />
//       <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//         {label}
//       </span>
//       <div className="h-px flex-1 bg-border" />
//     </div>
//   );
// }

// function inputCls() {
//   return "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
// }


import { NextResponse } from "next/server";

const API_BASE = `${process.env.API_URL ?? "http://localhost:8000"}/api/v1`;

/**
 * Build the headers FastAPI needs from the incoming Next.js request.
 *
 * FastAPI dependencies require:
 *   - Authorization: Bearer <token>   → get_current_user / require_roles
 *   - X-Tenant-Subdomain              → get_tenant (primary)
 *   - X-Tenant-Id                     → get_tenant (UUID fallback)
 */
function forwardHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const auth      = req.headers.get("authorization");
  const subdomain = req.headers.get("x-tenant-subdomain");
  const tenantId  = req.headers.get("x-tenant-id");

  if (auth)      headers["authorization"]      = auth;
  if (subdomain) headers["x-tenant-subdomain"] = subdomain;
  if (tenantId)  headers["x-tenant-id"]        = tenantId;

  return headers;
}

/**
 * Normalize a single admission record from FastAPI (snake_case) to the
 * camelCase shape the frontend Admission type expects.
 *
 * FastAPI returns:         Frontend expects:
 *   student_name      →     studentName
 *   fee_amount        →     feeAmount
 *   fee_paid          →     feePaid
 *   created_at        →     createdAt
 *   applied_course    →     subjects  (wrapped in array)
 *   payment           →     payment   (nested object, passed through as-is)
 */
function normalizeAdmission(a: Record<string, any>) {
  return {
    // identity
    id:                 a.id,
    admission_number:   a.admission_number,

    // camelCase aliases the frontend Admission type uses
    studentName:        a.student_name        ?? a.studentName        ?? "",
    feeAmount:          a.fee_amount          ?? a.feeAmount          ?? 0,
    feePaid:            a.fee_paid            ?? a.feePaid            ?? 0,
    createdAt:          a.created_at          ?? a.createdAt          ?? new Date().toISOString(),

    // subjects: backend stores batchName in applied_course
    subjects:           a.subjects?.length
                          ? a.subjects
                          : a.applied_course
                          ? [a.applied_course]
                          : [],

    // status & flags
    status:             a.status              ?? "PENDING_DOCS",
    documents_verified: a.documents_verified  ?? false,
    documents:          a.documents           ?? [],
    grade:              a.grade               ?? "",
    remarks:            a.remarks             ?? null,
    lead_id:            a.lead_id             ?? null,
    approved_at:        a.approved_at         ?? null,

    // keep snake_case copies too so detail pages that read snake_case still work
    student_name:       a.student_name        ?? a.studentName        ?? "",
    fee_amount:         a.fee_amount          ?? a.feeAmount          ?? 0,
    fee_paid:           a.fee_paid            ?? a.feePaid            ?? 0,
    created_at:         a.created_at          ?? a.createdAt          ?? null,
    applied_course:     a.applied_course      ?? "",

    // payment blob — passed through as-is (already normalized by backend)
    payment:            a.payment             ?? null,
  };
}

// GET — list admissions
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const params = new URLSearchParams();
  for (const [key, val] of searchParams.entries()) {
    params.set(key, val);
  }

  const upstream = await fetch(
    `${API_BASE}/admissions/?${params.toString()}`,
    { headers: forwardHeaders(req), cache: "no-store" },
  );

  const data = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  // FastAPI returns { success: true, data: [...], total, page, limit }
  const normalized = {
    ...data,
    data: Array.isArray(data.data)
      ? data.data.map(normalizeAdmission)
      : [],
  };

  return NextResponse.json(normalized, { status: 200 });
}

// POST — create admission
export async function POST(req: Request) {
  const body = await req.json();

  const payload = {
    student_name:       body.student_name  ?? body.studentName  ?? null,
    batchName:          body.batchName     ?? null,
    grade:              body.grade         ?? "",
    subjects:           body.subjects      ?? [],
    status:             body.status        ?? "PENDING_DOCS",
    fee_amount:         body.fee_amount    ?? body.feeAmount    ?? 0,
    fee_paid:           body.fee_paid      ?? body.feePaid      ?? 0,
    lead_id:            body.lead_id       ?? body.leadId       ?? null,
    documents:          body.documents     ?? [],
    documents_verified: body.documents_verified ?? false,
    remarks:            body.remarks       ?? null,
    payment:            body.payment       ?? null,
     phone:              body.phone         ?? null,
    email:              body.email         ?? null,
    parent_name:        body.parent_name   ?? null,
    parent_phone:       body.parent_phone  ?? null,
    school_name:        body.school_name   ?? null,
  };

  const upstream = await fetch(`${API_BASE}/admissions/`, {
    method:  "POST",
    headers: forwardHeaders(req),
    body:    JSON.stringify(payload),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  // FastAPI returns { success: true, data: { ...admission } }
  // Normalize the created record so the frontend store gets camelCase immediately
  const normalized = {
    ...data,
    data: data.data ? normalizeAdmission(data.data) : null,
  };

  return NextResponse.json(normalized, { status: 201 });
}