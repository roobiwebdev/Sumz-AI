"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

type Tick = (now: number) => void;
const ticks = new Set<Tick>();
let frame = 0;

function run(now: number) {
  for (const tick of ticks) tick(now);
  frame = ticks.size ? requestAnimationFrame(run) : 0;
}

/**
 * SOURCE OF TRUTH KEYWORDS: onFrame, requestAnimationFrame, shared rAF loop, whileVisible, useLoop, visibility clock, reduced motion
 * WHAT:  One requestAnimationFrame loop for the whole page, plus clocks that only tick while on screen.
 * WHY:   The hero film and every feature card share a single loop, and nothing animates off screen
 *        or in a hidden tab.
 * WHERE: src/components/landing/film/use-player.ts, src/components/landing/cards/*.
 */
export function onFrame(tick: Tick) {
  ticks.add(tick);
  frame ||= requestAnimationFrame(run);
  return () => {
    ticks.delete(tick);
  };
}

/** Calls `tick` with the milliseconds since the last frame (at most 100) while `node` is visible. */
export function whileVisible(node: Element, tick: (dt: number) => void, threshold = 0.35) {
  let intersecting = false;
  let stop: (() => void) | undefined;
  const update = () => {
    stop?.();
    stop = undefined;
    if (!intersecting || document.hidden) return;
    let last = performance.now();
    stop = onFrame((now) => {
      tick(Math.min(100, now - last));
      last = now;
    });
  };
  const observer = new IntersectionObserver(
    (entries) => {
      intersecting = entries.some((e) => e.isIntersecting);
      update();
    },
    { threshold },
  );
  observer.observe(node);
  document.addEventListener("visibilitychange", update);
  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", update);
    stop?.();
  };
}

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether the visitor asked for less motion. The server snapshot is `true`, so first paint is the still frame. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => true,
  );
}

/**
 * A looping clock in milliseconds that runs only while `ref` is visible. It starts on `settled`
 * (a frame that shows everything) and stays there with reduced motion.
 */
export function useLoop(ref: RefObject<HTMLElement | null>, duration: number, settled: number) {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(settled);
  const elapsed = useRef(settled);
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    return whileVisible(node, (dt) => {
      elapsed.current = (elapsed.current + dt) % duration;
      setT(elapsed.current);
    });
  }, [ref, duration, reduced]);
  return reduced ? settled : t;
}
