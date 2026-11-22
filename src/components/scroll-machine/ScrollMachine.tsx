"use client";

/**
 * ScrollMachine — composition root of the scroll-scrubbed hero.
 * ------------------------------------------------------------------
 *   <section 500vh>                ← provides scroll distance
 *     <div sticky 100svh>          ← pinned stage
 *       <FrameCanvas/>             ← paints frames
 *       <PhaseOverlays/>           ← typography + callouts
 *       <Hud/>                     ← frame counter / progress rail
 *
 * Data flow (one direction, no React state per tick):
 *   window scroll → useScroll() → scrollYProgress (0–1, raw)
 *                 → useSpring()  → progress (weighted, mechanical feel)
 *                 → canvas + overlays + HUD all read `progress`
 *
 * With prefers-reduced-motion we skip the spring entirely and scrub 1:1
 * (and the canvas shows whole frames, no cross-fade). Touch devices get a
 * stiffer spring, since native momentum already smooths the gesture.
 */
import { useReducedMotion, useScroll, useSpring } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Fit } from "./geometry";
import { FrameCanvas } from "./FrameCanvas";
import { Hud } from "./Hud";
import { PhaseOverlays } from "./PhaseOverlays";
import { Preloader } from "./Preloader";
import { useFramePreloader } from "./useFramePreloader";
import { scrubSpring, scrubSpringTouch } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

export interface FrameSequenceProps {
  urls: string[];
  width: number;
  height: number;
}

export function ScrollMachine({ sequence }: { sequence: FrameSequenceProps }) {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLElement>(null);
  const { store, progress: loadProgress, ready } = useFramePreloader(sequence.urls);

  const reduceMotion = useReducedMotion();
  const coarse = useMediaQuery("(pointer: coarse)");
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smoothed = useSpring(scrollYProgress, coarse ? scrubSpringTouch : scrubSpring);
  const progress = reduceMotion ? scrollYProgress : smoothed;

  const [layout, setLayout] = useState<Fit | null>(null);
  const [studio, setStudio] = useState<string | null>(null);
  const onLayout = useCallback((fit: Fit) => setLayout(fit), []);

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
        className="relative h-[500vh] bg-studio"
        style={studio ? { backgroundColor: studio } : undefined}
        aria-label={t("subtitle")}
      >
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          {store && (
            <FrameCanvas
              store={store}
              imageSize={imageSize}
              progress={progress}
              label={t("canvasLabel")}
              blend={!reduceMotion}
              onLayout={onLayout}
              onBackground={setStudio}
            />
          )}
          <PhaseOverlays progress={progress} layout={layout} revealed={ready} />
          <Hud progress={progress} frameCount={sequence.urls.length} />
        </div>
      </section>
    </>
  );
}
