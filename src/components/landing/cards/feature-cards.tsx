"use client";

import { Check, Languages, Link2, Lock, Mail, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { clamp, easeInOut, easeOutBack, envelope, span, typed } from "@/components/landing/film/ease";
import { useLoop } from "@/components/landing/film/frame";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/cn";

function Shell({
  eyebrow,
  title,
  body,
  icon,
  className,
  scene,
}: {
  eyebrow: string;
  title: string;
  body: string;
  icon: ReactNode;
  className?: string;
  scene: ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-colors hover:border-border-strong",
        className,
      )}
    >
      {scene}
      <div className="relative mt-auto p-6 sm:p-7">
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-brand uppercase">
          {icon}
          {eyebrow}
        </p>
        <h3 className="mt-2.5 font-display text-2xl font-bold tracking-tight text-balance">{title}</h3>
        <p className="mt-2 text-muted">{body}</p>
      </div>
    </div>
  );
}

/** The animated area at the top of each card; owns the card's visibility-gated clock. */
function Stage({ duration, settled, children }: { duration: number; settled: number; children: (t: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useLoop(ref, duration, settled);
  return (
    <div ref={ref} aria-hidden className="relative h-60 overflow-hidden border-b border-border bg-background/70">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 bg-aurora opacity-15" />
      {children(t)}
    </div>
  );
}

/* ---------- 1. Reads only the article ---------- */

const PIECES = [
  { label: "Ad", at: 900, className: "top-6 right-6 h-24 w-28" },
  { label: "Pop-up", at: 1700, className: "top-16 left-1/2 h-20 w-36 -translate-x-1/2" },
  { label: "Cookie banner", at: 2500, className: "bottom-5 inset-x-6 h-9" },
] as const;

function CleanScene({ t }: { t: number }) {
  const back = span(t, 4600, 5200);
  const glow = envelope(t, 3200, 3600, 4300, 4700);
  return (
    <div className="absolute inset-x-8 top-6 bottom-0 rounded-t-2xl border border-b-0 border-border-strong bg-surface-raised p-5">
      <div className="h-3 w-24 rounded-full bg-border-strong" />
      <div className="mt-3 h-5 w-3/4 rounded-md bg-foreground/80" />
      <div
        className="mt-4 space-y-2"
        style={{ filter: `drop-shadow(0 0 ${glow * 10}px color-mix(in oklab, var(--color-brand) 60%, transparent))` }}
      >
        {[100, 92, 96, 70, 88].map((w, i) => (
          <div
            key={w + i}
            className="h-2 rounded-full"
            style={{
              width: `${w}%`,
              background: glow > 0.05 ? "var(--color-brand)" : "var(--color-border-strong)",
              opacity: 0.55 + glow * 0.45,
            }}
          />
        ))}
      </div>
      {PIECES.map((p, i) => {
        const peel = easeInOut(span(t, p.at, p.at + 500)) * (1 - back);
        const spot = span(t, p.at - 350, p.at - 100) * (1 - span(t, p.at, p.at + 150));
        return (
          <div
            key={p.label}
            className={cn(
              "absolute flex items-center justify-center rounded-lg border border-border-strong bg-[repeating-linear-gradient(135deg,var(--color-surface)_0_8px,var(--color-border)_8px_16px)] text-[11px] font-semibold text-muted",
              p.className,
            )}
            style={{
              opacity: 1 - peel,
              transform: `translate(${peel * (i % 2 ? 40 : -40)}px, ${-peel * 30}px) rotate(${peel * (i % 2 ? 6 : -6)}deg)`,
              filter: peel > 0 ? `blur(${peel * 4}px)` : undefined,
            }}
          >
            {p.label}
            {spot > 0 ? (
              <span className="absolute -inset-1 rounded-xl border-2 border-dashed border-brand-strong" style={{ opacity: spot }} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- 2. Any language ---------- */

const LANGS = [
  {
    code: "EN",
    title: "Why sleep shapes what you remember",
    text: "Deep sleep replays the day's memories, which is why a full night helps you keep what you learned.",
  },
  {
    code: "ES",
    title: "Cómo las ciudades plantan bosques en sus azoteas",
    text: "Las azoteas verdes enfrían los edificios y dan refugio a aves e insectos en pleno centro.",
  },
  {
    code: "FR",
    title: "Le retour discret des trains de nuit",
    text: "Les trains de nuit reviennent en Europe, portés par des voyageurs qui préfèrent dormir que prendre l'avion.",
  },
] as const;
const LANG_MS = 3200;

function LanguageScene({ t }: { t: number }) {
  const i = Math.floor(t / LANG_MS) % LANGS.length;
  const local = t % LANG_MS;
  const lang = LANGS[i] ?? LANGS[0];
  const o = envelope(local, 0, 300, LANG_MS - 350, LANG_MS);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
      <div className="mb-4 flex gap-1.5">
        {LANGS.map((l, n) => (
          <span
            key={l.code}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider",
              n === i ? "border-brand/60 bg-brand/15 text-brand" : "border-border text-subtle",
            )}
          >
            {l.code}
          </span>
        ))}
      </div>
      <div className="glass w-full max-w-sm rounded-2xl p-4" style={{ opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
        <p className="truncate font-display text-[15px] font-bold">{lang.title}</p>
        <p className="mt-1.5 min-h-[3.75rem] text-[13px] leading-relaxed text-muted">
          {typed(lang.text, span(local, 450, 2300))}
          {local > 450 && local < 2300 ? <span className="ml-px inline-block h-3 w-[2px] translate-y-0.5 bg-brand" /> : null}
        </p>
      </div>
    </div>
  );
}

/* ---------- 3. Daily allowance ---------- */

const LIMIT = 25;
const USES = [700, 1300, 1900, 2500];

function AllowanceScene({ t }: { t: number }) {
  const reset = span(t, 4300, 5000);
  const used = reset > 0 ? Math.round(USES.length * (1 - easeInOut(reset))) : USES.filter((u) => t >= u).length;
  const left = LIMIT - used;
  const bump = Math.max(...USES.map((u) => 1 - span(t, u, u + 300)).map((v, n) => (t >= (USES[n] ?? 0) ? v : 0)));
  const resetLabel = envelope(t, 3800, 4100, 5300, 5700);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
      <p className="font-display text-6xl font-black tabular-nums" style={{ transform: `scale(${1 + bump * 0.08})` }}>
        <span className="text-gradient-brand">{left}</span>
        <span className="text-2xl text-subtle"> / {LIMIT}</span>
      </p>
      <p className="mt-1 text-sm text-muted">summaries left today</p>
      <div className="mt-5 grid w-full max-w-xs grid-cols-[repeat(25,minmax(0,1fr))] gap-[3px]">
        {Array.from({ length: LIMIT }, (_, n) => {
          const spent = n >= LIMIT - used;
          return <span key={n} className={cn("h-5 rounded-[3px]", spent ? "bg-surface-raised" : "bg-brand-gradient")} />;
        })}
      </div>
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand" style={{ opacity: resetLabel }}>
        <RotateCcw className="size-3.5" style={{ transform: `rotate(${-reset * 360}deg)` }} />
        Resets at midnight UTC
      </p>
    </div>
  );
}

/* ---------- 4. Private by default ---------- */

const ROWS = ["Why sleep shapes what you remember", "Postgres at scale: ten years of lessons", "The quiet comeback of night trains"];

function PrivateScene({ t }: { t: number }) {
  const google = Math.floor(t / 3000) % 2 === 0;
  const swap = envelope(t % 3000, 0, 250, 2750, 3000);
  const remove = easeInOut(span(t, 3900, 4500));
  const restore = easeOutBack(span(t, 5400, 5900));
  const gone = remove * (1 - restore);
  const trashHot = envelope(t, 3500, 3700, 3900, 4100);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
          <ShieldCheck className="size-3.5" />
          Only you can see these
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
          style={{ opacity: 0.4 + swap * 0.6 }}
        >
          {google ? <span className="font-bold text-foreground">G</span> : <Mail className="size-3.5" />}
          {google ? "Google" : "Email"}
        </span>
      </div>
      <div className="w-full max-w-sm space-y-1.5">
        {ROWS.map((r, n) => {
          const last = n === ROWS.length - 1;
          return (
            <div
              key={r}
              className="flex h-10 items-center gap-2.5 rounded-xl border border-border bg-surface px-3 text-[13px]"
              style={last ? { opacity: 1 - gone, transform: `translateX(${gone * 60}px)` } : undefined}
            >
              <Link2 className="size-3.5 shrink-0 text-brand" />
              <span className="min-w-0 flex-1 truncate">{r}</span>
              <Lock className="size-3 shrink-0 text-subtle" />
              {last ? (
                <Trash2
                  className="size-3.5 shrink-0"
                  style={{
                    color: trashHot > 0.1 ? "var(--color-danger)" : "var(--color-subtle)",
                    transform: `scale(${1 + trashHot * 0.25})`,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="h-4 text-xs text-subtle" style={{ opacity: clamp(gone * 1.5) }}>
        <Check className="mr-1 inline size-3.5 text-success" />
        Deleted for good
      </p>
    </div>
  );
}

/**
 * SOURCE OF TRUTH KEYWORDS: FeatureCards, feature grid, looping feature cards, bento, any language, daily allowance, private
 * WHAT:  The landing page's feature grid: four cards, each a small looping scene of one feature.
 * WHY:   Each card shows the feature working instead of describing it. Clocks only run while the
 *        card is visible, start on a frame that shows everything, and hold it with reduced motion.
 * WHERE: src/components/landing/sections.tsx (Features).
 */
export function FeatureCards() {
  const cards = [
    {
      eyebrow: "Clean reading",
      title: "Only the article gets read",
      body: "Ads, pop-ups, menus and cookie banners are stripped before anything is summarized.",
      icon: <ShieldCheck className="size-3.5" />,
      scene: (
        <Stage duration={5600} settled={3400}>
          {(t) => <CleanScene t={t} />}
        </Stage>
      ),
    },
    {
      eyebrow: "Any language",
      title: "Summaries in the article's language",
      body: "Paste a Spanish or French article and the gist comes back in Spanish or French.",
      icon: <Languages className="size-3.5" />,
      scene: (
        <Stage duration={LANG_MS * LANGS.length} settled={LANG_MS + 2400}>
          {(t) => <LanguageScene t={t} />}
        </Stage>
      ),
    },
    {
      eyebrow: "Free every day",
      title: "25 summaries a day, on us",
      body: "Your allowance refills at midnight UTC. No card needed to start.",
      icon: <RotateCcw className="size-3.5" />,
      scene: (
        <Stage duration={6000} settled={2700}>
          {(t) => <AllowanceScene t={t} />}
        </Stage>
      ),
    },
    {
      eyebrow: "Private by default",
      title: "Your history is yours alone",
      body: "Sign in with Google or email. Only you see your summaries, and delete removes them for good.",
      icon: <Lock className="size-3.5" />,
      scene: (
        <Stage duration={6000} settled={1500}>
          {(t) => <PrivateScene t={t} />}
        </Stage>
      ),
    },
  ];

  return (
    <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
      {cards.map((c, i) => (
        <Reveal key={c.eyebrow} delay={(i % 2) * 0.1} className="min-w-0">
          <Shell eyebrow={c.eyebrow} title={c.title} body={c.body} icon={c.icon} scene={c.scene} />
        </Reveal>
      ))}
    </div>
  );
}
