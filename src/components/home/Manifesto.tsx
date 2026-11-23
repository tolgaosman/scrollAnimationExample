"use client";

/**
 * Manifesto — stone vs. steel in a compact architectural spread.
 * Fits cleanly in a single desktop screen with rich Venetian bastion
 * blueprint linework on limestone and etched roast-telemetry on 304 steel.
 */
import { motion, useScroll, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { LimestoneTexture } from "@/components/ui/LimestoneTexture";
import { DrawnRule, MaskedLines, Reveal } from "@/components/ui/Reveal";

export function Manifesto() {
  const t = useTranslations("home.manifesto");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const steelY = useTransform(scrollYProgress, [0, 1], ["5%", "-7%"]);
  const stoneY = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  const stats = [
    [t("stat1"), t("stat1Label")],
    [t("stat2"), t("stat2Label")],
    [t("stat3"), t("stat3Label")],
  ] as const;

  return (
    <section ref={ref} className="relative overflow-hidden bg-paper py-14 md:py-22" aria-labelledby="manifesto-title">
      <div className="shell grid-arch gap-y-8">
        <div className="col-span-12 flex items-baseline justify-between">
          <p className="eyebrow">{t("eyebrow")}</p>
          <p className="eyebrow text-ink-soft">01 · SURLARİÇİ</p>
        </div>
        <DrawnRule className="col-span-12 -mt-5" />

        {/* Stone panel — compact landscape proportion with architectural arch engraving */}
        <div className="relative col-span-12 md:col-span-6">
          <motion.div
            style={{ y: stoneY }}
            className="relative aspect-[16/10] max-h-[21rem] w-full overflow-hidden border border-ink/12"
          >
            <LimestoneTexture className="absolute inset-0 h-full w-full" />
            <svg
              viewBox="0 0 400 250"
              className="pointer-events-none absolute inset-0 h-full w-full text-ink/25"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              {/* Venetian arch & drafting lines */}
              <path d="M235 250V115a68 68 0 0 1 136 0v135" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M250 250V118a53 53 0 0 1 106 0v132" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="210" y1="115" x2="395" y2="115" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="303" cy="115" r="3" fill="currentColor" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
            <div className="absolute inset-x-4 top-4 flex items-center justify-between">
              <p className="eyebrow bg-paper/75 px-2.5 py-1 text-[0.62rem] text-ink backdrop-blur-[2px]">
                {t("stoneLabel")}
              </p>
              <span className="font-mono text-[0.62rem] tracking-widest text-ink/70">1567</span>
            </div>
            <MaskedLines
              lines={[t("titleA")]}
              className="display absolute bottom-5 left-5 right-5 text-[clamp(1.9rem,3.3vw,3rem)] text-paper"
              as="p"
            />
          </motion.div>
        </div>

        {/* Steel plate — compact landscape proportion with etched roast telemetry */}
        <div className="col-span-12 md:col-span-6 md:mt-6">
          <motion.div
            style={{ y: steelY }}
            className="brushed-steel relative aspect-[16/10] max-h-[21rem] w-full overflow-hidden border border-ink/15 shadow-[0_24px_50px_-28px_rgb(28_24_20/0.4)]"
          >
            <svg
              viewBox="0 0 400 250"
              className="pointer-events-none absolute inset-0 h-full w-full text-ink/18"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Subtle technical roast-curve & calibration grid */}
              <path d="M36 200 Q 130 220 205 140 T 368 62" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="205" cy="140" r="3.5" fill="var(--color-copper)" opacity="0.7" />
              <circle cx="368" cy="62" r="3.5" fill="var(--color-copper)" opacity="0.7" />
              <line x1="36" y1="62" x2="368" y2="62" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 4" />
              <line x1="36" y1="140" x2="368" y2="140" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 4" />
            </svg>
            <div className="absolute inset-x-5 top-4 flex items-center justify-between">
              <p className="eyebrow text-[0.62rem] text-ink/75">{t("steelLabel")}</p>
              <span className="font-mono text-[0.62rem] tracking-widest text-ink/60">PID ±0.1°C</span>
            </div>
            {/* four copper rivets */}
            {["left-2.5 top-2.5", "right-2.5 top-2.5", "left-2.5 bottom-2.5", "right-2.5 bottom-2.5"].map((pos) => (
              <span
                key={pos}
                className={`copper-sheen absolute ${pos} block size-2 rounded-full shadow-[inset_0_-1px_1px_rgb(0_0_0/0.4)]`}
                aria-hidden="true"
              />
            ))}
            <MaskedLines
              lines={[t("titleB")]}
              className="display absolute bottom-5 left-5 right-5 text-[clamp(1.85rem,3.1vw,2.85rem)] italic text-ink"
              as="p"
            />
          </motion.div>
        </div>

        <h2 id="manifesto-title" className="sr-only">
          {t("titleA")} {t("titleB")}
        </h2>

        <Reveal className="col-span-12 md:col-span-6">
          <p className="font-display text-lg leading-relaxed md:text-xl">{t("p1")}</p>
        </Reveal>
        <Reveal className="col-span-12 md:col-span-6" delay={0.08}>
          <p className="text-sm leading-relaxed text-ink-soft md:text-[0.95rem]">{t("p2")}</p>
        </Reveal>

        <dl className="col-span-12 mt-2 grid grid-cols-1 border border-ink/15 bg-paper-deep/45 sm:grid-cols-3 sm:divide-x sm:divide-ink/15">
          {stats.map(([value, label], i) => (
            <Reveal
              key={label}
              delay={i * 0.06}
              className="flex flex-col-reverse border-b border-ink/15 px-5 py-4 last:border-b-0 sm:border-b-0 md:px-6 md:py-5"
            >
              <dt className="eyebrow mt-1.5 text-[0.62rem] text-ink-soft">{label}</dt>
              <dd className="display text-[clamp(2.1rem,3.4vw,3rem)] text-ink">{value}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
