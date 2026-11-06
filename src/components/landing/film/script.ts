import { along, clamp, easeOut, span, type Keyframe } from "./ease";
import type { Sound } from "./sound";

/**
 * SOURCE OF TRUTH KEYWORDS: film script, timeline, STAGE, DURATION, SETTLED, CHAPTERS, CAPTIONS, CUES, cursorAt, cameraAt
 * WHAT:  Every beat of the hero film: stage layout, timestamps, cursor path, chapters, captions and sounds.
 * WHY:   The scene is a pure function of `t`; keeping all timing here makes seeking, looping and reduced
 *        motion correct by construction, and lets the cursor land exactly on the controls it clicks.
 * WHERE: src/components/landing/film/scene.tsx, showcase.tsx, use-player.ts and mock/*.
 */

/** The film is laid out at this size, then scaled to fit its frame. */
export const STAGE = { w: 1200, h: 760 } as const;

export const DURATION = 29_500;
/** With reduced motion the film holds here: the summary card with all three sentences. */
export const SETTLED = 18_900;

/* ---------- Layout (stage coordinates) ---------- */

export const MENUBAR_H = 30;
export const WINDOW = { x: 90, y: 54, w: 1020, h: 660 } as const;
export const TABS_H = 42;
export const URLBAR_H = 46;
export const CONTENT = { x: WINDOW.x, y: WINDOW.y + TABS_H + URLBAR_H, w: WINDOW.w, h: WINDOW.h - TABS_H - URLBAR_H } as const;

/** Browser tabs, in window coordinates. */
export const TAB_A = { x: 84, w: 250 } as const;
export const TAB_B = { x: 338, w: 196 } as const;

/** The Sumz app column, in content coordinates. */
export const APP = { x: 180, w: 660, header: 58, inputY: 188, inputH: 56, meterY: 258, cardY: 290, cardH: 296, historyY: 618 } as const;
/** How far the app scrolls in chapter 6 to bring history into view. */
export const HISTORY_SCROLL = 318;

const URL_TEXT = { x: WINDOW.x + 300, y: WINDOW.y + TABS_H + URLBAR_H / 2 };
const SUMZ_TAB = { x: WINDOW.x + TAB_B.x + TAB_B.w / 2 - 20, y: WINDOW.y + TABS_H / 2 + 2 };
const INPUT = { x: CONTENT.x + APP.x + 230, y: CONTENT.y + APP.inputY + APP.inputH / 2 };
const SUBMIT = { x: CONTENT.x + APP.x + APP.w - 30, y: INPUT.y };
const COPY = { x: CONTENT.x + APP.x + APP.w - 42, y: CONTENT.y + APP.cardY + 44 };
const HOME = { x: 640, y: 420 };
const REST = { x: 1010, y: 600 };

/* ---------- Timing ---------- */

export const T = {
  articleScroll: [500, 1900],
  urlClick: 2300,
  urlSelect: [2340, 2520],
  keysCopy: { show: [2650, 3750], at: [2800, 2960] },
  badge: [3150, 3950],
  tabClick: 4500,
  tabSwitch: [4500, 4850],
  inputClick: 5650,
  keysPaste: { show: [5900, 6900], at: [6050, 6210] },
  paste: 6260,
  submit: 7650,
  fetching: [7700, 9200],
  clutter: [9300, 9900, 10_500, 11_100, 11_700],
  reading: [11_900, 13_000],
  absorb: [12_500, 13_300],
  card: [13_400, 13_950],
  sentences: [
    [14_100, 15_400],
    [15_500, 16_900],
    [17_000, 18_300],
  ],
  chip: [18_450, 18_900],
  copyClick: 20_450,
  toast: [20_550, 22_700],
  appScroll: [23_450, 24_250],
  newItem: [24_450, 25_000],
  meter: 24_800,
  loopBack: [28_600, 29_500],
} as const;

/** Clutter on the article that the reader strips, in the order it disappears. */
export const CLUTTER = ["Menu", "Cookie banner", "Ad", "Sidebar", "Newsletter pop-up"] as const;

export const ARTICLE_WORDS = 4212;
export const USAGE = { limit: 25, before: 22 } as const;

export const CLICKS = [T.urlClick, T.tabClick, T.inputClick, T.submit, T.copyClick] as const;

/* ---------- Cursor ---------- */

const CURSOR: Keyframe[] = [
  { t: 0, ...HOME },
  { t: 600, ...HOME },
  { t: 1900, x: 560, y: 360 },
  { t: 2150, ...URL_TEXT },
  { t: 2500, ...URL_TEXT },
  { t: 3500, x: URL_TEXT.x + 60, y: URL_TEXT.y + 70 },
  { t: 4250, ...SUMZ_TAB },
  { t: 4650, ...SUMZ_TAB },
  { t: 5450, ...INPUT },
  { t: 5850, ...INPUT },
  { t: 6900, x: INPUT.x + 30, y: INPUT.y + 36 },
  { t: 7400, ...SUBMIT },
  { t: 7800, ...SUBMIT },
  { t: 8700, ...REST },
  { t: 19_700, ...REST },
  { t: 20_250, ...COPY },
  { t: 20_700, ...COPY },
  { t: 21_700, ...REST },
  { t: T.loopBack[0], ...REST },
  { t: DURATION, ...HOME },
];

