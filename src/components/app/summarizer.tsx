"use client";

import { ArrowUp, Check, Copy, ExternalLink, Link2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { deleteSummaryAction, summarizeAction } from "@/app/app/actions";
import { FormAlert } from "@/components/auth/auth-card";
import { Spinner } from "@/components/ui/spinner";
import { Typewriter } from "@/components/ui/typewriter";
import { cn } from "@/lib/cn";
import type { SummaryItem } from "@/server/summaries";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const timeFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border text-subtle transition-colors hover:border-border-strong hover:text-foreground"
    >
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
    </button>
  );
}

export function Summarizer({
  initialItems,
  usage,
  configured,
}: {
  initialItems: SummaryItem[];
  usage: { used: number; limit: number };
  configured: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState(initialItems);
  const [used, setUsed] = useState(usage.used);
  const [activeId, setActiveId] = useState<string | null>(initialItems[0]?.id ?? null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const active = items.find((i) => i.id === activeId) ?? null;
  const remaining = Math.max(0, usage.limit - used);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!url.trim() || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await summarizeAction(url);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItems((prev) => [result.summary, ...prev]);
      setActiveId(result.summary.id);
      setFreshId(result.summary.id);
      setUsed((u) => u + 1);
      setUrl("");
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (activeId === id) setActiveId(null);
    startTransition(() => deleteSummaryAction(id));
  }

  return (
    <div className="mt-8 space-y-10">
      <div>
        <form onSubmit={submit} className="group relative">
          <Link2 className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle" />
          <input
            type="url"
            inputMode="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/an-article-worth-reading"
            aria-label="Article URL"
            disabled={!configured}
            className="h-14 w-full rounded-2xl border border-border-strong bg-surface pr-16 pl-12 text-base text-foreground shadow-xl shadow-black/40 transition-colors placeholder:text-subtle focus:border-brand/70 focus:ring-4 focus:ring-brand/10 focus:outline-none disabled:opacity-60 sm:text-sm"
          />
          <button
            type="submit"
            aria-label="Summarize"
            disabled={pending || !url.trim() || !configured}
            className="absolute top-1/2 right-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-xl bg-brand-gradient text-background transition-all hover:brightness-110 disabled:opacity-40"
          >
            {pending ? <Spinner className="size-4 border-background border-r-transparent" /> : <ArrowUp className="size-5" />}
          </button>
        </form>
        <div className="mt-3 flex items-center justify-between gap-4 text-xs text-subtle">
          <span>
            {remaining} of {usage.limit} summaries left today
          </span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-raised">
            <motion.div className="h-full bg-brand-gradient" initial={false} animate={{ width: `${(remaining / usage.limit) * 100}%` }} />
          </div>
        </div>
        {!configured ? (
          <div className="mt-4">
            <FormAlert>The summarizer isn&apos;t connected yet. Add RAPIDAPI_KEY to the server environment.</FormAlert>
          </div>
        ) : null}
        {error ? (
          <div className="mt-4">
            <FormAlert>{error}</FormAlert>
          </div>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {active ? (
          <motion.section
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            aria-live="polite"
            className="rounded-3xl border border-border bg-surface/90 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.18em] text-subtle uppercase">
                  Article <span className="text-gradient-accent">summary</span>
                </p>
                <a href={active.url} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex max-w-full items-center gap-1.5 text-sm text-accent-soft hover:underline">
                  <span className="truncate">{hostname(active.url)}</span>
                  <ExternalLink className="size-3.5 shrink-0" />
                </a>
              </div>
              <CopyButton text={active.content} label="Copy summary" />
            </div>
            {active.id === freshId ? (
              <Typewriter text={active.content} className="mt-4 leading-relaxed whitespace-pre-wrap text-foreground/90" />
            ) : (
              <p className="mt-4 leading-relaxed whitespace-pre-wrap text-foreground/90">{active.content}</p>
            )}
          </motion.section>
        ) : null}
      </AnimatePresence>

      <section aria-labelledby="history-heading">
        <div className="flex items-center justify-between">
          <h2 id="history-heading" className="font-display text-lg font-bold">
            History
          </h2>
          <span className="text-xs text-subtle">{items.length} saved</span>
        </div>
        {items.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-border px-6 py-12 text-center">
            <p className="font-medium">No summaries yet</p>
            <p className="mt-1 text-sm text-subtle">Paste your first article link above.</p>
          </div>
        ) : (
          <ul className="scrollbar-brand mt-4 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border bg-surface px-4 py-3 transition-colors",
                    item.id === activeId ? "border-brand/50" : "border-border hover:border-border-strong",
                  )}
                >
                  <button type="button" onClick={() => setActiveId(item.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Link2 className="size-4 shrink-0 text-brand" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">{hostname(item.url)}</span>
                      <span className="block truncate text-xs text-subtle">{item.url}</span>
                    </span>
                    <span className="hidden shrink-0 text-xs text-subtle sm:inline">{timeFormat.format(new Date(item.createdAt))}</span>
                  </button>
                  <CopyButton text={item.url} label="Copy link" />
                  <button
                    type="button"
                    aria-label="Delete summary"
                    onClick={() => remove(item.id)}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-border text-subtle transition-colors hover:border-danger/50 hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  );
}
