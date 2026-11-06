"use client";

import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { envelope, span } from "./ease";
import { Scene } from "./scene";
import { CAPTIONS, CHAPTERS, DURATION, STAGE } from "./script";
import { usePlayer } from "./use-player";

const NARRATION =
  "A 30-second film of Sumz AI: copying a long article's link, pasting it into Sumz, Sumz stripping the page's ads and menus and reading it, a three-sentence summary appearing, copying it, and the summary saved at the top of the history.";

function useFit(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState<number>(STAGE.w);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  // Phones zoom the camera in on the focal point so the UI stays readable.
  const zoom = width < 520 ? 1.75 : width < 820 ? 1.3 : 1;
  return { scale: width / STAGE.w, zoom };
}

function Caption({ t, className }: { t: number; className?: string }) {
  const current = CAPTIONS.find((c) => t >= c.start - 400 && t < c.end + 900);
  const o = current ? envelope(t, current.start - 400, current.start, current.end + 400, current.end + 900) : 0;
  return (
    <p aria-hidden className={cn("pointer-events-none", className)} style={{ opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
      {current?.words.map((w, i) => (
        <span key={`${w.text}-${i}`} className="transition-none" style={{ opacity: t >= w.at ? 1 : 0.32 }}>
          {w.text}{" "}
        </span>
      ))}
    </p>
  );
}

/**
 * SOURCE OF TRUTH KEYWORDS: FilmShowcase, hero film, product film, chapter bar, play with sound, film controls
 * WHAT:  The hero's product film: the scaled stage, captions, "Play with sound", and the controls with a
 *        chapter bar that seeks.
 * WHY:   A code-drawn film stays crisp at any size, ships no video, and only runs while it's on screen.
 * WHERE: src/components/landing/hero.tsx (loaded after the hero text via next/dynamic).
 */
export default function FilmShowcase() {
  const frameRef = useRef<HTMLDivElement>(null);
  const player = usePlayer(frameRef);
  const { scale, zoom } = useFit(frameRef);
  const t = player.time;
  const [askedForSound, setAskedForSound] = useState(false);

  const chapterIndex = CHAPTERS.findLastIndex((c) => t >= c.t);

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="pointer-events-none absolute -inset-x-6 -top-10 bottom-10 -z-10 bg-aurora opacity-25" />

      <div className="relative">
        <div
          ref={frameRef}
          role="img"
          aria-label={NARRATION}
          className="relative w-full overflow-hidden rounded-2xl bg-background shadow-[0_50px_120px_-30px_rgb(0_0_0/0.9)] ring-1 ring-border-strong"
          style={{ aspectRatio: `${STAGE.w} / ${STAGE.h}` }}
        >
          <div
            className="absolute top-0 left-0"
            style={{ width: STAGE.w, height: STAGE.h, transform: `scale(${scale})`, transformOrigin: "0 0" }}
          >
            <Scene t={t} zoom={zoom} />
          </div>

          <Caption
            t={t}
            className="glass absolute bottom-5 left-1/2 hidden -translate-x-1/2 rounded-full px-5 py-2.5 text-center font-display text-lg font-semibold whitespace-nowrap sm:block"
          />
        </div>

        {!askedForSound ? (
          <button
            type="button"
            onClick={() => {
              setAskedForSound(true);
              player.playWithSound();
            }}
            className="glass absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 text-[11px] font-semibold text-foreground transition-transform hover:scale-105 sm:top-12 sm:right-5 sm:gap-2 sm:py-2 sm:pr-3.5 sm:pl-2 sm:text-sm"
          >
            <span className="relative inline-flex size-4 items-center justify-center rounded-full bg-brand-gradient text-background sm:size-5">
              <Play className="size-2.5 fill-current sm:size-3" />
            </span>
            Play with sound
          </button>
        ) : null}
      </div>

      <Caption t={t} className="mt-3 min-h-[3rem] px-2 text-center font-display text-base font-semibold text-balance sm:hidden" />

      <div className="mt-3 flex items-center gap-2 sm:mt-4">
        <button
          type="button"
          onClick={player.toggle}
          aria-label={player.paused ? "Play the film" : "Pause the film"}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-border-strong"
        >
          {player.paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
        </button>
        <button
          type="button"
          onClick={player.replay}
          aria-label="Replay the film"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          <RotateCcw className="size-4" />
        </button>

        <div className="flex min-w-0 flex-1 gap-1.5">
          {CHAPTERS.map((c, i) => {
            const end = CHAPTERS[i + 1]?.t ?? DURATION;
            const progress = span(t, c.t, end);
            const active = i === chapterIndex;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => player.seek(c.t + 1)}
                aria-label={`Chapter ${i + 1}: ${c.label}`}
                aria-current={active ? "step" : undefined}
                className="group min-w-0 text-left"
                style={{ flexGrow: end - c.t, flexBasis: 0 }}
              >
                <span className="block h-1 overflow-hidden rounded-full bg-surface-raised">
                  <span className="block h-full origin-left bg-brand-gradient" style={{ transform: `scaleX(${progress})` }} />
                </span>
                <span
                  className={cn(
                    "mt-1.5 hidden truncate text-xs transition-colors md:block",
                    active ? "text-foreground" : "text-subtle group-hover:text-muted",
                  )}
                >
                  <span className={active ? "text-brand" : undefined}>{i + 1}</span> {c.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={player.toggleSound}
          aria-pressed={player.sound}
          aria-label="Sound"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          {player.sound ? <Volume2 className="size-4 text-brand" /> : <VolumeX className="size-4" />}
          <span className="hidden sm:inline">Sound</span>
        </button>
      </div>
    </div>
  );
}
