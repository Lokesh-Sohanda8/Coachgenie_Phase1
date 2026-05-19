// "use client";
// import { use, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft, Plus, Printer } from "lucide-react";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { useFinanceStore } from "@/lib/stores/finance.store";
// import { PaymentDialog, type PaymentFormValues } from "@/components/fees/PaymentDialog";
// import { ReceiptPDF } from "@/components/fees/ReceiptPDF";
// import { STATUS_CONFIG } from "@/components/fees/InvoiceTable";
// import type { Payment } from "@/lib/types/finance";

// const MODE_LABELS: Record<string, string> = {
//   CASH:"Cash", UPI:"UPI", BANK_TRANSFER:"Bank Transfer", CHEQUE:"Cheque", CARD:"Card",
// };

// export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id }    = use(params);
//   const router    = useRouter();
//   const store     = useFinanceStore();
//   const invoice   = store.invoices.find(i => i.id === id);

//   const [showPayment, setShowPayment] = useState(false);
//   const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

//   if (!invoice) return (
//     <div className="flex items-center justify-center h-64">
//       <p className="text-muted-foreground">Invoice not found.</p>
//     </div>
//   );

//   const outstanding = invoice.amount - invoice.paid;
//   const pct         = Math.round((invoice.paid / invoice.amount) * 100);
//   const cfg         = STATUS_CONFIG[invoice.status];

//   async function handlePayment(data: PaymentFormValues) {
//     await new Promise(r => setTimeout(r, 600));
//     store.recordPayment(id, { ...data, recordedBy: "Rahul Verma" });
//     toast.success("Payment recorded!");
//     setShowPayment(false);
//   }

//   return (
//     <div className="space-y-5 max-w-4xl">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4">
//         <div className="flex items-start gap-3">
//           <button onClick={() => router.push("/fees")}
//             className="mt-1 rounded-lg p-2 hover:bg-accent text-muted-foreground transition-colors">
//             <ArrowLeft className="h-4 w-4" />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold">{invoice.invoiceNo}</h1>
//             <div className="flex items-center gap-2 mt-1">
//               <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
//                 {cfg.label}
//               </span>
//               <span className="text-sm text-muted-foreground">{invoice.studentName} · {invoice.grade}</span>
//             </div>
//           </div>
//         </div>
//         {outstanding > 0 && (
//           <button onClick={() => setShowPayment(true)}
//             className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
//             <Plus className="h-4 w-4" /> Record Payment
//           </button>
//         )}
//       </div>

//       <div className="grid gap-5 md:grid-cols-3">
//         {/* Summary */}
//         <div className="md:col-span-1 space-y-4">
//           <div className="rounded-xl border bg-card p-5 space-y-3">
//             <h3 className="text-sm font-semibold">Invoice Summary</h3>
//             {[
//               { label: "Description", value: invoice.description },
//               { label: "Due Date",    value: format(new Date(invoice.dueDate), "dd MMM yyyy") },
//               { label: "Created",     value: format(new Date(invoice.createdAt), "dd MMM yyyy") },
//             ].map(({ label, value }) => (
//               <div key={label}>
//                 <p className="text-xs text-muted-foreground">{label}</p>
//                 <p className="text-sm font-medium">{value}</p>
//               </div>
//             ))}
//           </div>

