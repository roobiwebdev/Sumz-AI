"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * SOURCE OF TRUTH KEYWORDS: Reveal, scroll reveal, fade up, whileInView, entrance animation
 * WHAT:  Fades and lifts its children into place the first time they scroll into view.
 * WHERE: Every landing section.
 */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base text-pretty text-muted sm:text-lg">{description}</p> : null}
    </Reveal>
  );
}
