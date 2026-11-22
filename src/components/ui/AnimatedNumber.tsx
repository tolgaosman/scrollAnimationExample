"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

/** A number that springs to its new value instead of jumping. */
export function AnimatedNumber({
  value,
  decimals = 0,
  format,
  className = "",
}: {
  value: number;
  decimals?: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const mv = useSpring(value, { stiffness: 180, damping: 26, mass: 0.6 });
  const text = useTransform(mv, (v) => (format ? format(v) : v.toFixed(decimals)));
  useEffect(() => {
    mv.set(value);
  }, [mv, value]);
  return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>;
}
