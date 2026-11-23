"use client";

/**
 * HeroIntro — the opening screen, in normal document flow.
 * ------------------------------------------------------------------
 * It is exactly one viewport tall and scrolls away like any other content,
 * revealing the pinned machine and the café cards (CafeStops) behind/after
 * it. Only the entrance animation (letters rising, lines fading in) is
 * time-based; nothing here is tied to scroll progress.
 */
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ease } from "@/lib/motion";

export function HeroIntro({ revealed }: { revealed: boolean }) {
  const t = useTranslations("hero");
  const letters = Array.from(t("titleA"));

  return (
    <div className="shell relative flex h-svh flex-col justify-between pb-[5svh] pt-28 md:pt-32 short:pt-20">
      <div className="flex items-start justify-between gap-8">
        <Rise revealed={revealed} delay={0.35}>
          <p className="eyebrow text-ink-soft">{t("eyebrow")}</p>
        </Rise>
        <Rise revealed={revealed} delay={0.45} className="hidden max-w-[24ch] text-right md:block">
          <p className="font-display text-xl italic leading-snug lg:text-2xl">{t("subtitle")}</p>
        </Rise>
      </div>

      <div>
        <div className="mb-5 flex items-end justify-between gap-6 md:hidden">
          <Rise revealed={revealed} delay={0.45}>
            <p className="font-display text-lg italic leading-snug">{t("subtitle")}</p>
          </Rise>
        </div>
        <h1 className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <span
            // Generous top headroom (pt-[0.34em]) ensures the dots above Turkish İ
            // are never clipped by the reveal mask, and pb-[0.14em] protects Ç's cedilla.
            className="display -mb-[0.14em] -mt-[0.34em] flex overflow-hidden pb-[0.14em] pt-[0.34em] text-[clamp(2.65rem,15.5vw,8rem)] tracking-[-0.012em] md:text-[clamp(4.75rem,9vw,9.75rem)] short:text-[4.25rem]"
            aria-label={t("titleA")}
          >
            {letters.map((ch, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="inline-block will-change-transform"
                initial={{ y: "105%" }}
                animate={revealed ? { y: "0%" } : undefined}
                transition={{ duration: 1.1, ease: ease.outQuint, delay: 0.1 + i * 0.045 }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
          <Rise revealed={revealed} delay={0.6} className="pb-[1.2vw]">
            <span className="eyebrow block text-sm tracking-[0.5em] md:text-base">{t("titleB")}</span>
          </Rise>
        </h1>
        <div className="mt-5 flex items-end justify-between gap-6 border-t border-ink/15 pt-4">
          <Rise revealed={revealed} delay={0.75} className="max-w-[46ch] short:hidden">
            <p className="text-sm leading-relaxed text-ink-soft md:text-[0.95rem]">{t("lede")}</p>
          </Rise>
          <Rise revealed={revealed} delay={0.85} className="hidden shrink-0 items-center gap-3 sm:flex">
            <span className="eyebrow">{t("scroll")}</span>
            <ScrollCue />
          </Rise>
        </div>
      </div>
    </div>
  );
}

function ScrollCue() {
  return (
    <span className="relative block h-10 w-px overflow-hidden bg-ink/20" aria-hidden="true">
      <motion.span
        className="absolute inset-x-0 top-0 h-1/2 bg-ink"
        animate={{ y: ["-100%", "200%"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: ease.inOutExpo }}
      />
    </span>
  );
}

/** Masked rise-in used by the hero once the preloader lifts. */
function Rise({
  children,
  revealed,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  revealed: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={revealed ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, ease: ease.outQuint, delay }}
    >
      {children}
    </motion.div>
  );
}
