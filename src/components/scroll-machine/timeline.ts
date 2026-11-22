/**
 * timeline.ts — the choreography, as data.
 * ------------------------------------------------------------------
 * Everything you'd want to tweak while art-directing the hero lives here:
 * how scroll maps to frames, when each story phase shows, where each
 * callout points, and how the image fits on landscape vs portrait screens.
 *
 * Source footage notes (300 frames, 1280×720):
 *   ~1–35    assembled; cups barely lift
 *   ~35–100  side panels swing out, copper boiler emerges on the left
 *   ~100–160 portafilters drop, pump / heat-exchanger block opens right
 *   ~160–300 full teardown, only subtle drift
 */
import type { FitMode, Point } from "./geometry";
import { clamp } from "./geometry";

/**
 * Scroll progress (0–1) → normalised frame position (0–1).
 * A straight line would waste half the scroll on the slow tail of the
 * footage. These keyframes linger on the assembled machine, spread the
 * dramatic separation across the middle, then let the tail settle.
 */
export const FRAME_KEYS: ReadonlyArray<readonly [scroll: number, frame: number]> = [
  [0, 0],
  [0.16, 0.1], // hold: hero typography reads over the assembled machine
  [0.45, 0.335], // boiler fully out
  [0.72, 0.54], // portafilters dropped, right block open
  [1, 1], // settle into the full teardown
];

/** Piecewise-linear interpolation over FRAME_KEYS. */
export function frameProgressAt(scroll: number): number {
  const p = clamp(scroll, 0, 1);
  for (let i = 1; i < FRAME_KEYS.length; i++) {
    const [s1, f1] = FRAME_KEYS[i];
    if (p <= s1) {
      const [s0, f0] = FRAME_KEYS[i - 1];
      const t = (p - s0) / (s1 - s0 || 1);
      return f0 + (f1 - f0) * t;
    }
  }
  return 1;
}

/** Convert scroll progress to an integer index into an array of `count` frames. */
export function frameIndexAt(scroll: number, count: number): number {
  return Math.round(frameProgressAt(scroll) * (count - 1));
}

/**
 * How the frame is laid out per orientation. See computeFit():
 * `zoom` scales beyond plain cover/contain, `offsetY` lifts the machine
 * (fraction of viewport height) to leave room for the type underneath.
 */
export const FIT: Record<"landscape" | "portrait", { mode: FitMode; zoom: number; offsetY: number }> = {
  landscape: { mode: "cover", zoom: 0.88, offsetY: -0.065 },
  // Portrait crops the outermost side panels so the machine itself reads at phone size.
  portrait: { mode: "contain", zoom: 1.38, offsetY: -0.06 },
};

export type PhaseId = "hero" | "boiler" | "groups" | "pump";

/** Total frames in the source footage the anchor tracks were measured on. */
const SOURCE_FRAMES = 300;

/**
 * A part's position over time: [source frame number, x, y] keyframes in
 * source-image pixels. The callout dot follows the part as it flies out.
 */
export type AnchorTrack = ReadonlyArray<readonly [frame: number, x: number, y: number]>;

/** Interpolate an anchor track at a normalised frame position (0–1). */
export function anchorAt(track: AnchorTrack, frameProgress: number): Point {
  const f = frameProgress * (SOURCE_FRAMES - 1) + 1;
  if (f <= track[0][0]) return { x: track[0][1], y: track[0][2] };
  for (let i = 1; i < track.length; i++) {
    const [f1, x1, y1] = track[i];
    if (f <= f1) {
      const [f0, x0, y0] = track[i - 1];
      const t = (f - f0) / (f1 - f0);
      return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t };
    }
  }
  const last = track[track.length - 1];
  return { x: last[1], y: last[2] };
}

export interface CalloutPhase {
  id: Exclude<PhaseId, "hero">;
  /** Scroll window [enter, exit] in 0–1. */
  range: readonly [number, number];
  /** Where the leader line points, tracked across frames (source-image px). */
  track: AnchorTrack;
  /**
   * Where the leader line ends and the text block hangs from, as a fraction
   * of the viewport. The line runs: anchor → vertical to label.y → horizontal to label.x.
   */
  label: { x: number; y: number; align: "start" | "center" | "end" };
}

export const HERO_RANGE = [0, 0.2] as const;

export const CALLOUTS: readonly CalloutPhase[] = [
  {
    // Copper boiler, sliding out to the left of the chassis.
    id: "boiler",
    range: [0.25, 0.45],
    track: [
      [70, 392, 395],
      [85, 362, 395],
      [110, 322, 392],
      [150, 300, 392],
      [300, 300, 392],
    ],
    label: { x: 0.05, y: 0.74, align: "start" },
  },
  {
    // Centre portafilter: drops away beneath its E61 group head.
    id: "groups",
    range: [0.5, 0.72],
    track: [
      [100, 640, 462],
      [150, 640, 488],
      [300, 640, 500],
    ],
    label: { x: 0.5, y: 0.765, align: "center" },
  },
  {
    // Pump / heat-exchanger block opening on the right.
    id: "pump",
    range: [0.75, 0.95],
    track: [
      [110, 985, 382],
      [160, 1000, 386],
      [300, 998, 386],
    ],
    label: { x: 0.9, y: 0.74, align: "end" },
  },
];

/** Scroll window of the closing line once the machine is fully apart. */
export const OUTRO_RANGE = [0.95, 1] as const;

/** Fade distance (in scroll progress) used at the edges of every window. */
export const FADE = 0.035;
