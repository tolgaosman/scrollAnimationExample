"use client";

/**
 * ScrollMachine — "The Living Extraction Ritual" (Frameless Natural Stage)
 * ------------------------------------------------------------------
 * Zero-barrier, frameless showcase woven seamlessly into the homepage:
 *  - No dark box, no border, no corner brackets: the section adopts the exact
 *    sampled studio tone from Frame 0 (`onBackground={setStudio}`), and the
 *    canvas edges feather smoothly into it so the walnut espresso machine and
 *    crystal ice glass sit directly on the open page.
 *  - Instant 0ms opening via frame-0 poster + zero-wait FrameCanvas.
 *  - Minimal editorial hairline telemetry & 4-act interactive scrubber sit
 *    quietly beneath the machine in the site's native typography.
 */
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { signatureBeans } from "@/content/beans";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { CoffeeBeanSwatch } from "@/components/ui/CoffeeBeanSwatch";
import { LimestoneTexture } from "@/components/ui/LimestoneTexture";
import { Meter } from "@/components/ui/Meter";
import { scrubSpring, scrubTouchSpring } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { FrameCanvas } from "./FrameCanvas";
import {
  cupTempAt,
  pressureAt,
  RITUAL_ACTS,
  timerAt,
  yieldAt,
  type RitualActId,
} from "./timeline";
import { useFramePreloader } from "./useFramePreloader";

export interface FrameSequenceProps {
  urls: string[];
  width: number;
  height: number;
  shiftX?: number[];
  shiftY?: number[];
}

