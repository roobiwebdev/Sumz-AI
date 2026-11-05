"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { ButtonLink } from "@/components/ui/button";
import { HeroDemo } from "./hero-demo";

const ticks = ["Free to start", "Works on any article link", "History saved to your account"];

export function Hero({ signedIn }: { signedIn: boolean }) {
  const item = (i: number) => ({
    initial: { opacity: 0, y: 20, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative overflow-hidden px-4 pt-36 pb-20 sm:pt-44 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40" />
      <div className="pointer-events-none absolute top-24 left-1/2 -z-10 h-[420px] w-full max-w-3xl -translate-x-1/2 bg-aurora opacity-20" />

      <div className="mx-auto max-w-4xl text-center">
        <motion.a
          {...item(0)}
          href="#how-it-works"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 py-1.5 pr-3 pl-1.5 text-xs text-muted backdrop-blur transition-colors hover:border-border-strong hover:text-foreground"
        >
          <span className="rounded-full bg-brand/15 px-2 py-0.5 font-semibold text-brand">New</span>
          Accounts and saved history are here
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        <motion.h1
          {...item(1)}
          className="mt-7 font-display text-5xl leading-[1.04] font-black tracking-tight text-balance sm:text-7xl"
        >
          Read less. <br className="hidden sm:block" />
          <span className="text-gradient-brand">Know more.</span>
        </motion.h1>

        <motion.p {...item(2)} className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted sm:text-xl">
          Paste any article link and Sumz AI hands you the gist in three clear sentences. Every summary is saved, so
          nothing you read gets lost.
        </motion.p>

        <motion.div {...item(3)} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href={signedIn ? "/app" : "/sign-up"} size="lg" className="w-full sm:w-auto">
            {signedIn ? "Open Sumz AI" : "Start summarizing free"}
            <ArrowRight className="size-4" />
          </ButtonLink>
          <ButtonLink href="/#how-it-works" variant="outline" size="lg" className="w-full sm:w-auto">
            See how it works
          </ButtonLink>
        </motion.div>

        <motion.ul {...item(4)} className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-subtle">
          {ticks.map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-brand" />
              {t}
            </li>
          ))}
        </motion.ul>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-16 sm:mt-20"
      >
        <HeroDemo />
      </motion.div>
    </section>
  );
}
