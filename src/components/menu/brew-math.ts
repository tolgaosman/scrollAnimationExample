/**
 * Brew ratio math — pure and unit-testable.
 * Ratios are expressed as grams of water (or beverage, for espresso) per
 * gram of coffee. Numbers follow common specialty practice (SCA golden cup
 * ≈ 1:15–1:17 for filter; 1:1.5–1:2.5 for espresso; 1:8–1:12 cold brew
 * concentrate).
 */
export type Method = "pourover" | "espresso" | "coldbrew";
export type Strength = "light" | "balanced" | "strong";

interface MethodSpec {
  dose: { min: number; max: number; step: number; default: number };
  ratio: Record<Strength, number>;
  /** °C, or null for cold. */
  temperature: Record<Strength, number | null>;
  /** Total contact time in seconds for a given dose & strength. */
  time: (dose: number, strength: Strength) => number;
}

export const METHODS: Record<Method, MethodSpec> = {
  pourover: {
    dose: { min: 10, max: 40, step: 1, default: 20 },
    ratio: { light: 17, balanced: 16, strong: 15 },
    temperature: { light: 94, balanced: 93, strong: 92 },
    // Bigger beds drain slower: ~2:45 for 12 g up to ~4:15 for 40 g.
    time: (dose, s) => 120 + dose * 3.4 + (s === "strong" ? 10 : s === "light" ? -10 : 0),
  },
  espresso: {
    dose: { min: 14, max: 22, step: 0.5, default: 18 },
    ratio: { light: 2.5, balanced: 2, strong: 1.5 },
    temperature: { light: 92, balanced: 93, strong: 94 },
    time: (_dose, s) => ({ light: 25, balanced: 28, strong: 31 })[s],
  },
  coldbrew: {
    dose: { min: 40, max: 200, step: 5, default: 80 },
    ratio: { light: 12, balanced: 10, strong: 8 },
    temperature: { light: null, balanced: null, strong: null },
    time: (_dose, s) => ({ light: 14, balanced: 16, strong: 18 })[s] * 3600,
  },
};

/** Grams of water a filter bed retains per gram of coffee. */
const ABSORPTION = 2;

export interface BrewResult {
  water: number;
  yield: number;
  ratio: number;
  temperature: number | null;
  seconds: number;
}

export function calculateBrew(method: Method, dose: number, strength: Strength): BrewResult {
  const spec = METHODS[method];
  const ratio = spec.ratio[strength];
  const out = dose * ratio;
  if (method === "espresso") {
    // For espresso the ratio describes the beverage weight in the cup.
    return { water: out, yield: out, ratio, temperature: spec.temperature[strength], seconds: spec.time(dose, strength) };
  }
  return {
    water: out,
    yield: Math.max(0, out - dose * ABSORPTION),
    ratio,
    temperature: spec.temperature[strength],
    seconds: spec.time(dose, strength),
  };
}
