"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * SOURCE OF TRUTH KEYWORDS: AuthCard, auth layout card, sign in card, FormAlert, OrDivider, GoogleButton
 * WHAT:  Shared building blocks for every auth screen.
 * WHERE: src/components/auth/*-form.tsx, src/app/(auth)/*.
 */
export function AuthCard({ title, description, children, footer }: { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[420px]"
    >
      <div className="rounded-3xl border border-border bg-surface/85 p-7 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-muted">{description}</p> : null}
        <div className="mt-7">{children}</div>
      </div>
      {footer ? <p className="mt-6 text-center text-sm text-muted">{footer}</p> : null}
    </motion.div>
  );
}

export function FormAlert({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          : "rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
      }
    >
      {children}
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-subtle uppercase">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
