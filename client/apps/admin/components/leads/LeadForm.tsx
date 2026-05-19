// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Loader2 } from "lucide-react";
// import type { Lead } from "@/lib/types/lead";

// const schema = z.object({
//   name: z.string().min(2, "Name is required"),

//   email: z.string().email("Valid email required"),

//   phone: z.string().min(10, "Valid phone required"),

//   parentName: z.string().min(2, "Parent name required"),

//   // NEW FIELD
//   parentContactNumber: z
//     .string()
//     .min(10, "Valid parent contact required"),

//   // NEW FIELD
//   schoolName: z.string().min(2, "School name required"),

//   grade: z.string().min(1, "Grade required"),

//   subject: z.string().min(1, "Subject required"),

//   source: z.enum([
//     "WEBSITE",
//     "REFERRAL",
//     "SOCIAL_MEDIA",
//     "WALK_IN",
//     "PHONE",
//     "OTHER",
//   ]),

//   notes: z.string().optional(),

//   tags: z.string().optional(),
// });

// export type LeadFormValues = z.infer<typeof schema>;

// interface LeadFormProps {
//   defaultValues?: Partial<Lead>;
//   onSubmit: (data: LeadFormValues) => Promise<void>;
//   onCancel: () => void;
//   submitLabel?: string;
// }

// const Field = ({
//   label,
//   error,
//   children,
// }: {
//   label: string;
//   error?: string;
//   children: React.ReactNode;
// }) => (
//   <div className="space-y-1.5">
//     <label className="text-sm font-medium text-foreground">
//       {label}
//     </label>

//     {children}

//     {error && (
//       <p className="text-xs text-destructive">
//         {error}
//       </p>
//     )}
//   </div>
// );

// const inputCls =
//   "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

// const selectCls = inputCls;

// export function LeadForm({
//   defaultValues,
//   onSubmit,
//   onCancel,
//   submitLabel = "Create Lead",
// }: LeadFormProps) {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<LeadFormValues>({
//     resolver: zodResolver(schema),

//     defaultValues: {
//       name: defaultValues?.name ?? "",

//       email: defaultValues?.email ?? "",

//       phone: defaultValues?.phone ?? "",

//       parentName: defaultValues?.parentName ?? "",

//       // NEW
//       parentContactNumber:
//         (defaultValues as any)?.parentContactNumber ?? "",

//       // NEW
//       schoolName:
//         (defaultValues as any)?.schoolName ?? "",

//       grade: defaultValues?.grade ?? "",

//       subject: defaultValues?.subject ?? "",

//       source: defaultValues?.source ?? "WEBSITE",

//       notes: defaultValues?.notes ?? "",

//       tags: defaultValues?.tags?.join(", ") ?? "",
//     },
//   });

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="space-y-4"
//     >
//       <div className="grid grid-cols-2 gap-4">

//         {/* Student Name */}
//         <Field
//           label="Student Name"
//           error={errors.name?.message}
//         >
//           <input
//             {...register("name")}
//             placeholder="Arjun Mehta"
//             className={inputCls}
//           />
//         </Field>

//         {/* Parent Name */}
//         <Field
//           label="Parent Name"
//           error={errors.parentName?.message}
//         >
//           <input
//             {...register("parentName")}
//             placeholder="Suresh Mehta"
//             className={inputCls}
//           />
//         </Field>

//         {/* NEW FIELD */}
//         <Field
//           label="Parent Contact Number"
//           error={errors.parentContactNumber?.message}
//         >
//           <input
//             {...register("parentContactNumber")}
//             placeholder="9876543210"
//             className={inputCls}
//           />
//         </Field>

//         {/* NEW FIELD */}
//         <Field
//           label="School Name"
//           error={errors.schoolName?.message}
//         >
//           <input
//             {...register("schoolName")}
//             placeholder="Delhi Public School"
//             className={inputCls}
//           />
//         </Field>

//         {/* Email */}
//         <Field
//           label="Email"
//           error={errors.email?.message}
//         >
//           <input
//             {...register("email")}
//             type="email"
//             placeholder="arjun@gmail.com"
//             className={inputCls}
//           />
//         </Field>

//         {/* Phone */}
//         <Field
//           label="Phone"
//           error={errors.phone?.message}
//         >
//           <input
//             {...register("phone")}
//             placeholder="9876543210"
//             className={inputCls}
//           />
//         </Field>

