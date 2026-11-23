"use client";

/**
 * Signature Roasts — a horizontal gallery driven by vertical scroll.
 * The section is tall (one viewport per bean); inside it a sticky stage
 * holds a wide track whose translateX is mapped from the section's scroll
 * progress. Track width is measured so the last panel lands flush right.
 *
 * On short viewports (phones in landscape, the smallest phones) a pinned
 * stage leaves no room for a whole card, so the gallery becomes a plain
 * swipeable row with scroll-snap instead.
 */
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { signatureBeans, type Bean } from "@/content/beans";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { CoffeeBeanSwatch } from "@/components/ui/CoffeeBeanSwatch";
import { Meter } from "@/components/ui/Meter";
import { useMediaQuery } from "@/lib/useMediaQuery";

const GUTTER = "clamp(1.25rem,4vw,4rem)";

export function SignatureRoasts() {
  const t = useTranslations("home.roasts");
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const swipe = useMediaQuery("(max-height: 600px)");

  useEffect(() => {
    const track = trackRef.current;
    if (!track || swipe) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [swipe]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const eased = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(eased, [0, 1], [0, -distance]);
  const pinnedBar = useTransform(eased, [0, 1], [0, 1]);
  // Swipe mode: the rail follows the row's own horizontal scroll.
  const { scrollXProgress } = useScroll({ container: trackRef });
  const bar = swipe ? scrollXProgress : pinnedBar;

  return (
    <section
      ref={sectionRef}
      className={`relative bg-paper-deep ${swipe ? "pb-10" : ""}`}
      style={swipe ? undefined : { height: `${signatureBeans.length * 78 + 45}vh` }}
      aria-labelledby="roasts-title"
    >
      <div className={swipe ? "flex flex-col" : "sticky top-0 flex h-svh flex-col overflow-hidden"}>
        <div className="shell flex items-end justify-between gap-6 pb-3 pt-18 md:pb-5 md:pt-22">
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

        <motion.div
          ref={trackRef}
          style={swipe ? { x: 0, scrollPaddingInline: GUTTER } : { x }}
          className={`flex min-h-0 flex-1 items-stretch gap-6 px-[clamp(1.25rem,4vw,4rem)] py-5 md:gap-10 md:py-8 ${
            swipe ? "snap-x snap-mandatory overflow-x-auto overscroll-x-contain pointer-coarse:[scrollbar-width:none]" : ""
          }`}
        >
          {signatureBeans.map((bean, i) => (
            <RoastPanel key={bean.id} bean={bean} index={i} />
          ))}
          <div className="flex w-[70vw] shrink-0 snap-start flex-col justify-center gap-6 md:w-[32vw]">
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
    // On short phones (`max-height:760px`) the panel tightens up and drops the
    // story paragraph so the whole card fits the pinned stage without clipping.
    // gap-x only from md: below it every cell spans all 12 columns, and eleven
    // 24px column gaps alone would be wider than a 320px phone's card.
    <article className="relative grid w-[86vw] shrink-0 snap-start grid-cols-12 gap-x-0 gap-y-5 overflow-hidden border border-ink/15 bg-paper p-5 shadow-[0_20px_44px_-30px_rgb(28_24_20/0.3)] md:w-[60vw] md:gap-x-6 md:p-7 lg:w-[52vw] [@media(max-height:760px)]:gap-y-4">
      <div className="col-span-12 flex items-start justify-between md:col-span-5 md:flex-col">
        <span className="display text-[clamp(3.25rem,7vw,6.25rem)] text-ink/15 [@media(max-height:760px)]:text-[clamp(2.75rem,7vw,6rem)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* Roast colour coffee bean with topographic altitude ring */}
        <div
          className="relative aspect-square w-24 md:w-full md:max-w-[13rem] max-md:[@media(max-height:760px)]:w-16 md:[@media(max-height:760px)]:max-w-[8.5rem]"
          aria-hidden="true"
        >
          <span className="absolute -inset-2.5 rounded-full border border-dashed border-ink/15" />
          <CoffeeBeanSwatch tone={bean.tone} className="absolute inset-0 size-full" />
        </div>
      </div>

      <div className="col-span-12 flex flex-col justify-between gap-6 md:col-span-7 [@media(max-height:760px)]:gap-4">
        <div>
          <p className="eyebrow text-copper">
            {bean.origin[locale]} · {tl(bean.roast)}
          </p>
          <h3 className="mt-2 font-display text-[clamp(1.8rem,3.2vw,3rem)] leading-[1.02] tracking-tight">
            {bean.name}
          </h3>
          <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-ink-soft [@media(max-height:760px)]:hidden">
            {bean.story[locale]}
          </p>
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
            <dd className="mt-1 num text-sm tabular-nums">{bean.altitude.toLocaleString(locale)} m</dd>
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
