"use client";

/**
 * Preloader — editorial 000 → 100 counter shown while frames decode.
 * The number is spring-driven, so it glides even when the network delivers
 * frames in bursts. When everything's in, it holds for a beat on "100",
 * then wipes upward to reveal the hero underneath (same studio grey, so
 * the hand-off is seamless).
 */
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { WallMark } from "@/components/brand/WallMark";
import { ease } from "@/lib/motion";

interface PreloaderProps {
  progress: number;
  ready: boolean;
  total: number;
}

export function Preloader({ progress, ready, total }: PreloaderProps) {
  const t = useTranslations("preloader");
  const [visible, setVisible] = useState(!ready);

  const value = useSpring(0, { stiffness: 200, damping: 26, restDelta: 0.05 });
  const counter = useTransform(value, (v) => String(Math.min(100, Math.round(v))).padStart(3, "0"));
  const bar = useTransform(value, [0, 100], [0, 1]);
  const rotate = useTransform(value, [0, 100], [0, 360 / 11]);
  const loaded = useTransform(value, (v) => String(Math.round((v / 100) * total)).padStart(3, "0"));

  useEffect(() => {
    value.set(progress * 100);
  }, [progress, value]);

  // Brief beat on 100 before lifting so the site opens fast.
  useEffect(() => {
    if (!ready || !visible) return;
    const id = window.setTimeout(() => setVisible(false), 120);
    return () => window.clearTimeout(id);
  }, [ready, visible]);

  // Lock page scroll while the curtain is down.
  useEffect(() => {
    if (!visible) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          role="progressbar"
          aria-label={t("label")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="fixed inset-0 z-[80] flex flex-col justify-between bg-studio text-ink shell py-6 md:py-8"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.55, ease: ease.drawer }}
        >
          <div className="flex items-start justify-between">
            <span className="eyebrow">SURLARİÇİ // Lefkon Roasters</span>
            <motion.span style={{ rotate }} className="block size-10 md:size-12">
              <WallMark className="size-full" />
            </motion.span>
          </div>

          <div>
            <div className="flex items-end justify-between gap-6">
              <motion.span
                className="display tabular-nums text-[clamp(6rem,24vw,22rem)] leading-[0.8]"
                aria-hidden="true"
              >
                {counter}
              </motion.span>
              <div className="pb-3 text-right">
                <p className="eyebrow">{ready ? t("ready") : t("label")}</p>
                <p className="eyebrow mt-1 text-ink-soft tabular-nums">
                  <motion.span>{loaded}</motion.span> / {total} {t("frames")}
                </p>
              </div>
            </div>
            <div className="relative mt-6 h-px w-full bg-ink/15">
              <motion.div className="absolute inset-0 origin-left bg-ink" style={{ scaleX: bar }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
