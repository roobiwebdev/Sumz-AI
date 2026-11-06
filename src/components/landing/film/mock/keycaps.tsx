import { clamp, envelope, span } from "../ease";

/**
 * SOURCE OF TRUTH KEYWORDS: Keycaps, keystroke overlay, shortcut, key press, film keys
 * WHAT:  Glass key caps that press down in sequence when a shortcut matters in the film.
 * WHERE: src/components/landing/film/scene.tsx.
 */
export function Keycaps({
  t,
  keys,
  show,
  at,
  zoom = 1,
}: {
  t: number;
  keys: readonly string[];
  show: readonly [number, number];
  at: readonly number[];
  /** Grows with the camera zoom so the caps stay legible on phones. */
  zoom?: number;
}) {
  const opacity = envelope(t, show[0], show[0] + 220, show[1] - 260, show[1]);
  if (opacity <= 0) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 z-40 flex gap-3"
      style={{ bottom: 120, opacity, transform: `translate(-50%, ${(1 - opacity) * 14}px) scale(${zoom})`, transformOrigin: "50% 100%" }}
    >
      {keys.map((k, i) => {
        const pressAt = at[i] ?? show[0];
        const down = t >= pressAt ? 1 - clamp(span(t, pressAt + 90, pressAt + 220)) * 0.55 : 0;
        const lit = t >= pressAt;
        return (
          <span
            key={k}
            className="glass inline-flex h-[68px] min-w-[68px] items-center justify-center rounded-2xl px-5 font-display text-[30px] font-bold"
            style={{
              transform: `translateY(${down * 5}px)`,
              background: "color-mix(in oklab, var(--color-background) 84%, transparent)",
              color: lit ? "var(--color-brand)" : "var(--color-foreground)",
              boxShadow: lit
                ? "0 0 0 1px color-mix(in oklab, var(--color-brand) 50%, transparent), 0 10px 30px -8px color-mix(in oklab, var(--color-brand) 55%, transparent)"
                : undefined,
            }}
          >
            {k}
          </span>
        );
      })}
    </div>
  );
}
