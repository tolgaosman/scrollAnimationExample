/**
 * timeline.ts — the choreography, as data.
 * ------------------------------------------------------------------
 * How scroll maps to frames, and how the image fits on landscape vs
 * portrait screens. The page scrolls normally over the pinned machine, so
 * "scroll progress" is simply how far through the intro section you are.
 *
 * Source footage notes (10 s of 1280×720 video, 240 frames):
 *   first ~12 %   assembled; cups barely lift
 *   ~12–33 %      side panels swing out, copper boiler emerges on the left
 *   ~33–53 %      portafilters drop, pump / heat-exchanger block opens right
 *   last ~47 %    full teardown, only subtle drift
 */
import type { FitMode } from "./geometry";
import { clamp } from "./geometry";

/**
 * Scroll progress (0–1) → normalised frame position (0–1).
 * A straight line would waste half the scroll on the slow tail of the
 * footage. These keyframes linger on the assembled machine, spread the
 * dramatic separation across the middle, then let the tail settle.
 */
export const FRAME_KEYS: ReadonlyArray<readonly [scroll: number, frame: number]> = [
  [0, 0],
  [0.06, 0.08], // the machine answers the very first scroll
  [0.4, 0.34], // boiler fully out
  [0.72, 0.6], // portafilters dropped, right block open
  [1, 1], // fully apart as the last card leaves
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
 * Fractional frame position (0 … count−1). The canvas draws frame ⌊pos⌋ and
 * cross-fades frame ⌊pos⌋+1 on top by the fraction, so the image moves
 * continuously instead of stepping every ~15–20 px of scroll.
 */
export function framePositionAt(scroll: number, count: number): number {
  return frameProgressAt(scroll) * (count - 1);
}

/**
 * How the frame is laid out per orientation. See computeFit():
 * `zoom` scales beyond plain cover/contain, `offsetY` lifts the machine
 * (fraction of viewport height) to leave room for the type underneath.
 */
export const FIT: Record<"landscape" | "portrait", { mode: FitMode; zoom: number; offsetY: number }> = {
  landscape: { mode: "cover", zoom: 0.94, offsetY: -0.08 },
  // Portrait crops the outermost side panels so the machine itself reads boldly at phone size.
  portrait: { mode: "contain", zoom: 1.42, offsetY: -0.075 },
};