export function ScrollMachine({ sequence }: { sequence: FrameSequenceProps }) {
  const t = useTranslations("ritual");
  const th = useTranslations("hero");
  const tm = useTranslations("home.manifesto");
  const tr = useTranslations("home.roasts");
  const tl = useTranslations("beans.roastLevels");
  const tc = useTranslations("contact");
  const locale = useLocale() as "tr" | "en";

  const rootRef = useRef<HTMLElement>(null);
  const mobileRunwayRef = useRef<HTMLDivElement>(null);
  const stageTrackRef = useRef<HTMLDivElement>(null);
  const scrubTrackRef = useRef<HTMLDivElement>(null);
  const { store } = useFramePreloader(sequence.urls);
  const [studio, setStudio] = useState<string | null>(null);

  const reduceMotion = useReducedMotion();
  const coarse = useMediaQuery("(pointer: coarse)");
  const isMobile = useMediaQuery("(max-width: 1023px)");

  // Desktop (lg+): `stageTrackRef` spans all 3 rows in the right column alongside
  // the editorial spine.
  // Mobile (< lg): `mobileRunwayRef` is a 360svh pinned Hero runway so the
  // entire mobile Hero (headline + machine + CTAs) stays on screen while the
  // scroll-driven animation plays 0 -> 1, then unpins cleanly into Manifesto.
  // Passing `scrollYProgress` directly into `useSpring` keeps Motion's native
  // scroll-to-spring frame pipeline intact with zero extra JS indirection.
  const activeTrackRef = isMobile ? mobileRunwayRef : stageTrackRef;

  // Mobile: the runway sits a little below the top of the page (section padding),
  // so "start start" left a dead zone where scrolling did nothing. Start tracking
  // at the runway's own page offset so progress is 0 at scrollY=0 and moves with
  // the very first pixel of scroll.
  const [runwayTop, setRunwayTop] = useState(0);
  useLayoutEffect(() => {
    if (!isMobile) return;
    const measure = () => {
      const el = mobileRunwayRef.current;
      if (el) setRunwayTop(Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isMobile]);

  const { scrollYProgress } = useScroll({
    target: activeTrackRef,
    offset: [isMobile ? `start ${runwayTop}px` : "start start", "end end"],
  });
  const smoothed = useSpring(scrollYProgress, coarse ? scrubTouchSpring : scrubSpring);
  const progress = reduceMotion ? scrollYProgress : smoothed;

  const [activeAct, setActiveAct] = useState<RitualActId>("ready");
  useMotionValueEvent(progress, "change", (p) => {
    const found = RITUAL_ACTS.find((a) => p >= a.range[0] && p <= a.range[1]) ?? RITUAL_ACTS[RITUAL_ACTS.length - 1];
    if (found.id !== activeAct) setActiveAct(found.id);
  });

  // Live MotionValue telemetry — zero React state updates per scroll tick.
  const secUnit = t("secUnit");
  const barText = useTransform(progress, (p) => `${pressureAt(p).toFixed(1)}`);
  const tempText = useTransform(progress, (p) => `${cupTempAt(p).toFixed(1)}°C`);
  const timeText = useTransform(progress, (p) => `${timerAt(p).toFixed(1)}${secUnit}`);
  const yieldText = useTransform(progress, (p) => `${Math.round(yieldAt(p))}g`);

  const imageSize = useMemo(
    () => ({ width: sequence.width, height: sequence.height }),
    [sequence.width, sequence.height],
  );

  const jumpToAct = (target: number, smooth = true) => {
    const el = activeTrackRef.current;
    if (!el) return;
    const clamped = Math.min(1, Math.max(0, target));
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(0, el.offsetHeight - window.innerHeight);
    // Mobile progress runs from scrollY = 0 (not from the runway's top edge).
    const start = isMobile ? top - runwayTop : top;
    const span = isMobile ? travel + runwayTop : travel;
    window.scrollTo({ top: start + span * clamped, behavior: smooth ? "smooth" : "auto" });
  };

  const scrubFromPointer = (clientX: number, smooth = false) => {
    const track = scrubTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    jumpToAct((clientX - rect.left) / rect.width, smooth);
  };

  const activeActIndex = RITUAL_ACTS.find((a) => a.id === activeAct)?.index ?? "01";

  const manifestoStats = [
    [tm("stat1"), tm("stat1Label")],
    [tm("stat2"), tm("stat2Label")],
    [tm("stat3"), tm("stat3Label")],
  ] as const;

  const sectionStyle = studio ? ({ "--stage-bg": studio, backgroundColor: studio } as React.CSSProperties) : undefined;

  return (
    <section
      ref={rootRef}
      aria-label={th("subtitle")}
      className="relative bg-studio pt-16 lg:pt-0"
      style={sectionStyle}
    >
        <div className="shell relative grid grid-cols-1 gap-4 pb-8 lg:grid-cols-12 lg:items-stretch lg:gap-x-10 lg:gap-y-0 lg:pb-0">
          {/* ============================================================
            MOBILE PINNED HERO RUNWAY (`h-[185svh]` on mobile, `lg:contents` on desktop)
            Mobile (< lg): keeps the entire opening Hero composition (Header +
            Machine Stage + Lede & CTAs) pinned together as one full, balanced
            screen while the short scroll-driven animation plays 0 -> 1, then
            unpins cleanly so the visitor browses Manifesto & the rest of the site.
            Desktop (lg+): `lg:contents` dissolves both wrappers so Children 1–3
            participate directly in the 12-column architectural grid.
           ============================================================ */}
          <div ref={mobileRunwayRef} data-hero-runway className="relative h-[360svh] lg:contents">
            <div className="sticky top-16 z-10 flex flex-col gap-3 pb-3 pt-1 lg:contents">
              {/* CHILD 1 — HERO HEADER (Eyebrow, Title, Subtitle) */}
              <div className="flex flex-col justify-end pt-1 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:min-h-[52svh] lg:pt-20">
                <p className="eyebrow flex items-center gap-2.5 text-copper">
                  <span className="block size-1.5 rounded-full bg-copper" aria-hidden="true" />
                  {th("eyebrow")}
                </p>

                <h1 className="mt-2.5 lg:mt-3">
                  <span className="display -mt-[0.28em] block pb-[0.1em] pt-[0.28em] text-[clamp(2.55rem,10.5vw,4.8rem)] tracking-[-0.015em] text-ink lg:text-[clamp(3.6rem,5.2vw,5.5rem)]">
                    {th("titleA")}
                  </span>
                  <span className="eyebrow mt-1 block text-xs text-ink-soft lg:mt-1.5">
                    {th("titleB")} · {tc("address.line2")}
                  </span>
                </h1>

                <p className="mt-2 font-display text-lg italic leading-snug text-ink sm:text-xl md:text-2xl lg:mt-4">
                  {th("subtitle")}
                </p>
              </div>

              {/* CHILD 2 — FRAMELESS ESPRESSO STAGE */}
              <div
                ref={stageTrackRef}
                className="relative h-auto lg:col-span-7 lg:col-start-6 lg:row-span-3 lg:row-start-1"
              >
                <div
                  data-stage-pin
                  className="relative z-10 flex flex-col justify-start lg:sticky lg:top-0 lg:h-svh lg:justify-center lg:py-6 lg:pt-16"
                >
                  {/* Razor-sharp, completely unframed 16:9 canvas with true 4-side edge fade */}
                  <div className="stage-fade relative mx-auto aspect-video max-h-[34svh] w-full overflow-hidden sm:max-h-[44svh] lg:max-h-[68svh]">
                    {/* Instant frame-0 poster: visible at 0ms before JS hydrates */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sequence.urls[0]}
                      alt={th("canvasLabel")}
                      fetchPriority="high"
                      decoding="async"
                      className="absolute inset-0 z-0 h-full w-full object-cover"
                    />
                    {store && (
                      <FrameCanvas
                        store={store}
                        imageSize={imageSize}
                        shiftX={sequence.shiftX}
                        shiftY={sequence.shiftY}
                        progress={progress}
                        label={th("canvasLabel")}
                        blend={false}
                        onBackground={setStudio}
                      />
                    )}
                  </div>

                  {/* Mobile-only synced live story caption card */}
                  <div className="mt-2 rounded-2xl border border-ink/12 bg-paper/65 px-3.5 py-2 backdrop-blur-sm lg:hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="eyebrow flex items-center gap-2 text-[0.68rem] text-ink">
                        <span className="block size-1.5 rounded-full bg-copper" aria-hidden="true" />
                        {t(`acts.${activeAct}.short`)}
                      </span>
                      <span className="num text-[0.65rem] text-copper">{activeActIndex} / 04</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft sm:text-sm">
                      {t(`acts.${activeAct}.caption`)}
                    </p>
                  </div>

                  {/* Quiet Editorial Telemetry & Interactive 4-Act Scrubber */}
                  <div className="mt-2 border-t border-ink/15 pt-2 lg:mt-4 lg:pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <span className="eyebrow hidden items-center gap-2 text-xs text-ink lg:flex">
                        <span className="block size-1.5 rounded-full bg-copper" aria-hidden="true" />
                        {t(`acts.${activeAct}.short`)}
                      </span>

                      <div className="flex w-full items-center justify-between gap-3 font-mono text-[0.68rem] tabular-nums text-ink-soft sm:gap-4 lg:w-auto lg:justify-end">
                        <span className="whitespace-nowrap">
                          <span className="mr-1 text-[0.58rem] opacity-60">BAR</span>
                          <motion.span className="font-medium text-copper">{barText}</motion.span>
                        </span>
                        <span className="whitespace-nowrap">
                          <motion.span className="text-ink">{tempText}</motion.span>
                        </span>
                        <span className="whitespace-nowrap">
                          <motion.span>{timeText}</motion.span>
                        </span>
                        <span className="whitespace-nowrap">
                          <motion.span>{yieldText}</motion.span>
                        </span>
                      </div>
                    </div>

                    {/* Touch-draggable copper progress hairline */}
                    <div
                      ref={scrubTrackRef}
                      onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        scrubFromPointer(e.clientX, false);
                      }}
                      onPointerMove={(e) => {
                        if (e.buttons === 1 || e.pointerType === "touch") {
                          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                            scrubFromPointer(e.clientX, false);
                          }
                        }
                      }}
                      className="relative my-1 flex h-5 cursor-ew-resize touch-none items-center lg:my-2 lg:h-3"
                    >
                      <div className="relative h-px w-full bg-ink/15">
                        <motion.div
                          className="absolute inset-0 origin-left bg-copper"
                          style={{ scaleX: progress }}
                        />
                      </div>
                    </div>

                    {/* Minimalist clickable 4-phase tabs */}
                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                      {RITUAL_ACTS.map((act) => {
                        const isActive = activeAct === act.id;
                        return (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => jumpToAct(act.target)}
                            aria-pressed={isActive}
                            className={`flex items-center justify-center gap-1 py-1 text-center transition-colors duration-300 sm:justify-start sm:gap-1.5 ${isActive ? "text-ink" : "text-ink/45 hover:text-ink/80"
                              }`}
                          >
                            <span className={`num text-[0.58rem] ${isActive ? "text-copper" : "opacity-60"}`}>
                              {act.index}
                            </span>
                            <span className="truncate text-xs sm:text-[0.64rem]">
                              {t(`acts.${act.id}.tab`)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* CHILD 3 — HERO LEDE, CTAS & ROAST DAY BAR */}
              <div className="flex flex-col justify-start pb-1 lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:min-h-[48svh] lg:pb-12">
                <p className="max-w-[44ch] text-sm leading-relaxed text-ink-soft md:text-[0.95rem] lg:mt-3">
                  {t("heroLede")}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center gap-2.5 sm:gap-3 lg:mt-6">
                  <ArrowLink href="/menu">{t("ctaMenu")}</ArrowLink>
                  <ArrowLink href="/cekirdekler" variant="ghost">
                    {t("ctaBeans")}
                  </ArrowLink>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/15 pt-3 lg:mt-7 lg:pt-4">
                  <span className="eyebrow text-xs text-copper">{tc("hours.roastDay")}</span>
                  <span className="eyebrow text-[0.62rem] text-ink-soft lg:hidden">{t("scrollCue")} ↓</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
            CHILD 4 — EDITORIAL ARTICLES (ACTS 01–03)
            Mobile (< lg): starts cleanly right after the short pinned Hero
            runway finishes, with zero sticky barrier over the articles.
            Desktop (lg+): left column Row 3, directly under the Hero.
           ============================================================ */}
          <div className="space-y-10 pt-4 lg:col-span-5 lg:col-start-1 lg:row-start-3 lg:space-y-14 lg:pb-16 lg:pt-0">

                {/* ACT 01: 9-BAR EXTRACTION & STONE/WALNUT/STEEL MANIFESTO */}
                <article className="border-t border-ink/15 pt-6 lg:min-h-[62svh] lg:pt-8" aria-labelledby="manifesto-title">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="eyebrow text-copper">{tm("eyebrow")}</p>
                  </div>

                  <h2 id="manifesto-title" className="display mt-3 text-[clamp(1.9rem,4vw,3.15rem)] text-ink">
                    {tm("titleA")} <span className="italic text-walnut">{tm("titleB")}</span>
                  </h2>

                  {/* Material Swatch Pair: Nicosia Limestone + American Walnut */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="relative aspect-[16/11] overflow-hidden border border-ink/15 p-2.5 sm:p-3">
                      <LimestoneTexture className="absolute inset-0 h-full w-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                      <span className="eyebrow relative z-10 inline-block bg-paper/80 px-1.5 py-0.5 text-xs text-ink">
                        {tm("stoneLabel")}
                      </span>
                      <p className="font-display relative z-10 mt-5 text-lg italic leading-tight text-paper">1567</p>
                    </div>
                    <div className="walnut-grain relative aspect-[16/11] overflow-hidden border border-walnut/40 p-2.5 text-paper sm:p-3">
                      <span className="eyebrow inline-block border border-paper/20 px-1.5 py-0.5 text-xs text-paper/85">
                        {t("walnutLabel")}
                      </span>
                      <p className="num mt-5 text-xs text-crema">PID ±0.1 °C</p>
                    </div>
                  </div>

                  <p className="mt-5 font-display text-lg leading-relaxed text-ink">{tm("p1")}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{tm("p2")}</p>

                  <dl className="mt-6 grid grid-cols-3 divide-x divide-ink/15 border border-ink/15 bg-paper/55">
                    {manifestoStats.map(([value, label]) => (
                      <div key={label} className="px-2.5 py-3 sm:px-3.5 sm:py-3.5">
                        <dd className="display whitespace-nowrap text-xl text-ink sm:text-3xl">{value}</dd>
                        <dt className="eyebrow mt-1 text-xs text-ink-soft sm:text-xs">{label}</dt>
                      </div>
                    ))}
                  </dl>
                </article>

                {/* ACT 02: THE BARISTA'S HAND & SIGNATURE ORIGINS */}
                <article className="border-t border-ink/15 pt-6 lg:min-h-[66svh] lg:pt-8" aria-labelledby="roasts-title">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="eyebrow text-copper">{tr("eyebrow")}</p>
                  </div>

                  <h2 id="roasts-title" className="display mt-3 text-[clamp(1.9rem,4vw,3.15rem)] text-ink">
                    {tr("title")}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{t("originsLede")}</p>

                  <ul className="mt-5 space-y-3.5">
                    {signatureBeans.map((bean) => (
                      <li
                        key={bean.id}
                        className="rounded-[1.75rem] bg-paper/55 p-5 transition-colors duration-300 hover:bg-paper/80"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <CoffeeBeanSwatch tone={bean.tone} className="size-9 shrink-0" />
                            <div className="min-w-0">
                              <p className="eyebrow truncate text-xs text-copper">
                                {bean.origin[locale]} · {tl(bean.roast)}
                              </p>
                              <h3 className="font-display text-lg leading-tight text-ink sm:text-xl">{bean.name}</h3>
                            </div>
                          </div>
                          <span className="shrink-0 whitespace-nowrap num text-[0.68rem] tabular-nums text-ink-soft">
                            {bean.altitude.toLocaleString(locale)} m
                          </span>
                        </div>

                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {bean.notes[locale].map((note) => (
                            <li key={note} className="whitespace-nowrap rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-[0.66rem] text-ink-soft">
                              {note}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 space-y-2.5">
                          <Meter label={tr("acidity")} value={bean.acidity} />
                          <Meter label={tr("body")} value={bean.body} />
                          <Meter label={tr("sweetness")} value={bean.sweetness} />
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <ArrowLink href="/cekirdekler" variant="ghost">
                      {tr("explore")}
                    </ArrowLink>
                  </div>
                </article>

                {/* ACT 03: CRYSTAL ICE POUR & SIGNATURE GLASS BLUEPRINT */}
                <article className="border-t border-ink/15 pt-6 lg:min-h-[56svh] lg:pt-8" aria-labelledby="pour-title">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="eyebrow text-copper">{t("pour.eyebrow")}</p>
                  </div>

                  <h2 id="pour-title" className="display mt-3 text-[clamp(1.9rem,4vw,3.15rem)] text-ink">
                    {t("pour.title")}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-[0.95rem]">{t("pour.body")}</p>

                  {/* Architectural Glass Spec Card */}
                  <div className="mt-6 rounded-[1.75rem] bg-paper/55 p-4 text-ink sm:p-5">
                    <div className="flex items-baseline justify-between gap-2 border-b border-ink/12 pb-3">
                      <span className="eyebrow text-xs text-copper">{t("pour.recipeLabel")}</span>
                      <span className="shrink-0 whitespace-nowrap num text-xs text-ink-soft">240 ML · 1:2</span>
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                      <div>
                        <dt className="eyebrow text-xs text-ink-soft">{t("pour.spec1Label")}</dt>
                        <dd className="mt-1 whitespace-nowrap num text-xs text-ink sm:text-sm">{t("pour.spec1Value")}</dd>
                      </div>
                      <div>
                        <dt className="eyebrow text-xs text-ink-soft">{t("pour.spec2Label")}</dt>
                        <dd className="mt-1 whitespace-nowrap num text-xs text-copper sm:text-sm">{t("pour.spec2Value")}</dd>
                      </div>
                      <div>
                        <dt className="eyebrow text-xs text-ink-soft">{t("pour.spec3Label")}</dt>
                        <dd className="mt-1 whitespace-nowrap num text-xs text-ink sm:text-sm">{t("pour.spec3Value")}</dd>
                      </div>
                    </dl>
                    <div className="mt-5 flex flex-wrap gap-2.5 border-t border-ink/12 pt-4">
                      <ArrowLink href={{ pathname: "/menu", hash: "calculator" }} variant="solid">
                        {t("pour.ctaCalc")}
                      </ArrowLink>
                      <ArrowLink href="/iletisim" variant="ghost">
                        {t("pour.ctaVisit")}
                      </ArrowLink>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            {/* Seamless transition strip from studio background into warm paper BrewBar */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-12 bg-gradient-to-b from-transparent to-paper" />
          </section>
          );
}
