"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion, whileVisible } from "./frame";
import { CUES, DURATION, SETTLED } from "./script";
import { play, unlock } from "./sound";

/**
 * SOURCE OF TRUTH KEYWORDS: usePlayer, film player, film clock, play pause seek, sound toggle, reduced motion still frame
 * WHAT:  The film's clock: plays silently on a loop while on screen, or once with sound on request.
 * WHY:   One `t` drives the whole scene. With reduced motion it holds SETTLED until the visitor
 *        presses play themselves.
 * WHERE: src/components/landing/film/showcase.tsx.
 */
export function usePlayer(ref: RefObject<HTMLElement | null>) {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [sound, setSound] = useState(false);
  const [touched, setTouched] = useState(false);
  const tRef = useRef(0);
  const soundRef = useRef(false);

  const moving = !reduced || touched;
  const paused = !playing || !moving;

  const set = useCallback((next: number) => {
    tRef.current = next;
    setT(next);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || paused) return;
    return whileVisible(node, (dt) => {
      const from = tRef.current;
      const to = from + dt;
      if (soundRef.current) {
        for (const c of CUES) if (c.t > from && c.t <= to) play(c.sound, c.variant);
      }
      if (to < DURATION) set(to);
      else if (soundRef.current) {
        // A sound play runs once, then rests on the last frame.
        set(DURATION);
        soundRef.current = false;
        setSound(false);
        setPlaying(false);
      } else set(0);
    });
  }, [ref, paused, set]);

  const start = useCallback(
    (from: number) => {
      setTouched(true);
      set(from);
      setPlaying(true);
    },
    [set],
  );

  return {
    time: moving ? t : SETTLED,
    paused,
    sound,
    playWithSound() {
      unlock();
      soundRef.current = true;
      setSound(true);
      start(0);
    },
    toggle() {
      if (paused) start(tRef.current >= DURATION ? 0 : tRef.current);
      else setPlaying(false);
    },
    replay() {
      start(0);
    },
    toggleSound() {
      if (!soundRef.current) unlock();
      soundRef.current = !soundRef.current;
      setSound(soundRef.current);
    },
    seek(to: number) {
      setTouched(true);
      set(to);
    },
  };
}
