import { cn } from "@/lib/cn";

/** The original Sumz amber loader ring. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block size-5 animate-spin-slow rounded-full border-2 border-brand border-r-transparent", className)}
    />
  );
}
