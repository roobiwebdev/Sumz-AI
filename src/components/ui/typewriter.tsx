"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * SOURCE OF TRUTH KEYWORDS: Typewriter, typing animation, useTypewriter, summary reveal
 * WHAT:  Reveals text character by character (the Sumz signature effect).
 * WHY:   Typing out fresh summaries; respects reduced motion.
 * WHERE: src/components/app/summarizer.tsx.
 */
export function useTypewriter(text: string, { speed = 12, enabled = true }: { speed?: number; enabled?: boolean } = {}) {
  // Reduced motion is read only inside effects so server and client render the same first frame.
  const reduced = useReducedMotion();
  const instant = !enabled;
  const [count, setCount] = useState(instant ? text.length : 0);
  const [prevText, setPrevText] = useState(text);

  if (prevText !== text) {
    setPrevText(text);
    setCount(instant ? text.length : 0);
  }

  useEffect(() => {
    if (instant || count >= text.length) return;
    const step = reduced ? text.length : Math.max(1, Math.round(text.length / 400));
    const id = window.setTimeout(() => setCount((c) => Math.min(text.length, c + step)), reduced ? 0 : speed);
    return () => window.clearTimeout(id);
  }, [count, instant, reduced, speed, text.length]);

  return { visible: text.slice(0, count), done: count >= text.length };
}

export function Typewriter({ text, speed, className }: { text: string; speed?: number; className?: string }) {
  const { visible, done } = useTypewriter(text, { speed });
  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {visible}
        {done ? null : <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-brand" />}
      </span>
    </p>
  );
}
