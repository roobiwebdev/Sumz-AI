import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * SOURCE OF TRUTH KEYWORDS: Logo, brand mark, wordmark, Sumz AI
 * WHAT:  The Sumz AI mark + wordmark, linking home.
 * WHERE: Nav, footer, auth layout, app header.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-8 items-center justify-center overflow-hidden rounded-[10px] bg-brand-gradient",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[18px] text-background" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M5 7h14M5 12h9M5 17h5" />
      </svg>
    </span>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: "/" | "/app" }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight", className)}>
      <LogoMark />
      <span>
        Sumz <span className="text-gradient-brand">AI</span>
      </span>
    </Link>
  );
}
