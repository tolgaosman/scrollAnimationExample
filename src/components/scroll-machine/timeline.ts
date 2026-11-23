/**
 * timeline.ts — choreography & live extraction telemetry for the new
 * walnut espresso machine + crystal-ice pour ritual (`coffeeVideo.mp4`).
 *
 * Frame breakdown (normalised 0–1 across all 240 native frames):
 *   0.00 – 0.08 : Machine ready, double-walled glass & crystal ice glass set
 *   0.08 – 0.38 : 9-bar espresso extraction & hazelnut crema streaming into cup
 *   0.38 – 0.60 : Barista's hand enters and lifts the freshly pulled shot
 *   0.60 – 0.85 : Hot espresso ribbon poured over crystal ice, amber swirl
 *   0.85 – 1.00 : Hand clears; finished marbled iced espresso rests beside machine
 */
import type { FitMode } from "./geometry";
import { clamp } from "./geometry";

export const FRAME_KEYS: ReadonlyArray<readonly [scroll: number, frame: number]> = [
  [0, 0],
  [0.12, 0.08], // Ready state in Act 0
  [0.39, 0.38], // Full golden extraction in Act I
  [0.66, 0.6], // Barista hand lifts the shot in Act II
  [0.9, 1], // Pour completes and settles before section scrolls out
  [1, 1], // Hold finished glass cleanly
];

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

export function frameIndexAt(scroll: number, count: number): number {
  return Math.round(frameProgressAt(scroll) * (count - 1));
}

export function framePositionAt(scroll: number, count: number): number {
  return frameProgressAt(scroll) * (count - 1);
}

/**
 * Framed showcase fit: always shows the entire walnut machine + tall ice glass
 * sharply with zero awkward cropping and supersampled pixel density.
 */
export const FIT: Record<"landscape" | "portrait", { mode: FitMode; zoom: number; offsetY: number }> = {
  landscape: { mode: "cover", zoom: 1.0, offsetY: 0 },
  portrait: { mode: "cover", zoom: 1.0, offsetY: 0 },
};

export type RitualActId = "ready" | "extraction" | "craft" | "pour";

export interface RitualAct {
  id: RitualActId;
  index: string;
  /** Target scroll progress (0–1) when clicking the scrubber pill. */
  target: number;
  range: readonly [number, number];
}

export const RITUAL_ACTS: readonly RitualAct[] = [
  { id: "ready", index: "01", target: 0.0, range: [0, 0.2] },
  { id: "extraction", index: "02", target: 0.34, range: [0.2, 0.48] },
  { id: "craft", index: "03", target: 0.64, range: [0.48, 0.76] },
  { id: "pour", index: "04", target: 0.92, range: [0.76, 1] },
];

/** Live group pressure (bar) synchronised with the espresso extraction frames. */
export function pressureAt(scroll: number): number {
  const f = frameProgressAt(scroll);
  if (f < 0.06) return 0;
  if (f < 0.13) return 3.0 * ((f - 0.06) / 0.07); // pre-infusion ramp
  if (f < 0.2) return 3.0 + 6.0 * ((f - 0.13) / 0.07); // ramp to 9 bar
  if (f < 0.36) return 9.0; // steady 9-bar extraction
  if (f < 0.44) return 9.0 * (1 - (f - 0.36) / 0.08); // pressure release
  return 0;
}

/** Live extraction timer (seconds) from 0.0 to 28.0 s. */
export function timerAt(scroll: number): number {
  const f = frameProgressAt(scroll);
  if (f < 0.08) return 0;
  if (f < 0.4) return ((f - 0.08) / 0.32) * 28.0;
  return 28.0;
}

/** Live espresso yield in cup (grams) from 0 to 36 g. */
export function yieldAt(scroll: number): number {
  const f = frameProgressAt(scroll);
  if (f < 0.1) return 0;
  if (f < 0.38) return ((f - 0.1) / 0.28) * 36.0;
  return 36.0;
}

/** Live drink temperature (°C): 93.0 °C boiler → cools to 6.0 °C over crystal ice. */
export function cupTempAt(scroll: number): number {
  const f = frameProgressAt(scroll);
  if (f < 0.62) return 93.0;
  if (f < 0.9) return 93.0 - ((f - 0.62) / 0.28) * 87.0;
  return 6.0;
}
