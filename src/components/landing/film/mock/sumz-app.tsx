import { ArrowUp, Check, Clock, Copy, ExternalLink, Link2, Trash2 } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { clamp, easeInOut, easeOut, easeOutBack, envelope, lerp, span, typed } from "../ease";
import { APP, CLUTTER, CONTENT, HISTORY_SCROLL, T, USAGE, phase, usageLeft, wordsRead } from "../script";
import { ARTICLE, ArticlePage, peelAt } from "./article-page";

const PASTED = `https://${ARTICLE.host}${ARTICLE.path}`;

export const SUMMARY = [
  {
    label: "Main point",
    text: "Night trains are back across Europe as travelers swap short flights for sleeper cabins that leave after dinner and arrive by breakfast.",
  },
  {
    label: "Key facts",
    text: "New operators are leasing modern carriages on routes that were cut a decade ago, and the busiest lines now sell out weeks ahead.",
  },
  {
    label: "Why it matters",
    text: "A sleeper replaces a short flight and a hotel night at once, so better cabins could make rail the easy default for city hops.",
  },
] as const;

const HISTORY = [
  { title: "Why sleep shapes what you remember", host: "science.example", when: "Yesterday" },
  { title: "Cómo las ciudades plantan bosques en sus azoteas", host: "ciudades.example", when: "Mon" },
  { title: "Postgres at scale: ten years of lessons", host: "engineering.example", when: "Last week" },
] as const;

const ROW = 64;

/**
 * SOURCE OF TRUTH KEYWORDS: SumzApp mock, film app screen, summarizer mock, reading panel, summary card, history list
 * WHAT:  The real /app screen redrawn for the film: greeting, link input, usage meter, reading panel,
 *        summary card and history, every state derived from `t`.
 * WHY:   Someone who opens the product after watching should recognise every piece.
 * WHERE: src/components/landing/film/scene.tsx.
 */
export function SumzApp({ t }: { t: number }) {
  const scroll = HISTORY_SCROLL * easeInOut(span(t, T.appScroll[0], T.appScroll[1]));
  const historyTop = lerp(APP.cardY, APP.historyY, easeInOut(span(t, T.submit, T.submit + 650)));

  return (
    <div className="absolute inset-0 overflow-hidden bg-background text-foreground" style={{ width: CONTENT.w, height: CONTENT.h }}>
      <div className="pointer-events-none absolute -top-20 left-1/2 h-[300px] w-[700px] -translate-x-1/2 bg-aurora opacity-[0.13]" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />

      <div className="absolute inset-0" style={{ transform: `translateY(${-scroll}px)` }}>
        <Header />
        <div className="absolute" style={{ left: APP.x, top: 92, width: APP.w }}>
          <h1 className="font-display text-[34px] leading-tight font-bold tracking-tight">
            Hi Maya, <span className="text-gradient-brand">what are we reading?</span>
          </h1>
          <p className="mt-1.5 text-[16px] text-muted">Paste an article link and get the gist in three sentences.</p>
        </div>
        <UrlInput t={t} />
        <Meter t={t} />
        <ReadingPanel t={t} />
        <SummaryCard t={t} />
        <History t={t} top={historyTop} />
      </div>

      <Toast t={t} />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute inset-x-0 top-0 border-b border-border bg-background/70 backdrop-blur" style={{ height: APP.header }}>
      <div className="absolute flex items-center justify-between" style={{ left: APP.x - 60, width: APP.w + 120, top: 12 }}>
        <span className="inline-flex items-center gap-2.5 font-display text-[19px] font-bold tracking-tight">
          <LogoMark />
          <span>
            Sumz <span className="text-gradient-brand">AI</span>
          </span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3.5 pl-1 text-[14px]">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-gradient text-[11px] font-bold text-background">
            MC
          </span>
          Maya Chen
        </span>
      </div>
    </div>
  );
}

