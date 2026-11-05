"use client";

import { MotionConfig } from "motion/react";

// "user" respects the OS reduce-motion setting for every motion component, without
// components branching on it during render (which would break hydration).
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
