import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * SOURCE OF TRUTH KEYWORDS: Button, ButtonLink, buttonStyles, primary button, cta, variants
 * WHAT:  The one button style for the whole product, as a <button> or a Next <Link>.
 * WHY:   Landing, auth and app share identical buttons; variants instead of ad-hoc classes.
 * WHERE: src/components/landing/*, src/components/auth/*, src/components/app/*.
 */
type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-background shadow-[0_0_0_1px_rgba(245,158,11,0.4),0_8px_30px_-8px_rgba(234,88,12,0.6)] hover:brightness-110",
  secondary: "bg-foreground text-background hover:bg-foreground/90",
  outline: "border border-border-strong bg-surface/60 text-foreground hover:bg-surface-raised hover:border-subtle",
  ghost: "text-muted hover:text-foreground hover:bg-surface-raised",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function buttonStyles(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonStyles(variant, size, className)} {...props} />;
}