export const cursorAt = (t: number) => along(CURSOR, t);

export type CursorKind = "arrow" | "pointer" | "text";

export function cursorKind(t: number): CursorKind {
  if ((t >= 2080 && t < 2600) || (t >= 5400 && t < 5950)) return "text";
  if ((t >= 4200 && t < 4750) || (t >= 7350 && t < 7900) || (t >= 20_200 && t < 20_800)) return "pointer";
  return "arrow";
}

/** 0..1 while the cursor is pressed (it shrinks slightly). */
export const pressAt = (t: number) => (CLICKS.some((c) => t >= c && t < c + 150) ? 1 : 0);

/* ---------- Camera (small screens zoom in on the focal point) ---------- */

const CAMERA: Keyframe[] = [
  { t: 0, x: 600, y: 330 },
  { t: 1700, x: 600, y: 330 },
  { t: 2200, x: 470, y: 230 },
  { t: 3700, x: 470, y: 230 },
  { t: 4300, x: 540, y: 250 },
  { t: 5300, x: 600, y: 330 },
  { t: 7800, x: 640, y: 350 },
  { t: 9000, x: 600, y: 470 },
  { t: 19_600, x: 600, y: 470 },
  { t: 20_200, x: 680, y: 440 },
  { t: 22_800, x: 680, y: 440 },
  { t: 23_500, x: 600, y: 450 },
  { t: T.loopBack[0], x: 600, y: 450 },
  { t: DURATION, x: 600, y: 330 },
];

export const cameraAt = (t: number) => along(CAMERA, t);

/* ---------- Derived state ---------- */

export type Phase = "idle" | "fetching" | "cleaning" | "reading" | "done";

export function phase(t: number): Phase {
  if (t < T.submit) return "idle";
  if (t < T.clutter[0]) return "fetching";
  if (t < T.reading[0]) return "cleaning";
  if (t < T.card[0]) return "reading";
  return "done";
}

export const wordsRead = (t: number) => Math.round(ARTICLE_WORDS * easeOut(span(t, T.reading[0], T.reading[1])));

export const usageLeft = (t: number) => USAGE.before - (t >= T.meter ? 1 : 0);

/** Which tab shows: 0 = article, 1 = Sumz. Blends during the switch and the loop back. */
export const sumzTab = (t: number) => clamp(span(t, T.tabSwitch[0], T.tabSwitch[1]) - span(t, T.loopBack[0], T.loopBack[1]));

/* ---------- Chapters and captions ---------- */

export const CHAPTERS = [
  { label: "Find a long read", t: 0 },
  { label: "Paste it in", t: 4200 },
  { label: "Reads only the article", t: 9000 },
  { label: "Three sentences", t: 13_400 },
  { label: "Copy & share", t: 19_600 },
  { label: "Your library", t: 23_400 },
] as const;

export type Caption = { start: number; end: number; words: { text: string; at: number }[] };

/** Spreads the words across [start, end], giving longer words more time. */
function caption(text: string, start: number, end: number): Caption {
  const parts = text.split(" ");
  const weights = parts.map((w) => w.length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  let at = start;
  const words = parts.map((w, i) => {
    const word = { text: w, at };
    at += ((end - start) * (weights[i] ?? 0)) / total;
    return word;
  });
  return { start, end, words };
}

export const CAPTIONS: Caption[] = [
  caption("Found a long article? Copy its link.", 500, 3400),
  caption("Paste it into Sumz and press enter.", 4900, 7900),
  caption("Sumz drops the ads and menus, then reads.", 9300, 12_400),
  caption("The whole article, in three sentences.", 14_000, 17_400),
  caption("Copy it straight into your notes.", 19_900, 22_300),
  caption("Every summary is saved to your account.", 23_900, 27_200),
];

/* ---------- Sound cues ---------- */

export type Cue = { t: number; sound: Sound; variant?: number };
const cue = (t: number, sound: Sound, variant?: number): Cue => ({ t, sound, variant });

/** Soft key ticks while a sentence types out. */
const typing = T.sentences.flatMap(([a, b], s) =>
  Array.from({ length: Math.floor((b - a) / 140) }, (_, i) => cue(a + i * 140, "type", i + s)),
);

export const CUES: Cue[] = [
  ...CLICKS.map((t) => cue(t, "switch")),
  cue(T.urlSelect[0] + 40, "tick"),
  ...T.keysCopy.at.map((t, i) => cue(t, "key", i)),
  cue(T.badge[0], "pop"),
  cue(T.tabSwitch[0] + 60, "sweep"),
  ...T.keysPaste.at.map((t, i) => cue(t, "key", i + 2)),
  cue(T.paste, "pop"),
  cue(T.submit + 40, "start"),
  ...T.clutter.map((t, i) => cue(t, "whoosh", i)),
  cue(T.reading[0], "sweep"),
  cue(T.card[0], "pop"),
  ...typing,
  cue(T.chip[0], "chime"),
  cue(T.toast[0], "chime", 2),
  cue(T.appScroll[0], "whoosh", 3),
  cue(T.newItem[0], "pop", 1),
  cue(T.meter, "tick"),
  cue(T.loopBack[0], "sweep", 2),
].toSorted((a, b) => a.t - b.t);
