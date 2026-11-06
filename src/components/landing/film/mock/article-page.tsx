import { Clock } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { easeInOut, span } from "../ease";
import { CLUTTER, CONTENT, T } from "../script";

export const ARTICLE = {
  host: "longreads.example",
  path: "/night-trains-comeback",
  title: "The quiet comeback of night trains",
  kicker: "Travel · Long read",
  byline: "By Elena Duarte · Oct 28, 2026",
  minutes: 18,
} as const;

const PARAGRAPHS = [
  "At 9:47 p.m. the platform is almost empty. Then the sleeper pulls in, twelve carriages long, and within minutes every bunk is taken by people who decided that the slowest way across the continent might also be the best one.",
  "A decade ago most of these routes were gone. Operators had cut them as budget airlines took over, and the carriages that remained were tired. Now new companies are leasing modern cabins and selling out weeks ahead.",
  "Passengers describe the appeal in simple terms: dinner in one city, breakfast in another, and a full night of sleep instead of an airport queue.",
];

/** How far each clutter piece has peeled away (0 → 1), in the order of CLUTTER. */
export function peelAt(t: number) {
  return T.clutter.map((start) => easeInOut(span(t, start, start + 550)));
}

/** 0 → 1 while the reader has the piece in its sights, just before it peels. */
const spotAt = (t: number, i: number) => {
  const start = T.clutter[i] ?? 0;
  return span(t, start - 380, start - 120) * (1 - span(t, start, start + 200));
};

