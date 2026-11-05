import type { Metadata } from "next";
import { UserMenu } from "@/components/app/user-menu";
import { Logo } from "@/components/ui/logo";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Your summaries" };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-grid opacity-25" />
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-80 w-full max-w-2xl -translate-x-1/2 bg-aurora opacity-15" />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Logo href="/app" />
          <UserMenu name={user.name} email={user.email} image={user.image ?? null} />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">{children}</main>
    </div>
  );
}
