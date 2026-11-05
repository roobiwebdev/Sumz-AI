import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
      <Logo />
      <p className="mt-10 font-display text-8xl font-black text-gradient-brand">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-muted">The link may be broken, or the page may have moved.</p>
      <ButtonLink href="/" size="lg" className="mt-8">
        Back home
      </ButtonLink>
    </main>
  );
}
