"use client";

import { motion } from "motion/react";
import { ease } from "@/lib/motion";

/**
 * Segmented 10-step tasting meter. Segments fill one after another when the
 * meter enters the viewport — like a gauge needle sweeping up to its reading.
 */
export function Meter({
  label,
  value,
  max = 10,
  tone = "ink",
}: {
  label: string;
  value: number;
  max?: number;
  tone?: "ink" | "paper";
}) {
  const on = tone === "ink" ? "bg-ink" : "bg-paper";
  const off = tone === "ink" ? "bg-ink/12" : "bg-paper/15";
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="grid grid-cols-[6.5rem_1fr_1.5rem] items-center gap-3"
    >
      <span className="eyebrow opacity-70">{label}</span>
      <motion.span
        className={`relative h-[5px] overflow-hidden rounded-full ${off}`}
        initial="off"
        whileInView="on"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        <motion.span
          className={`absolute inset-y-0 left-0 origin-left rounded-full ${on}`}
          style={{ width: `${(value / max) * 100}%` }}
          variants={{ off: { scaleX: 0 }, on: { scaleX: 1 } }}
          transition={{ duration: 0.9, ease: ease.outExpo }}
        />
      </motion.span>
      <span className="eyebrow text-right tabular-nums">{value}</span>
    </div>
  );
}
