"use client";

/**
 * Manifesto — stone vs. steel. An asymmetric split: a tall panel of
 * procedural Nicosia limestone on the left, a shorter brushed-steel plate
 * on the right that drifts against the scroll (parallax) so the two
 * materials feel physically separate.
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
  const steelY = useTransform(scrollYProgress, [0, 1], ["12%", "-18%"]);
  const stoneY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  const stats = [
    [t("stat1"), t("stat1Label")],
    [t("stat2"), t("stat2Label")],
    [t("stat3"), t("stat3Label")],
  ] as const;

  return (
    <section ref={ref} className="relative overflow-hidden bg-paper py-24 md:py-36" aria-labelledby="manifesto-title">
      <div className="shell grid-arch gap-y-10">
        <div className="col-span-12 flex items-baseline justify-between">
          <p className="eyebrow">{t("eyebrow")}</p>
          <p className="eyebrow text-ink-soft">01</p>
        </div>
        <DrawnRule className="col-span-12 -mt-6" />

        {/* Stone panel */}
        <div className="relative col-span-12 md:col-span-7">
          <motion.div style={{ y: stoneY }} className="relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
            <LimestoneTexture className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            <p className="eyebrow absolute left-5 top-5 text-ink/70">{t("stoneLabel")}</p>
            <MaskedLines
              lines={[t("titleA")]}
              className="display absolute bottom-6 left-5 right-5 text-[clamp(2.6rem,6.5vw,6.5rem)] text-paper"
              as="p"
            />
          </motion.div>
        </div>

        {/* Steel plate */}
        <div className="col-span-12 md:col-span-5 md:pt-40">
          <motion.div style={{ y: steelY }} className="brushed-steel relative aspect-[4/3] overflow-hidden shadow-[0_40px_80px_-40px_rgb(28_24_20/0.45)] md:aspect-[4/5]">
            <p className="eyebrow absolute left-5 top-5 text-ink/70">{t("steelLabel")}</p>
            {/* four rivets */}
            {["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"].map((pos) => (
              <span
                key={pos}
                className={`copper-sheen absolute ${pos} block size-2 rounded-full shadow-[inset_0_-1px_1px_rgb(0_0_0/0.4)]`}
                aria-hidden="true"
              />
            ))}
            <MaskedLines
              lines={[t("titleB")]}
              className="display absolute bottom-6 left-5 right-5 text-[clamp(2.2rem,4.6vw,4.8rem)] italic text-ink"
              as="p"
            />
          </motion.div>
        </div>

        <h2 id="manifesto-title" className="sr-only">
          {t("titleA")} {t("titleB")}
        </h2>

        <Reveal className="col-span-12 md:col-span-5 md:col-start-2">
          <p className="font-display text-xl leading-relaxed md:text-2xl">{t("p1")}</p>
        </Reveal>
        <Reveal className="col-span-12 md:col-span-4 md:col-start-8" delay={0.1}>
          <p className="leading-relaxed text-ink-soft">{t("p2")}</p>
        </Reveal>

        <dl className="col-span-12 mt-10 grid grid-cols-1 border-t border-ink/15 sm:grid-cols-3">
          {stats.map(([value, label], i) => (
            <Reveal
              key={label}
              delay={i * 0.08}
              className="flex flex-col-reverse border-b border-ink/15 py-6 sm:border-b-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0"
            >
              <dt className="eyebrow mt-2 text-ink-soft">{label}</dt>
              <dd className="display text-[clamp(3rem,6vw,5.5rem)]">{value}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
