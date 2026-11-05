"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "Questions" },
] as const;

export function Nav({ signedIn }: { signedIn: boolean }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3">
      <nav
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full px-4 transition-all duration-300 sm:px-5",
          scrolled || open ? "border border-border bg-background/70 shadow-2xl shadow-black/40 backdrop-blur-xl" : "border border-transparent",
        )}
      >
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <ButtonLink href="/app" size="sm">
              Open app
            </ButtonLink>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-foreground">
                Sign in
              </Link>
              <ButtonLink href="/sign-up" size="sm">
                Get started
              </ButtonLink>
            </>
          )}
        </div>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full text-muted hover:text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-6xl rounded-3xl border border-border bg-background/90 p-3 backdrop-blur-xl md:hidden"
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-muted hover:bg-surface-raised hover:text-foreground">
                {l.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {signedIn ? (
                <ButtonLink href="/app" className="col-span-2">
                  Open app
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/sign-in" variant="outline">
                    Sign in
                  </ButtonLink>
                  <ButtonLink href="/sign-up">Get started</ButtonLink>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
