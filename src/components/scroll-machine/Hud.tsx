"use client";

/**
 * Hud — a quiet instrument panel for the teardown: a live frame counter and
 * a vertical progress rail with ticks at each story phase. Purely derived
 * from the progress MotionValue; renders once.
 */
import { motion, useTransform, type MotionValue } from "motion/react";
import { useTranslations } from "next-intl";
import { CALLOUTS, frameIndexAt } from "./timeline";

export function Hud({ progress, frameCount }: { progress: MotionValue<number>; frameCount: number }) {
  const t = useTranslations("hero");
  const frame = useTransform(progress, (p) => String(frameIndexAt(p, frameCount) + 1).padStart(3, "0"));
  const pct = useTransform(progress, (p) => `${String(Math.round(p * 100)).padStart(2, "0")}%`);
  const rail = useTransform(progress, [0, 1], [0, 1]);
  const hudOpacity = useTransform(progress, [0, 0.06, 0.97, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ opacity: hudOpacity }}
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 flex-col items-center justify-center gap-4 text-ink md:flex lg:w-20"
      aria-hidden="true"
    >
      <span className="eyebrow [writing-mode:vertical-rl]">{t("progress")}</span>
      <div className="relative h-[38svh] w-px bg-ink/15">
        <motion.div className="absolute inset-0 origin-top bg-ink" style={{ scaleY: rail }} />
        {CALLOUTS.map((c, i) => (
          <span
            key={c.id}
            className="absolute -left-[3px] block h-px w-[7px] bg-ink"
            style={{ top: `${c.range[0] * 100}%` }}
            title={String(i + 1)}
          />
        ))}
      </div>
      <span className="eyebrow tabular-nums">
        <motion.span>{pct}</motion.span>
      </span>
      <span className="eyebrow tabular-nums text-ink-soft">
        <motion.span>{frame}</motion.span>/{frameCount}
      </span>
    </motion.div>
  );
}
