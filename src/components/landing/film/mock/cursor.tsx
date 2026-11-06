import type { CursorKind } from "../script";

/**
 * SOURCE OF TRUTH KEYWORDS: Cursor, mouse pointer, I-beam, pointing hand, film cursor
 * WHAT:  The film's drawn mouse cursor: arrow, pointing hand or text I-beam, shrinking while pressed.
 * WHERE: src/components/landing/film/scene.tsx.
 */
export function Cursor({ x, y, kind, pressed }: { x: number; y: number; kind: CursorKind; pressed: number }) {
  const scale = 1 - pressed * 0.14;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-50"
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: "0 0",
        filter: "drop-shadow(0 3px 6px rgb(0 0 0 / 0.45))",
      }}
    >
      {kind === "text" ? (
        <svg width="18" height="28" viewBox="0 0 18 28" style={{ transform: "translate(-9px, -14px)" }}>
          <path d="M4 2h10M4 26h10M9 2v24" stroke="black" strokeWidth="5" strokeLinecap="round" />
          <path d="M4 2h10M4 26h10M9 2v24" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : kind === "pointer" ? (
        <svg width="30" height="32" viewBox="0 0 30 32" style={{ transform: "translate(-9px, -2px)" }}>
          <path
            d="M9 2.5a2.5 2.5 0 0 1 5 0V12l1-.3a2.4 2.4 0 0 1 3 1.4l.2.6.7-.2a2.4 2.4 0 0 1 3 1.5l.2.5a2.4 2.4 0 0 1 3.3 2l.6 5.7c.4 4-1.6 7.8-5.3 7.8h-6.2c-1.9 0-3.6-1-4.6-2.6L3.2 20a2.3 2.3 0 0 1 3.6-2.9L9 19.2z"
            fill="white"
            stroke="black"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M14 16v6M18 16.5v5.5M22 17.5v4.5" stroke="black" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="26" height="30" viewBox="0 0 26 30">
          <path d="M3 2v22.5l5.6-5.3 3.6 8.3 3.9-1.7-3.6-8.1H20z" fill="black" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}
