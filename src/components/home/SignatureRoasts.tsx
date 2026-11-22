"use client";

/**
 * Signature Roasts — a horizontal gallery driven by vertical scroll.
 * The section is tall (one viewport per bean); inside it a sticky stage
 * holds a wide track whose translateX is mapped from the section's scroll
 * progress. Track width is measured so the last panel lands flush right.
 */
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { signatureBeans, type Bean } from "@/content/beans";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Meter } from "@/components/ui/Meter";

export function SignatureRoasts() {
  const t = useTranslations("home.roasts");
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const eased = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(eased, [0, 1], [0, -distance]);
  const bar = useTransform(eased, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper-deep"
      style={{ height: `${signatureBeans.length * 100 + 60}vh` }}
      aria-labelledby="roasts-title"
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="shell flex items-end justify-between gap-6 pb-6 pt-24 md:pt-28">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 id="roasts-title" className="display mt-3 text-headline">
              {t("title")}
            </h2>
          </div>
          <div className="hidden max-w-[34ch] text-right md:block">
            <p className="text-sm text-ink-soft">{t("lede")}</p>
          </div>
        </div>

        <div className="shell">
          <div className="relative h-px bg-ink/15">
            <motion.div className="absolute inset-0 origin-left bg-copper" style={{ scaleX: bar }} />
          </div>
        </div>

        <motion.div ref={trackRef} style={{ x }} className="flex flex-1 items-stretch gap-6 py-8 pl-[clamp(1.25rem,4vw,4rem)] pr-[clamp(1.25rem,4vw,4rem)] md:gap-10">
          {signatureBeans.map((bean, i) => (
            <RoastPanel key={bean.id} bean={bean} index={i} />
          ))}
          <div className="flex w-[70vw] shrink-0 flex-col justify-center gap-6 md:w-[32vw]">
            <p className="font-display text-3xl italic leading-tight md:text-4xl">{t("lede")}</p>
            <div>
              <ArrowLink href="/cekirdekler">{t("explore")}</ArrowLink>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RoastPanel({ bean, index }: { bean: Bean; index: number }) {
  const t = useTranslations("home.roasts");
  const tl = useTranslations("beans.roastLevels");
  const locale = useLocale();

  return (
    <article className="grid w-[86vw] shrink-0 grid-cols-12 gap-x-6 gap-y-6 border border-ink/12 bg-paper p-5 md:w-[64vw] md:p-8 lg:w-[56vw]">
      <div className="col-span-12 flex items-start justify-between md:col-span-5 md:flex-col">
        <span className="display text-[clamp(4rem,9vw,8rem)] text-ink/15">{String(index + 1).padStart(2, "0")}</span>
        {/* Roast colour chip, like an Agtron reference card. */}
        <div className="relative aspect-square w-24 md:w-full md:max-w-[15rem]" aria-hidden="true">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${bean.tone} 55%, white) 0%, ${bean.tone} 45%, color-mix(in oklab, ${bean.tone} 60%, black) 100%)`,
            }}
          />
          <svg viewBox="0 0 100 100" className="absolute inset-0 text-paper/40">
            <path d="M50 12 C 38 35, 62 65, 50 88" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
        </div>
      </div>

      <div className="col-span-12 flex flex-col justify-between gap-6 md:col-span-7">
        <div>
          <p className="eyebrow text-copper">
            {bean.origin[locale]} · {tl(bean.roast)}
          </p>
          <h3 className="mt-2 font-display text-[clamp(1.8rem,3.2vw,3rem)] leading-[1.02] tracking-tight">
            {bean.name}
          </h3>
          <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-ink-soft">{bean.story[locale]}</p>
        </div>

        <ul className="flex flex-wrap gap-2">
          {bean.notes[locale].map((note) => (
            <li key={note} className="rounded-full border border-ink/20 px-3 py-1 text-xs">
              {note}
            </li>
          ))}
        </ul>

        <div className="space-y-2.5">
          <Meter label={t("acidity")} value={bean.acidity} />
          <Meter label={t("body")} value={bean.body} />
          <Meter label={t("sweetness")} value={bean.sweetness} />
        </div>

        <dl className="grid grid-cols-2 gap-4 border-t border-ink/15 pt-4">
          <div>
            <dt className="eyebrow text-ink-soft">{t("altitude")}</dt>
            <dd className="mt-1 font-mono text-sm tabular-nums">{bean.altitude.toLocaleString(locale)} m</dd>
          </div>
          <div>
            <dt className="eyebrow text-ink-soft">{t("process")}</dt>
            <dd className="mt-1 text-sm">{bean.process[locale]}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
