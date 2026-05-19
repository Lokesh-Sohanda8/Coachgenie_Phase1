"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotPasswordInput = z.infer<typeof schema>;

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? "demo";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(schema) });

  async function onSubmit(data: ForgotPasswordInput) {
    const res = await fetch(`${API}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT_ID,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.message ?? err.detail ?? "Unable to send OTP");
      return;
    }

    setSentTo(data.email);
    toast.success("OTP sent to your email");
    router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
  }

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-xl shadow-black/5 space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <Mail className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your admin email and we will send a verification OTP.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="admin@demo.com"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>

      {sentTo && (
        <p className="rounded-lg bg-accent px-3 py-2 text-center text-xs text-muted-foreground">
          OTP sent to {sentTo}
        </p>
      )}

      <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
    </div>
  );
}
