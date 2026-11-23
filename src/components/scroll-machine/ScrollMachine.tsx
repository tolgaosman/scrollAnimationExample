"use client";

/**
 * ScrollMachine — composition root of the scroll-scrubbed hero.
 * ------------------------------------------------------------------
 *   <section>                          ← as tall as its content
 *     <div sticky 100svh, -mb-100svh>  ← the machine, pinned behind everything
 *       <FrameCanvas/> <Hud/>
 *     <HeroIntro/>                     ← one viewport of title, scrolls away
 *     {children}                       ← café cards (CafeStops) scrolling past
 *
 * The page scrolls like any other: nothing is "locked" waiting for an
 * animation. The machine is simply the backdrop; as the visitor reads about
 * the café it comes apart behind the cards, and once the section ends the
 * canvas scrolls away with it.
 *
 * Data flow (one direction, no React state per tick):
 *   window scroll → useScroll() → scrollYProgress (0–1, raw)
 *                 → useSpring()  → progress (weighted, mechanical feel)
 *                 → canvas + HUD read `progress`
 *
 * With prefers-reduced-motion we skip the spring entirely and scrub 1:1
 * (and the canvas shows whole frames, no cross-fade). The same spring is used
 * on touch: phones report scroll in uneven bursts, and the spring is what
 * irons that out — a stiffer one made the machine visibly jitter.
 */
import { useReducedMotion, useScroll, useSpring } from "motion/react";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { FrameCanvas } from "./FrameCanvas";
import { Hud } from "./Hud";
import { HeroIntro } from "./HeroIntro";
import { Preloader } from "./Preloader";
import { useFramePreloader } from "./useFramePreloader";
import { scrubSpring, scrubTouchSpring } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

export interface FrameSequenceProps {
  urls: string[];
  width: number;
  height: number;
}

export function ScrollMachine({
  sequence,
  children,
}: {
  sequence: FrameSequenceProps;
  children?: React.ReactNode;
}) {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLElement>(null);
  const { store, progress: loadProgress, ready } = useFramePreloader(sequence.urls);

  const reduceMotion = useReducedMotion();
  const coarse = useMediaQuery("(pointer: coarse)");
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smoothed = useSpring(scrollYProgress, coarse ? scrubTouchSpring : scrubSpring);
  const progress = reduceMotion ? scrollYProgress : smoothed;

  const [studio, setStudio] = useState<string | null>(null);

  // Stable identity matters: FrameCanvas re-initialises when this changes.
  const imageSize = useMemo(
    () => ({ width: sequence.width, height: sequence.height }),
    [sequence.width, sequence.height],
  );

  return (
    <>
      <Preloader progress={loadProgress} ready={ready} total={sequence.urls.length} />
      <section
        ref={sectionRef}
        className="relative bg-studio"
        style={studio ? { backgroundColor: studio } : undefined}
        aria-label={t("subtitle")}
      >
        {/* Zero flow height (-mb) so the intro and cards sit on top of the pinned machine. */}
        <div className="sticky top-0 z-0 -mb-[100svh] h-svh w-full overflow-hidden">
          {store && (
            <FrameCanvas
              store={store}
              imageSize={imageSize}
              progress={progress}
              label={t("canvasLabel")}
              // Single crisp frames eliminate double-image ghosting on moving parts.
              blend={false}
              onBackground={setStudio}
            />
          )}
          <Hud progress={progress} frameCount={sequence.urls.length} />
        </div>
        <div className="relative z-20 text-ink">
          <HeroIntro revealed={ready} />
          {children}
        </div>
      </section>
    </>
  );
}