function UrlInput({ t }: { t: number }) {
  const focused = t >= T.inputClick && t < T.card[0];
  const pasted = t >= T.paste && t < T.card[0];
  const flash = 1 - span(t, T.paste, T.paste + 600);
  const caret = focused && t < T.submit && Math.floor(t / 530) % 2 === 0;
  const loading = t >= T.submit && t < T.card[0];
  const press = t >= T.submit && t < T.submit + 160 ? 0.9 : 1;

  return (
    <div
      className="absolute flex items-center rounded-2xl border bg-surface shadow-xl shadow-black/40"
      style={{
        left: APP.x,
        top: APP.inputY,
        width: APP.w,
        height: APP.inputH,
        borderColor: focused ? "color-mix(in oklab, var(--color-brand) 70%, transparent)" : "var(--color-border-strong)",
        boxShadow: focused ? "0 0 0 4px color-mix(in oklab, var(--color-brand) 12%, transparent)" : undefined,
      }}
    >
      <Link2 className="ml-4 size-5 shrink-0 text-subtle" />
      <span className="ml-3 flex min-w-0 flex-1 items-center text-[15px]">
        {pasted ? (
          <span
            className="truncate rounded px-0.5"
            style={{ backgroundColor: `color-mix(in oklab, var(--color-brand) ${flash * 30}%, transparent)` }}
          >
            {PASTED}
          </span>
        ) : (
          <span className="truncate text-subtle">https://example.com/an-article-worth-reading</span>
        )}
        {caret ? <span className="ml-px inline-block h-5 w-[2px] bg-brand" /> : null}
      </span>
      <span
        className="mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-background"
        style={{ transform: `scale(${press})`, opacity: pasted || loading ? 1 : 0.4 }}
      >
        {loading ? (
          <span
            className="block size-4 rounded-full border-2 border-background border-r-transparent"
            style={{ transform: `rotate(${(t * 0.5) % 360}deg)` }}
          />
        ) : (
          <ArrowUp className="size-5" />
        )}
      </span>
    </div>
  );
}

function Meter({ t }: { t: number }) {
  const left = usageLeft(t);
  const glow = Math.sin(span(t, T.meter, T.meter + 700) * Math.PI);
  return (
    <div
      className="absolute flex items-center justify-between text-[13px] text-subtle"
      style={{ left: APP.x, top: APP.meterY, width: APP.w }}
    >
      <span style={{ color: glow > 0.05 ? "var(--color-brand)" : undefined }}>
        {left} of {USAGE.limit} summaries left today
      </span>
      <span className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-raised">
        <span className="block h-full bg-brand-gradient" style={{ width: `${(left / USAGE.limit) * 100}%` }} />
      </span>
    </div>
  );
}

/* ---------- Reading panel (chapters 2 and 3) ---------- */

function Step({ state, title, children }: { state: "wait" | "busy" | "done"; title: string; children?: React.ReactNode }) {
  return (
    <div style={{ opacity: state === "wait" ? 0.4 : 1 }}>
      <div className="flex items-center gap-2.5 text-[15px] font-semibold">
        <span
          className={`inline-flex size-6 items-center justify-center rounded-full ${state === "done" ? "bg-success/15 text-success" : "bg-brand/15 text-brand"}`}
        >
          {state === "done" ? <Check className="size-3.5" /> : <span className="block size-1.5 rounded-full bg-brand" />}
        </span>
        {title}
      </div>
      {children}
    </div>
  );
}

