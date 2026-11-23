"use client";

/**
 * PhaseOverlays — HTML storytelling layered over the canvas.
 * ------------------------------------------------------------------
 * Every overlay is a pure function of the same smoothed progress value the
 * canvas uses, via useTransform(). Nothing here re-renders while scrolling;
 * Motion writes the styles directly.
 *
 * Callout leader lines are drawn in an SVG covering the viewport. Their
 * start points come from imageToScreen(), i.e. the *same* fit the canvas
 * used, so a line aimed at the copper boiler stays on the copper boiler on
 * every screen size.
 */
import { motion, useTransform, type MotionValue } from "motion/react";
import { useTranslations } from "next-intl";
import { imageToScreen, type Fit } from "./geometry";
import {
  anchorAt,
  CALLOUTS,
  FADE,
  frameProgressAt,
  HERO_RANGE,
  OUTRO_RANGE,
  type CalloutPhase,
} from "./timeline";
import { ease } from "@/lib/motion";

interface OverlayProps {
  progress: MotionValue<number>;
  layout: Fit | null;
  revealed: boolean;
}

/** Opacity + y curve for a [enter, exit] window. */
function useWindow(progress: MotionValue<number>, [a, b]: readonly [number, number], holdStart = false) {
  const input = holdStart ? [0, b - FADE, b] : [a - FADE, a + FADE, b - FADE, b + FADE];
  const opacity = useTransform(progress, input, holdStart ? [1, 1, 0] : [0, 1, 1, 0]);
  const y = useTransform(progress, input, holdStart ? [0, 0, -40] : [28, 0, 0, -28]);
  return { opacity, y };
}

export function PhaseOverlays({ progress, layout, revealed }: OverlayProps) {
  const portrait = layout ? layout.viewport.width < layout.viewport.height : false;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 text-ink">
      <HeroPhase progress={progress} revealed={revealed} />
      {CALLOUTS.map((phase) => (
        <Callout
          // Re-key on viewport size so the leader-line closures see the new fit.
          key={`${phase.id}-${layout?.viewport.width ?? 0}x${layout?.viewport.height ?? 0}`}
          phase={phase}
          progress={progress}
          layout={layout}
          portrait={portrait}
        />
      ))}
      <Outro progress={progress} />
    </div>
  );
}

/* ---------------------------------------------------------------- hero */

function HeroPhase({ progress, revealed }: { progress: MotionValue<number>; revealed: boolean }) {
  const t = useTranslations("hero");
  const { opacity, y } = useWindow(progress, HERO_RANGE, true);
  const letters = Array.from(t("titleA"));

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 shell flex flex-col justify-between pb-[5svh] pt-28 md:pt-32 short:pt-20">
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
    </motion.div>
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

/* ------------------------------------------------------------- callout */

function Callout({
  phase,
  progress,
  layout,
  portrait,
}: {
  phase: CalloutPhase;
  progress: MotionValue<number>;
  layout: Fit | null;
  portrait: boolean;
}) {
  const t = useTranslations(`callouts.${phase.id}`);
  const { opacity, y } = useWindow(progress, phase.range);
  const [a] = phase.range;
  // The leader line draws itself in during the first part of the window.
  const draw = useTransform(progress, [a - FADE, a + 0.08], [0, 1]);
  const dot = useTransform(progress, [a - FADE, a + 0.02], [0, 1]);

  // The anchor follows its part frame-by-frame. `layout` is captured in the
  // closures; the parent re-keys this component on resize to refresh them.
  const W = layout?.viewport.width ?? 0;
  const H = layout?.viewport.height ?? 0;
  // Short landscape screens (phones on their side): no room for the text
  // block below the usual label line — see the compact layout further down.
  const compact = !portrait && H < 560;
  const lx = phase.label.x * W;
  const ly = phase.label.y * H;
  const anchorFor = (p: number) =>
    layout ? imageToScreen(anchorAt(phase.track, frameProgressAt(p)), layout) : { x: 0, y: 0 };
  const d = useTransform(progress, (p) => {
    const an = anchorFor(p);
    // anchor → straight down to the label line → across to the label point.
    return `M${an.x.toFixed(1)},${an.y.toFixed(1)} V${ly} H${lx}`;
  });
  const dotX = useTransform(progress, (p) => anchorFor(p).x);
  const dotY = useTransform(progress, (p) => anchorFor(p).y);

  const copy = (
    <>
      <p className="eyebrow text-copper">{t("index")}</p>
      <h2
        className={`mt-2 font-display leading-[1.05] tracking-tight ${
          compact ? "text-xl" : "text-[1.6rem] md:text-[2rem] lg:text-[2.35rem]"
        }`}
      >
        {t("title")}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft [@media(max-height:780px)]:hidden">
        {t("body")}
      </p>
      <p className="eyebrow mt-3 border-t border-ink/20 pt-2 text-ink">{t("spec")}</p>
    </>
  );

  // Portrait / small screens: a caption under the machine, no leader line.
  if (portrait || !layout) {
    return (
      <motion.div style={{ opacity, y }} className="absolute inset-x-0 bottom-[6svh] shell">
        {copy}
      </motion.div>
    );
  }

  // Compact: the copy sits on the bottom edge and only the dot marks the part —
  // a leader line has no room to run on a ~400px-tall screen.
  const vertical: React.CSSProperties = compact ? { bottom: Math.round(H * 0.04) } : { top: ly + 14 };
  const blockStyle: React.CSSProperties =
    phase.label.align === "start"
      ? { left: lx, ...vertical }
      : phase.label.align === "end"
        ? { right: W - lx, ...vertical }
        : { left: lx, ...vertical, translate: "-50% 0" };

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {!compact && (
          <motion.path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            style={{ pathLength: draw }}
            vectorEffect="non-scaling-stroke"
          />
        )}
        <motion.g style={{ scale: dot, x: dotX, y: dotY }}>
          <circle r={11} fill="none" stroke="var(--color-copper)" strokeWidth={1} />
          <circle r={3.5} fill="var(--color-copper)" />
        </motion.g>
      </svg>
      <motion.div
        style={{ ...blockStyle, y }}
        className={`absolute ${
          phase.label.align === "center" ? "w-[min(40rem,56vw)]" : compact ? "w-[min(27rem,44vw)]" : "w-[min(27rem,38vw)]"
        } ${
          phase.label.align === "end" ? "text-right" : phase.label.align === "center" ? "text-center" : ""
        }`}
      >
        {copy}
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------------------- outro */

function Outro({ progress }: { progress: MotionValue<number> }) {
  const t = useTranslations("callouts");
  const [a] = OUTRO_RANGE;
  const opacity = useTransform(progress, [a - FADE / 2, a + FADE / 2], [0, 1]);
  const y = useTransform(progress, [a - FADE / 2, 1], [24, 0]);
  return (
    <motion.p
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-[7svh] shell text-center font-display text-2xl italic md:text-4xl"
    >
      {t("outro")}
    </motion.p>
  );
}
