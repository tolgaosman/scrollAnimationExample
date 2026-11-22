/**
 * Motion tokens — one vocabulary for every animation on the site.
 *
 * Curves: CSS-native cubic-béziers, tuned by eye. "Out" curves front-load
 * the movement (things arrive fast and settle softly), which reads as
 * responsive. Never use linear for UI movement.
 */
import type { Transition } from "motion/react";

export const ease = {
  /** Default for reveals: quick start, long silky settle. */
  outQuint: [0.22, 1, 0.36, 1] as const,
  /** Snappier settle for small UI (pills, underlines). */
  outExpo: [0.16, 1, 0.3, 1] as const,
  /** Symmetric, for elements that move between two resting states. */
  inOutExpo: [0.87, 0, 0.13, 1] as const,
  /** Drawer/curtain: decisive in, gentle out. */
  drawer: [0.76, 0, 0.24, 1] as const,
};

export const spring = {
  /** Shared-layout pill (locale switcher, tabs). Crisp with a hint of overshoot. */
  pill: { type: "spring", stiffness: 520, damping: 38, mass: 0.7 } satisfies Transition,
  /** Panels and cards that physically move. */
  soft: { type: "spring", stiffness: 220, damping: 28, mass: 0.9 } satisfies Transition,
  /** Magnetic hover / tilt — loose and playful. */
  magnetic: { type: "spring", stiffness: 160, damping: 15, mass: 0.4 } satisfies Transition,
};

/**
 * Scroll scrub spring for the canvas hero — passed to useSpring().
 * Lower stiffness + moderate damping = the frame index "trails" the
 * scrollbar slightly, like a heavy flywheel, then settles without bounce.
 */
export const scrubSpring = { stiffness: 110, damping: 26, mass: 0.55, restDelta: 0.0001 };
export const duration = { fast: 0.25, base: 0.6, slow: 1.1 };

/** Stagger helper for children of a revealed container. */
export const stagger = (step = 0.06, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});