function ReadingPanel({ t }: { t: number }) {
  const opacity = envelope(t, T.submit + 100, T.submit + 500, T.card[0] - 100, T.card[0] + 200);
  if (opacity <= 0) return null;
  const p = phase(t);
  const peel = peelAt(t);
  const words = wordsRead(t);
  const scan = span(t, T.reading[0], T.reading[1]);
  const absorb = easeInOut(span(t, T.absorb[0], T.absorb[1]));
  const MINI = 0.3;

  return (
    <div
      className="absolute flex gap-7 rounded-3xl border border-border bg-surface/90 p-6 shadow-2xl shadow-black/40"
      style={{
        left: APP.x,
        top: APP.cardY,
        width: APP.w,
        height: APP.cardH,
        opacity,
        transform: `translateY(${(1 - opacity) * 14}px) scale(${0.98 + opacity * 0.02})`,
      }}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-xl border border-border-strong"
        style={{ width: CONTENT.w * MINI, height: CONTENT.h * MINI, transform: `scale(${1 - absorb * 0.06})`, opacity: 1 - absorb * 0.35 }}
      >
        <div style={{ transform: `scale(${MINI})`, transformOrigin: "0 0" }}>
          <ArticlePage t={0} clutterT={t} popup={1} />
        </div>
        {scan > 0 && scan < 1 ? (
          <div
            className="absolute inset-x-0 h-10 bg-[linear-gradient(to_bottom,transparent,color-mix(in_oklab,var(--color-brand)_45%,transparent))]"
            style={{ top: scan * CONTENT.h * MINI - 40 }}
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-5">
        <Step state={p === "fetching" ? "busy" : "done"} title={`Fetching ${ARTICLE.host}`} />
        <Step state={p === "fetching" ? "wait" : p === "cleaning" ? "busy" : "done"} title="Removing clutter">
          <div className="mt-2.5 flex flex-wrap gap-1.5 pl-8">
            {CLUTTER.map((c, i) => {
              const gone = (peel[i] ?? 0) > 0.5;
              return (
                <span
                  key={c}
                  className={`rounded-md border px-2 py-0.5 text-[12px] ${gone ? "border-border text-subtle line-through" : "border-border-strong text-muted"}`}
                >
                  {c}
                </span>
              );
            })}
          </div>
        </Step>
        <Step state={p === "reading" ? "busy" : p === "done" ? "done" : "wait"} title="Reading the article">
          <div className="mt-2.5 pl-8">
            <p className="font-display text-[22px] font-bold tabular-nums">
              {words.toLocaleString("en-US")} <span className="text-[14px] font-medium text-subtle">words</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised">
              <div className="h-full bg-brand-gradient" style={{ width: `${scan * 100}%` }} />
            </div>
          </div>
        </Step>
      </div>
    </div>
  );
}

/* ---------- Summary card (chapters 4 and 5) ---------- */

function SummaryCard({ t }: { t: number }) {
  const pop = span(t, T.card[0], T.card[1]);
  if (pop <= 0) return null;
  const k = easeOutBack(pop);
  const copied = t >= T.copyClick && t < T.toast[1] + 400;
  const copyPress = t >= T.copyClick && t < T.copyClick + 160 ? 0.88 : 1;
  const chip = easeOutBack(span(t, T.chip[0], T.chip[1]));

  return (
    <div
      className="absolute rounded-3xl border border-border bg-surface/95 p-6 shadow-2xl shadow-black/50"
      style={{
        left: APP.x,
        top: APP.cardY,
        width: APP.w,
        height: APP.cardH,
        opacity: clamp(pop * 2),
        transform: `translateY(${(1 - k) * 24}px)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(80%_60%_at_100%_0%,color-mix(in_oklab,var(--color-brand)_10%,transparent),transparent)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold tracking-[0.18em] text-subtle uppercase">
            Article <span className="text-gradient-accent">summary</span>
          </p>
          <h2 className="mt-1.5 font-display text-[21px] leading-snug font-bold">{ARTICLE.title}</h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[14px] text-accent-soft">
            {ARTICLE.host}
            <ExternalLink className="size-3.5" />
          </p>
        </div>
        <span
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border"
          style={{
            transform: `scale(${copyPress})`,
            borderColor: copied ? "color-mix(in oklab, var(--color-success) 50%, transparent)" : "var(--color-border-strong)",
            color: copied ? "var(--color-success)" : "var(--color-muted)",
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </span>
      </div>

      <div className="relative mt-4 space-y-2.5">
        {SUMMARY.map((s, i) => {
          const [a, b] = T.sentences[i] ?? [0, 0];
          const p = span(t, a, b);
          if (t < a) return null;
          const typing = p < 1;
          return (
            <p
              key={s.label}
              className="text-[15px] leading-[1.55] text-foreground/90"
              style={{ opacity: 0.6 + easeOut(span(t, a, a + 250)) * 0.4 }}
            >
              <span className="mr-2 inline-block rounded-md bg-brand/15 px-1.5 py-px align-[1px] text-[11px] font-bold tracking-wider text-brand uppercase">
                {s.label}
              </span>
              {typed(s.text, p)}
              {typing ? <span className="ml-px inline-block h-4 w-[2px] translate-y-0.5 bg-brand" /> : null}
            </p>
          );
        })}
      </div>

      {chip > 0 ? (
        <div
          className="glass absolute -right-5 -bottom-5 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[15px] font-semibold"
          style={{ opacity: clamp(chip), transform: `translateY(${(1 - chip) * 24}px) scale(${0.9 + chip * 0.1})` }}
        >
          <Clock className="size-4 text-brand" />
          <span className="text-muted line-through decoration-brand/70">{ARTICLE.minutes} min</span>
          <span className="text-gradient-brand">→ 20 sec</span>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- History (chapters 2 and 6) ---------- */

function HistoryRow({ title, host, when, highlight }: { title: string; host: string; when: string; highlight?: number }) {
  return (
    <div
      className="flex h-14 items-center gap-3 rounded-2xl border bg-surface px-4"
      style={{
        borderColor: highlight ? `color-mix(in oklab, var(--color-brand) ${50 * highlight}%, var(--color-border))` : "var(--color-border)",
      }}
    >
      <Link2 className="size-4 shrink-0 text-brand" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px]">{title}</span>
        <span className="block truncate text-[12px] text-subtle">{host}</span>
      </span>
      <span className="shrink-0 text-[12px] text-subtle">{when}</span>
      <span className="inline-flex size-8 items-center justify-center rounded-full border border-border text-subtle">
        <Copy className="size-3.5" />
      </span>
      <span className="inline-flex size-8 items-center justify-center rounded-full border border-border text-subtle">
        <Trash2 className="size-3.5" />
      </span>
    </div>
  );
}

function History({ t, top }: { t: number; top: number }) {
  const inserted = span(t, T.newItem[0], T.newItem[1]);
  const shift = easeInOut(inserted) * ROW;
  const pop = easeOutBack(inserted);
  const glow = 1 - span(t, T.newItem[1] + 600, T.newItem[1] + 2600);
  const saved = HISTORY.length + (inserted > 0 ? 1 : 0);

  return (
    <div className="absolute" style={{ left: APP.x, top, width: APP.w }}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[18px] font-bold">History</h3>
        <span className="text-[12px] text-subtle">{saved} saved</span>
      </div>
      <div className="relative mt-3">
        {inserted > 0 ? (
          <div className="absolute inset-x-0 top-0" style={{ opacity: clamp(inserted * 2), transform: `translateY(${(1 - pop) * -14}px)` }}>
            <HistoryRow title={ARTICLE.title} host={ARTICLE.host} when="Just now" highlight={glow} />
          </div>
        ) : null}
        {HISTORY.map((h, i) => (
          <div key={h.title} className="absolute inset-x-0" style={{ top: i * ROW, transform: `translateY(${shift}px)` }}>
            <HistoryRow {...h} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Toast({ t }: { t: number }) {
  const o = envelope(t, T.toast[0], T.toast[0] + 260, T.toast[1] - 320, T.toast[1]);
  if (o <= 0) return null;
  return (
    <div
      className="glass absolute left-1/2 inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-[15px] font-semibold"
      style={{ top: APP.header + 14, opacity: o, transform: `translate(-50%, ${(1 - o) * -18}px)` }}
    >
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="size-3.5" />
      </span>
      Summary copied to clipboard
    </div>
  );
}