//         {/* Grade */}
//         <Field
//           label="Grade"
//           error={errors.grade?.message}
//         >
//           <select
//             {...register("grade")}
//             className={selectCls}
//           >
//             <option value="">Select grade</option>

//             {[
//               "8th",
//               "9th",
//               "10th",
//               "11th",
//               "12th",
//               "Dropper",
//             ].map((g) => (
//               <option key={g} value={g}>
//                 {g}
//               </option>
//             ))}
//           </select>
//         </Field>

//         {/* Subject */}
//         <Field
//           label="Subject"
//           error={errors.subject?.message}
//         >
//           <select
//             {...register("subject")}
//             className={selectCls}
//           >
//             <option value="">Select subject</option>

//             {[
//               "Mathematics",
//               "Physics",
//               "Chemistry",
//               "Biology",
//               "Science",
//               "English",
//               "Hindi",
//             ].map((s) => (
//               <option key={s} value={s}>
//                 {s}
//               </option>
//             ))}
//           </select>
//         </Field>

//         {/* Lead Source */}
//         <Field
//           label="Lead Source"
//           error={errors.source?.message}
//         >
//           <select
//             {...register("source")}
//             className={selectCls}
//           >
//             <option value="WEBSITE">Website</option>
//             <option value="REFERRAL">Referral</option>
//             <option value="SOCIAL_MEDIA">
//               Social Media
//             </option>
//             <option value="WALK_IN">Walk-in</option>
//             <option value="PHONE">Phone</option>
//             <option value="OTHER">Other</option>
//           </select>
//         </Field>

//         {/* Tags */}
//         <Field
//           label="Tags (comma separated)"
//           error={errors.tags?.message}
//         >
//           <input
//             {...register("tags")}
//             placeholder="JEE, High Priority"
//             className={inputCls}
//           />
//         </Field>
//       </div>

//       {/* Notes */}
//       <Field
//         label="Notes"
//         error={errors.notes?.message}
//       >
//         <textarea
//           {...register("notes")}
//           rows={3}
//           placeholder="Any additional notes…"
//           className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
//         />
//       </Field>

//       {/* Actions */}
//       <div className="flex justify-end gap-3 pt-2 border-t">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
//         >
//           Cancel
//         </button>

//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
//         >
//           {isSubmitting && (
//             <Loader2 className="h-3.5 w-3.5 animate-spin" />
//           )}

//           {submitLabel}
//         </button>
//       </div>
//     </form>
//   );
// }

"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { Batch } from "@/app/(dashboard)/leads/page";

// ─── Validation schema ────────────────────────────────────────────────────────
const schema = z.object({
  // existing required
  name:                 z.string().min(1, "Name is required"),
  email:                z.string().email("Invalid email").or(z.literal("")),
  phone:                z.string().min(1, "Phone is required"),
  source:               z.string().min(1, "Source is required"),
  subject:              z.string().min(1, "Interested course is required"),

  // existing optional
  parentName:           z.string().optional(),
  parentContactNumber:  z.string().optional(),
  schoolName:           z.string().optional(),
  grade:                z.string().optional(),
  notes:                z.string().optional(),

  // ── new fields ───────────────────────────────────────────────────────────
  boardName:            z.string().optional(),
  batchId:              z.string().optional(),
});

export type LeadFormValues = z.infer<typeof schema>;

// ─── Source options ───────────────────────────────────────────────────────────
const SOURCES = [
  { value: "WEBSITE",     label: "Website"      },
  { value: "REFERRAL",    label: "Referral"      },
  { value: "SOCIAL",      label: "Social Media"  },
  { value: "WALK_IN",     label: "Walk-in"       },
  { value: "PHONE",       label: "Phone"         },
  { value: "EMAIL",       label: "Email"         },
  { value: "WHATSAPP",    label: "WhatsApp"      },
  { value: "OTHER",       label: "Other"         },
];

// ─── Board options (common Indian boards) ────────────────────────────────────
const BOARDS = [
  { value: "CBSE",        label: "CBSE"              },
  { value: "ICSE",        label: "ICSE / ISC"        },
  { value: "STATE",       label: "State Board"       },
  { value: "IB",          label: "IB"                },
  { value: "IGCSE",       label: "IGCSE / Cambridge"  },
  { value: "NIOS",        label: "NIOS"              },
  { value: "OTHER",       label: "Other"             },
];

