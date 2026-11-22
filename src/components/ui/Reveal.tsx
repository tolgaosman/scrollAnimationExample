"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { ease } from "@/lib/motion";

/** Fade-and-rise once when scrolled into view. */
export function Reveal({
  delay = 0,
  y = 24,
  children,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: ease.outQuint, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Masked line reveal for display headings: each line slides up from behind its own clip.
 *
 * Gotcha worth knowing: the *mask* (the overflow-hidden wrapper) is what we
 * observe for in-view, not the moving line. The line starts fully clipped by
 * its parent, and IntersectionObserver accounts for ancestor clipping — so
 * a clipped element never "intersects" and its whileInView never fires.
 */
export function MaskedLines({
  lines,
  className = "",
  lineClassName = "",
  delay = 0,
  as: Tag = "h2",
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <motion.span
          key={i}
          // Headroom inside the mask (pt) so caps, accents and Turkish dots aren't
          // shaved off by tight display leading; -mt cancels it out in the layout.
          className="-mt-[0.12em] block overflow-hidden pb-[0.1em] pt-[0.12em]"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        >
          <motion.span
            className={`block ${lineClassName}`}
            variants={{ hidden: { y: "110%" }, shown: { y: "0%" } }}
            transition={{ duration: 1.05, ease: ease.outQuint, delay: delay + i * 0.08 }}
          >
            {line}
          </motion.span>
        </motion.span>
      ))}
    </Tag>
  );
}

/** A hairline rule that draws itself from left to right. */
export function DrawnRule({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`hairline ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.3, ease: ease.outQuint, delay }}
    />
  );
}