//           {/* Amount breakdown */}
//           <div className="rounded-xl border bg-card p-5 space-y-3">
//             {[
//               { label: "Invoice Amount", value: `₹${invoice.amount.toLocaleString("en-IN")}`,     green: false, red: false },
//               { label: "Paid",           value: `₹${invoice.paid.toLocaleString("en-IN")}`,       green: true,  red: false },
//               { label: "Outstanding",    value: `₹${outstanding.toLocaleString("en-IN")}`,        green: false, red: outstanding > 0 },
//             ].map(({ label, value, green, red }) => (
//               <div key={label} className="flex justify-between text-sm">
//                 <span className="text-muted-foreground">{label}</span>
//                 <span className={cn("font-semibold", green && "text-emerald-600", red && "text-red-500")}>{value}</span>
//               </div>
//             ))}
//             <div className="pt-1">
//               <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
//                 <span>Progress</span>
//                 <span>{pct}%</span>
//               </div>
//               <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
//                 <div className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-emerald-500" : "bg-amber-500")}
//                   style={{ width: `${pct}%` }} />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Payment history */}
//         <div className="md:col-span-2">
//           <h3 className="text-sm font-semibold mb-3">Payment History</h3>
//           {invoice.payments.length === 0 ? (
//             <div className="flex items-center justify-center h-40 rounded-xl border bg-card text-sm text-muted-foreground">
//               No payments recorded yet.
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {invoice.payments.map((p, i) => (
//                 <div key={p.id} className="rounded-xl border bg-card p-4 fade-in" style={{ animationDelay:`${i*60}ms` }}>
//                   <div className="flex items-start justify-between gap-4">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2">
//                         <span className="text-lg font-bold text-emerald-600">₹{p.amount.toLocaleString("en-IN")}</span>
//                         <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{MODE_LABELS[p.mode]}</span>
//                       </div>
//                       <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
//                         <span>{format(new Date(p.date), "dd MMM yyyy")}</span>
//                         <span>Ref: {p.reference}</span>
//                         <span>By: {p.recordedBy}</span>
//                       </div>
//                       {p.note && <p className="text-xs text-muted-foreground mt-1 italic">{p.note}</p>}
//                     </div>
//                     <button onClick={() => setReceiptPayment(p)}
//                       className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors shrink-0">
//                       <Printer className="h-3 w-3" /> Receipt
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {showPayment && (
//         <PaymentDialog
//           invoiceNo={invoice.invoiceNo}
//           outstanding={outstanding}
//           onSubmit={handlePayment}
//           onClose={() => setShowPayment(false)}
//         />
//       )}

//       {receiptPayment && (
//         <ReceiptPDF invoice={invoice} payment={receiptPayment} onClose={() => setReceiptPayment(null)} />
//       )}
//     </div>
//   );
// }


// This is the new code 
"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Printer } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    ...(token    ? { Authorization: `Bearer ${token}` }      : {}),
    ...(tenantId ? { "X-Tenant-Id": tenantId }               : {}),
  };
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  paid:    { label: "Paid",    className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  partial: { label: "Partial", className: "bg-blue-50 text-blue-600 border-blue-200" },
  overdue: { label: "Overdue", className: "bg-red-50 text-red-600 border-red-200" },
};

const MODE_LABELS: Record<string, string> = {
  cash: "Cash", upi: "UPI", bank_transfer: "Bank Transfer", cheque: "Cheque", card: "Card",
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [invoice,  setInvoice]  = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMode,   setPayMode]   = useState("cash");
  const [payRef,    setPayRef]    = useState("");
  const [payNote,   setPayNote]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Fetch invoice list and find by id
        const invRes = await fetch(`${API}/fees/invoices`, { headers: authHeaders() });
        if (!invRes.ok) throw new Error(`Failed to load invoices (${invRes.status})`);
        const invJson = await invRes.json();
        const list: any[] = Array.isArray(invJson) ? invJson : (invJson.data ?? []);
        const found = list.find((i: any) => i.id === id);
        if (!found) throw new Error("Invoice not found");
        setInvoice(found);

        // Fetch payments
        const payRes = await fetch(`${API}/fees/invoices/${id}/payments`, { headers: authHeaders() });
        if (payRes.ok) {
          const payJson = await payRes.json();
          setPayments(Array.isArray(payJson) ? payJson : (payJson.data ?? []));
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handlePayment() {
    if (!payAmount || parseFloat(payAmount) <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/fees/invoices/${id}/pay`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          amount: parseFloat(payAmount),
          payment_mode: payMode,
          transaction_ref: payRef || null,
          notes: payNote || null,
        }),
      });
      if (!res.ok) throw new Error("Payment failed");
      toast.success("Payment recorded!");
      setShowPaymentForm(false);
      setPayAmount(""); setPayMode("cash"); setPayRef(""); setPayNote("");
      // Reload
      const invRes = await fetch(`${API}/fees/invoices`, { headers: authHeaders() });
      const invJson = await invRes.json();
      const list: any[] = Array.isArray(invJson) ? invJson : (invJson.data ?? []);
      setInvoice(list.find((i: any) => i.id === id));
      const payRes = await fetch(`${API}/fees/invoices/${id}/payments`, { headers: authHeaders() });
      const payJson = await payRes.json();
      setPayments(Array.isArray(payJson) ? payJson : (payJson.data ?? []));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="space-y-4 max-w-4xl">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
    </div>
  );

  if (error || !invoice) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-muted-foreground">{error ?? "Invoice not found."}</p>
      <button onClick={() => router.push("/fees")}
        className="text-sm underline text-primary">Back to Fees</button>
    </div>
  );

  const amountDue  = parseFloat(invoice.amount_due)  || 0;
  const amountPaid = parseFloat(invoice.amount_paid) || 0;
  const outstanding = Math.max(0, amountDue - amountPaid);
  const pct = amountDue > 0 ? Math.min(100, Math.round((amountPaid / amountDue) * 100)) : 0;
  const cfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.pending;

  const studentName =
  (
    invoice.student_name ??
    `${invoice.student?.first_name ?? ""} ${invoice.student?.last_name ?? ""}`.trim()
  ) || "—";

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.push("/fees")}
            className="mt-1 rounded-lg p-2 hover:bg-accent text-muted-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoice_no}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
                {cfg.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {studentName}{invoice.grade ? ` · ${invoice.grade}` : ""}
              </span>
            </div>
          </div>
        </div>
        {outstanding > 0 && (
          <button onClick={() => setShowPaymentForm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Record Payment
          </button>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Summary */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Invoice Summary</h3>
            {[
              { label: "Invoice No", value: invoice.invoice_no },
              { label: "Due Date",   value: format(parseISO(invoice.due_date), "dd MMM yyyy") },
              { label: "Created",    value: format(parseISO(invoice.created_at), "dd MMM yyyy") },
              { label: "Status",     value: cfg.label },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Amount breakdown */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            {[
              { label: "Invoice Amount", value: `₹${amountDue.toLocaleString("en-IN")}`,   green: false, red: false },
              { label: "Paid",           value: `₹${amountPaid.toLocaleString("en-IN")}`,  green: true,  red: false },
              { label: "Outstanding",    value: `₹${outstanding.toLocaleString("en-IN")}`, green: false, red: outstanding > 0 },
            ].map(({ label, value, green, red }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn("font-semibold", green && "text-emerald-600", red && "text-red-500")}>{value}</span>
              </div>
            ))}
            <div className="pt-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progress</span><span>{pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-emerald-500" : "bg-amber-500")}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment history */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold mb-3">Payment History</h3>
          {payments.length === 0 ? (
            <div className="flex items-center justify-center h-40 rounded-xl border bg-card text-sm text-muted-foreground">
              No payments recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p: any) => (
                <div key={p.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-600">
                          ₹{parseFloat(p.amount).toLocaleString("en-IN")}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                          {MODE_LABELS[p.payment_mode] ?? p.payment_mode}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        {/* <span>{format(parseISO(p.paid_at ?? p.created_at), "dd MMM yyyy")}</span> */}
                        <span>{p.paid_at || p.created_at ? format(parseISO(p.paid_at ?? p.created_at), "dd MMM yyyy") : "—"}</span>
                        {p.transaction_ref && <span>Ref: {p.transaction_ref}</span>}
                      </div>
                      {p.notes && <p className="text-xs text-muted-foreground mt-1 italic">{p.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inline payment form */}
      {showPaymentForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPaymentForm(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border bg-background shadow-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Record Payment</h2>
            <p className="text-sm text-muted-foreground">Outstanding: ₹{outstanding.toLocaleString("en-IN")}</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Amount</label>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  placeholder={`Max ₹${outstanding}`}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Mode</label>
                <select value={payMode} onChange={e => setPayMode(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none">
                  {Object.entries(MODE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Reference (optional)</label>
                <input value={payRef} onChange={e => setPayRef(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <input value={payNote} onChange={e => setPayNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none" />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowPaymentForm(false)}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors">
                Cancel
              </button>
              <button onClick={handlePayment} disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {submitting ? "Saving…" : "Record Payment"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}