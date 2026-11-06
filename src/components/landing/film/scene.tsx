import { BatteryFull, ChevronLeft, ChevronRight, Lock, RotateCw, Search, Wifi } from "lucide-react";
import { memo } from "react";
import { LogoMark } from "@/components/ui/logo";
import { clamp, easeInOut, span } from "./ease";
import { ARTICLE, ArticlePage } from "./mock/article-page";
import { Cursor } from "./mock/cursor";
import { Keycaps } from "./mock/keycaps";
import { SumzApp } from "./mock/sumz-app";
import {
  CONTENT,
  MENUBAR_H,
  STAGE,
  T,
  TABS_H,
  TAB_A,
  TAB_B,
  URLBAR_H,
  WINDOW,
  cameraAt,
  cursorAt,
  cursorKind,
  pressAt,
  sumzTab,
} from "./script";

const MenuBar = memo(function MenuBar() {
  return (
    <div
      className="absolute inset-x-0 top-0 flex items-center gap-5 bg-background/45 px-5 text-[13px] text-foreground/90 backdrop-blur-md"
      style={{ height: MENUBAR_H }}
    >
      <span className="size-3.5 rounded-full bg-brand-gradient" />
      <span className="font-semibold">Browser</span>
      {["File", "Edit", "View", "History", "Window"].map((m) => (
        <span key={m} className="text-foreground/70">
          {m}
        </span>
      ))}
      <span className="ml-auto inline-flex items-center gap-4 text-foreground/80">
        <Search className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryFull className="size-4" />
        <span>Thu Nov 6&nbsp;&nbsp;9:41 AM</span>
      </span>
    </div>
  );
});

function Tab({ x, w, active, icon, label }: { x: number; w: number; active: number; icon: React.ReactNode; label: string }) {
  return (
    <div
      className="absolute bottom-0 flex h-[34px] items-center gap-2 rounded-t-xl px-3 text-[13px]"
      style={{
        left: x,
        width: w,
        backgroundColor: `color-mix(in oklab, var(--color-surface-raised) ${active * 100}%, transparent)`,
        color: active > 0.5 ? "var(--color-foreground)" : "var(--color-subtle)",
      }}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </div>
  );
}

function Browser({ t }: { t: number }) {
  const sumz = sumzTab(t);
  const select = easeInOut(span(t, T.urlSelect[0], T.urlSelect[1])) * (1 - span(t, T.tabSwitch[0], T.tabSwitch[0] + 120));
  const scroll = 120 * easeInOut(span(t, T.articleScroll[0], T.articleScroll[1]));
  const popup = clamp(span(t, 1100, 1500)) * (1 - span(t, T.loopBack[0], T.loopBack[0] + 1));

  return (
    <div
      className="absolute overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-[0_40px_120px_-20px_rgb(0_0_0/0.85)]"
      style={{ left: WINDOW.x, top: WINDOW.y, width: WINDOW.w, height: WINDOW.h }}
    >
      <div className="relative bg-surface" style={{ height: TABS_H }}>
        <div className="absolute top-[15px] left-4 flex gap-2">
          <span className="size-3 rounded-full bg-danger" />
          <span className="size-3 rounded-full bg-brand-soft" />
          <span className="size-3 rounded-full bg-success" />
        </div>
        <Tab
          x={TAB_A.x}
          w={TAB_A.w}
          active={1 - sumz}
          label={ARTICLE.title}
          icon={
            <span className="inline-flex size-4 shrink-0 items-center justify-center rounded bg-foreground text-[10px] font-black text-background">
              L
            </span>
          }
        />
        <Tab x={TAB_B.x} w={TAB_B.w} active={sumz} label="Sumz AI" icon={<LogoMark className="size-4 rounded-[5px] [&_svg]:size-2.5" />} />
      </div>

      <div className="flex items-center gap-3 border-b border-border bg-surface-raised px-4" style={{ height: URLBAR_H }}>
        <ChevronLeft className="size-4 text-muted" />
        <ChevronRight className="size-4 text-subtle" />
        <RotateCw className="size-3.5 text-muted" />
        <div className="relative flex h-8 flex-1 items-center gap-2 rounded-full bg-background px-4 text-[14px]">
          <Lock className="size-3.5 text-subtle" />
          <span className="relative h-5 flex-1">
            <span className="absolute inset-0 flex items-center" style={{ opacity: 1 - sumz }}>
              <span className="relative">
                <span
                  className="absolute -inset-x-1 -inset-y-0.5 origin-left rounded bg-accent/60"
                  style={{ transform: `scaleX(${select})` }}
                />
                <span className="relative">
                  <span className="text-foreground">{ARTICLE.host}</span>
                  <span className="text-subtle">{ARTICLE.path}</span>
                </span>
              </span>
            </span>
            <span className="absolute inset-0 flex items-center" style={{ opacity: sumz }}>
              <span className="text-foreground">sumz.roobi.dev</span>
              <span className="text-subtle">/app</span>
            </span>
          </span>
        </div>
      </div>

      <div className="absolute" style={{ left: 0, top: TABS_H + URLBAR_H, width: CONTENT.w, height: CONTENT.h }}>
        {sumz < 1 ? (
          <div className="absolute inset-0" style={{ opacity: 1 - sumz }}>
            <ArticlePage t={t} scroll={t > T.loopBack[0] ? 0 : scroll} popup={popup} />
          </div>
        ) : null}
        {sumz > 0 ? (
          <div className="absolute inset-0" style={{ opacity: sumz }}>
            <SumzApp t={t} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * SOURCE OF TRUTH KEYWORDS: Scene, film scene, hero film frame, desktop, browser mock, camera zoom
 * WHAT:  The whole film frame drawn from `t` alone: wallpaper, menu bar, browser with the article and
 *        the Sumz app, key caps and the cursor.
 * WHY:   A pure function of time, so seeking, looping and the reduced-motion still frame are exact.
 *        `zoom` > 1 follows the focal point so the film stays readable on phones.
 * WHERE: src/components/landing/film/showcase.tsx.
 */
export function Scene({ t, zoom }: { t: number; zoom: number }) {
  const cursor = cursorAt(t);
  const focus = cameraAt(t);
  const tx = clamp(STAGE.w / 2 - focus.x * zoom, STAGE.w - STAGE.w * zoom, 0);
  const ty = clamp(STAGE.h / 2 - focus.y * zoom, STAGE.h - STAGE.h * zoom, 0);

  return (
    <div className="absolute top-0 left-0 overflow-hidden bg-film-wallpaper" style={{ width: STAGE.w, height: STAGE.h }}>
      <div
        className="absolute top-0 left-0"
        style={{ width: STAGE.w, height: STAGE.h, transform: `translate(${tx}px, ${ty}px) scale(${zoom})`, transformOrigin: "0 0" }}
      >
        <MenuBar />
        <Browser t={t} />
        <Cursor x={cursor.x} y={cursor.y} kind={cursorKind(t)} pressed={pressAt(t)} />
      </div>
      {/* Outside the camera, so the shortcut stays on screen when phones zoom in */}
      <Keycaps t={t} keys={["⌘", "C"]} show={T.keysCopy.show} at={T.keysCopy.at} zoom={zoom} />
      <Keycaps t={t} keys={["⌘", "V"]} show={T.keysPaste.show} at={T.keysPaste.at} zoom={zoom} />
    </div>
  );
}