// ─── Reusable field wrapper ───────────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Shared input / select class ─────────────────────────────────────────────
const inputCls = (hasError?: boolean) =>
  cn(
    "w-full rounded-lg border bg-background px-3 py-2 text-sm",
    "placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    hasError && "border-destructive focus:ring-destructive"
  );

// ─── Props ────────────────────────────────────────────────────────────────────
interface LeadFormProps {
  onSubmit:       (data: LeadFormValues) => Promise<void>;
  onCancel:       () => void;
  batches?:       Batch[];
  batchesLoading?: boolean;
  defaultValues?: Partial<LeadFormValues>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LeadForm({
  onSubmit,
  onCancel,
  batches         = [],
  batchesLoading  = false,
  defaultValues,
}: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      source:   "WEBSITE",
      email:    "",
      notes:    "",
      boardName: "",
      batchId:   "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

      {/* ── Section: Student Info ─────────────────────────────────────────── */}
      <SectionTitle>Student Information</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" required error={errors.name?.message}>
          <input
            {...register("name")}
            placeholder="Student's full name"
            className={inputCls(!!errors.name)}
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            placeholder="student@example.com"
            className={inputCls(!!errors.email)}
          />
        </Field>

        <Field label="Phone" required error={errors.phone?.message}>
          <input
            {...register("phone")}
            placeholder="+91 98765 43210"
            className={inputCls(!!errors.phone)}
          />
        </Field>

        <Field label="Grade" error={errors.grade?.message}>
          <input
            {...register("grade")}
            placeholder="e.g. 10, 11, 12"
            className={inputCls(!!errors.grade)}
          />
        </Field>

        
        {/* ── Board Name (new) ─────────────────────────────────────────────── */}
        <Field label="Board Name" error={errors.boardName?.message}>
          <select {...register("boardName")} className={inputCls(!!errors.boardName)}>
            <option value="">— Select Board —</option>
            {BOARDS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── Section: Academic / Batch ─────────────────────────────────────── */}
      <SectionTitle>Academic & Batch</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Interested Course" required error={errors.subject?.message}>
          <input
            {...register("subject")}
            placeholder="e.g. JEE Mains, NEET, Foundation"
            className={inputCls(!!errors.subject)}
          />
        </Field>

        {/* ── Batch Name dropdown (new) ─────────────────────────────────────── */}
        <Field label="Batch Name" error={errors.batchId?.message}>
          <select
            {...register("batchId")}
            disabled={batchesLoading}
            className={inputCls(!!errors.batchId)}
          >
            <option value="">
              {batchesLoading ? "Loading batches…" : "— Select Batch —"}
            </option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {batchesLoading && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
          )}
        </Field>

        <Field label="Source" required error={errors.source?.message}>
          <select {...register("source")} className={inputCls(!!errors.source)}>
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="School Name" error={errors.schoolName?.message}>
          <input
            {...register("schoolName")}
            placeholder="School / college name"
            className={inputCls(!!errors.schoolName)}
          />
        </Field>
      </div>

      {/* ── Section: Parent Info ──────────────────────────────────────────── */}
      <SectionTitle>Parent / Guardian</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Parent Name" error={errors.parentName?.message}>
          <input
            {...register("parentName")}
            placeholder="Parent / guardian name"
            className={inputCls(!!errors.parentName)}
          />
        </Field>

        <Field label="Parent Contact" error={errors.parentContactNumber?.message}>
          <input
            {...register("parentContactNumber")}
            placeholder="+91 98765 43210"
            className={inputCls(!!errors.parentContactNumber)}
          />
        </Field>
      </div>

      {/* ── Notes ─────────────────────────────────────────────────────────── */}
      <Field label="Notes" error={errors.notes?.message}>
        <textarea
          {...register("notes")}
          rows={3}
          placeholder="Any additional notes…"
          className={cn(inputCls(!!errors.notes), "resize-none")}
        />
      </Field>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isSubmitting ? "Saving…" : "Create Lead"}
        </button>
      </div>
    </form>
  );
}

// ── tiny helper ───────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
        {children}
      </p>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}