import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * SOURCE OF TRUTH KEYWORDS: Input, Field, Label, form field, text input, error message
 * WHAT:  Text input and labelled field with an inline error.
 * WHY:   Every form (auth, summarizer) shares one input look and one error pattern.
 * WHERE: src/components/auth/*, src/components/app/summarizer.tsx.
 */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground placeholder:text-subtle transition-colors",
        "focus:border-brand/70 focus:outline-none focus:ring-4 focus:ring-brand/10 aria-invalid:border-danger/70",
        className,
      )}
      {...props}
    />
  );
}

type FieldProps = ComponentProps<"input"> & { label: string; error?: string; hint?: React.ReactNode };

export function Field({ label, error, hint, id, name, ...props }: FieldProps) {
  const fieldId = id ?? name;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground/90">
          {label}
        </label>
        {hint}
      </div>
      <Input
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