function Clutter({ t, i, style, children }: { t: number; i: number; style: CSSProperties; children: ReactNode }) {
  const peel = peelAt(t)[i] ?? 0;
  const spot = spotAt(t, i);
  if (peel >= 1) return null;
  return (
    <div
      className="absolute"
      style={{
        ...style,
        opacity: 1 - peel,
        transform: `translate(${peel * (i % 2 ? 60 : -60)}px, ${-peel * 40}px) rotate(${peel * (i % 2 ? 4 : -4)}deg) scale(${1 - peel * 0.08})`,
        filter: peel > 0 ? `blur(${peel * 6}px)` : undefined,
      }}
    >
      {children}
      {spot > 0 ? (
        <div className="absolute -inset-1.5 rounded-xl border-2 border-dashed border-brand-strong" style={{ opacity: spot }}>
          <span className="absolute -top-3 left-3 rounded-md bg-brand-strong px-2 py-0.5 text-[13px] font-bold text-foreground">
            {CLUTTER[i]}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * SOURCE OF TRUTH KEYWORDS: ArticlePage, film article, long read mock, clutter, peel, night trains
 * WHAT:  The made-up long read the film starts on, with the clutter Sumz strips away.
 * WHY:   Chapter 1 shows it full size (clutter in place); chapter 3 shows it in miniature with `clutterT`
 *        running, so each clutter piece peels off.
 * WHERE: src/components/landing/film/scene.tsx, mock/sumz-app.tsx.
 */
export function ArticlePage({
  t,
  clutterT = 0,
  scroll = 0,
  popup = 1,
}: {
  t: number;
  /** The clock for peeling clutter; 0 keeps every piece in place. */
  clutterT?: number;
  scroll?: number;
  popup?: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-foreground text-background" style={{ width: CONTENT.w, height: CONTENT.h }}>
      <div style={{ transform: `translateY(${-scroll}px)` }}>
        <div className="absolute top-[86px] left-[64px] w-[600px]">
          <p className="text-[13px] font-bold tracking-[0.18em] text-brand-strong uppercase">{ARTICLE.kicker}</p>
          <h1 className="mt-3 font-display text-[44px] leading-[1.05] font-black tracking-tight">{ARTICLE.title}</h1>
          <div className="mt-4 flex items-center gap-3 text-[15px] text-subtle">
            <span>{ARTICLE.byline}</span>
            <MinutesBadge t={t} />
          </div>
          <div className="mt-6 h-[150px] rounded-2xl bg-[linear-gradient(120deg,var(--color-accent),var(--color-accent-soft)_45%,var(--color-brand)_100%)] opacity-90" />
          <div className="mt-6 space-y-4 text-[17px] leading-[1.6] text-background/80">
            {PARAGRAPHS.map((p) => (
              <p key={p.slice(0, 12)}>{p}</p>
            ))}
          </div>
        </div>

        <Clutter t={clutterT} i={2} style={{ top: 92, left: 720, width: 250, height: 196 }}>
          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-[repeating-linear-gradient(135deg,var(--color-muted)_0_10px,var(--color-subtle)_10px_20px)] text-[13px] font-semibold tracking-widest text-foreground/90 uppercase opacity-60">
            Advertisement
          </div>
        </Clutter>

        <Clutter t={clutterT} i={3} style={{ top: 312, left: 720, width: 250 }}>
          <div className="rounded-xl border border-muted/40 p-4">
            <p className="text-[13px] font-bold tracking-widest text-subtle uppercase">Trending</p>
            {["The 4-day week, a year on", "Why cities are going quiet", "Inside a seed vault"].map((s, n) => (
              <p key={s} className="mt-3 flex gap-2 text-[15px] leading-snug font-semibold">
                <span className="text-brand-strong">{n + 1}</span>
                {s}
              </p>
            ))}
          </div>
        </Clutter>
      </div>

      <Clutter t={clutterT} i={0} style={{ top: 0, left: 0, width: CONTENT.w, height: 56 }}>
        <div className="flex h-full items-center gap-8 border-b border-muted/30 bg-foreground px-16">
          <span className="font-display text-[20px] font-black tracking-tight">LONGREADS</span>
          {["World", "Tech", "Travel", "Culture", "Ideas"].map((s) => (
            <span key={s} className="text-[15px] text-subtle">
              {s}
            </span>
          ))}
          <span className="ml-auto rounded-full bg-accent px-4 py-1.5 text-[14px] font-semibold text-foreground">Subscribe</span>
        </div>
      </Clutter>

      <Clutter t={clutterT} i={1} style={{ left: 24, right: 24, bottom: 20 }}>
        <div className="flex items-center gap-4 rounded-2xl bg-background px-5 py-4 text-foreground shadow-2xl">
          <p className="flex-1 text-[14px] text-muted">
            We use cookies to personalise ads and measure traffic. You can change this any time.
          </p>
          <span className="rounded-lg border border-border-strong px-3 py-1.5 text-[14px]">Settings</span>
          <span className="rounded-lg bg-foreground px-3 py-1.5 text-[14px] font-semibold text-background">Accept all</span>
        </div>
      </Clutter>

      {popup > 0 ? (
        <Clutter t={clutterT} i={4} style={{ top: 150, left: 400, width: 300, opacity: popup }}>
          <div
            className="rounded-2xl border border-muted/30 bg-foreground p-5 shadow-[0_30px_60px_-15px_rgb(0_0_0/0.45)]"
            style={{ opacity: popup, transform: `scale(${0.94 + popup * 0.06})` }}
          >
            <p className="font-display text-[19px] font-bold">Get the weekly read</p>
            <p className="mt-1 text-[14px] text-subtle">Our best long reads, every Sunday.</p>
            <div className="mt-4 h-10 rounded-lg border border-muted/50" />
            <div className="mt-2 flex h-10 items-center justify-center rounded-lg bg-background text-[14px] font-semibold text-foreground">
              Sign me up
            </div>
          </div>
        </Clutter>
      ) : null}
    </div>
  );
}

function MinutesBadge({ t }: { t: number }) {
  const pulse = Math.sin(span(t, T.badge[0], T.badge[1]) * Math.PI);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-2.5 py-1 font-semibold text-brand-strong"
      style={{
        transform: `scale(${1 + pulse * 0.12})`,
        boxShadow: `0 0 0 ${pulse * 6}px color-mix(in oklab, var(--color-brand) ${pulse * 30}%, transparent)`,
      }}
    >
      <Clock className="size-3.5" />
      {ARTICLE.minutes} min read
    </span>
  );
}
