"use client";

import { Check, Copy, Link2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useTypewriter } from "@/components/ui/typewriter";

// Sample content for the animated demo only. Domains are placeholders, not real publications.
const samples = [
  {
    url: "https://longreads.example/the-four-day-work-week",
    title: "What happened when 61 companies tried a four-day week",
    summary:
      "A six-month trial across 61 companies found revenue held steady while burnout and sick days fell. Most firms kept the shorter week after the trial ended. The gains depended on cutting meetings and low-value work first.",
  },
  {
    url: "https://engineering.example/blog/postgres-at-scale",
    title: "How we scaled Postgres to a billion rows",
    summary:
      "The team avoided sharding by partitioning their largest table by month and moving cold data to cheaper storage. Read replicas absorbed analytics traffic. Query time on the hot path dropped from seconds to milliseconds.",
  },
  {
    url: "https://science.example/sleep-and-memory",
    title: "Why sleep is when your memories are filed away",
    summary:
      "During deep sleep the brain replays the day's experiences and moves them into long-term memory. Missing a night cuts recall of new facts by up to 40 percent. Short naps help, but they don't replace a full night.",
  },
] as const;

type Phase = "typing-url" | "loading" | "summary";

export function HeroDemo() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing-url");
  const sample = samples[index % samples.length] ?? samples[0];

  const url = useTypewriter(sample.url, { speed: 28, enabled: phase === "typing-url" });
  const summary = useTypewriter(sample.summary, { speed: 14, enabled: phase === "summary" });

  useEffect(() => {
    let id: number | undefined;
    if (phase === "typing-url" && url.done) id = window.setTimeout(() => setPhase("loading"), 500);
    if (phase === "loading") id = window.setTimeout(() => setPhase("summary"), 1400);
    if (phase === "summary" && summary.done)
      id = window.setTimeout(() => {
        setIndex((i) => i + 1);
        setPhase("typing-url");
      }, 4000);
    return () => window.clearTimeout(id);
  }, [phase, url.done, summary.done]);

  const shownUrl = phase === "typing-url" ? url.visible : sample.url;

  return (
    <div className="relative mx-auto w-full max-w-3xl" aria-label="Animated product demo" role="img">
      <div className="absolute -inset-x-10 -top-10 -bottom-10 -z-10 opacity-25 bg-aurora" />
      <div className="overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-[0_30px_120px_-30px_rgba(234,88,12,0.35)] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
          <span className="size-3 rounded-full bg-[#ff5f57]/80" />
          <span className="size-3 rounded-full bg-[#febc2e]/80" />
          <span className="size-3 rounded-full bg-[#28c840]/80" />
          <span className="ml-3 text-xs text-subtle">sumz.ai/app</span>
        </div>
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex items-center gap-3 rounded-2xl border border-border-strong bg-background px-4 py-3">
            <Link2 className="size-4 shrink-0 text-subtle" />
            <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground/90">
              {shownUrl}
              {phase === "typing-url" ? <span className="ml-px inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-brand" /> : null}
            </span>
            <span className="hidden rounded-lg border border-border px-2 py-1 text-xs text-subtle sm:inline">↵</span>
          </div>

          <div className="min-h-[188px]">
            <AnimatePresence mode="wait">
              {phase === "loading" ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-[188px] flex-col items-center justify-center gap-3 text-sm text-subtle"
                >
                  <Spinner className="size-7" />
                  Reading the article…
                </motion.div>
              ) : phase === "summary" ? (
                <motion.div
                  key={`summary-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-border bg-background/60 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.18em] text-subtle uppercase">
                        Article <span className="text-gradient-accent">summary</span>
                      </p>
                      <p className="mt-1.5 font-display text-base font-bold text-foreground">{sample.title}</p>
                    </div>
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-subtle">
                      {summary.done ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {summary.visible}
                    {summary.done ? null : <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-brand" />}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5 pt-2">
                  {[92, 80, 86, 54].map((w) => (
                    <div key={w} className="h-3 rounded-full bg-surface-raised" style={{ width: `${w}%` }} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
