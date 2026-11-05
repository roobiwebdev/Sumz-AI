import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-96 w-full max-w-2xl -translate-x-1/2 bg-aurora opacity-20" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between py-5">
        <Logo />
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" />
          Back home
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center py-10">{children}</main>
    </div>
  );
}
