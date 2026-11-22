"use client";

/**
 * FrameCanvas — the render loop.
 * ------------------------------------------------------------------
 * Responsibilities, in order:
 *   1. Size the backing store for devicePixelRatio (crisp on Retina).
 *   2. Work out the fit (cover/contain + zoom) and report it upward so the
 *      HTML overlays can align with the image.
 *   3. Subscribe to the (spring-smoothed) scroll progress MotionValue and
 *      paint the matching frame — at most once per animation frame, and
 *      only when the frame index or the layout actually changed.
 *
 * Note what's *not* here: no React state per scroll tick. MotionValue
 * subscriptions run outside React's render cycle, so scrubbing never
 * triggers a re-render of anything.
 */
import { type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { computeFit, type Fit, type Size } from "./geometry";
import { buildEdgeTextures, drawFrame, type EdgeTextures } from "./drawFrame";
import { FIT, frameIndexAt } from "./timeline";

interface FrameCanvasProps {
  images: HTMLImageElement[];
  imageSize: Size;
  progress: MotionValue<number>;
  /** Accessible description of the animation. */
  label: string;
  onLayout?: (fit: Fit) => void;
  /** Called once with the sampled studio colour (for CSS fallbacks). */
  onBackground?: (color: string) => void;
}

const MAX_DPR = 2; // beyond 2× the JPEG has no extra detail; save the fill-rate.

export function FrameCanvas({
  images,
  imageSize,
  progress,
  label,
  onLayout,
  onBackground,
}: FrameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep the latest callbacks in refs so the effect below never re-subscribes.
  const onLayoutRef = useRef(onLayout);
  const onBackgroundRef = useRef(onBackground);
  useEffect(() => {
    onLayoutRef.current = onLayout;
    onBackgroundRef.current = onBackground;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const edges: EdgeTextures = buildEdgeTextures(images[0]);
    onBackgroundRef.current?.(edges.average);

    let fit: Fit | null = null;
    let drawnIndex = -1;
    let dirty = true; // layout changed → must repaint even if the index didn't
    let raf = 0;

    /** (Re)size the backing store to match CSS size × DPR. */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const viewport = { width: rect.width, height: rect.height };
      canvas.width = Math.round(viewport.width * dpr);
      canvas.height = Math.round(viewport.height * dpr);
      // Draw in CSS pixels from here on; the transform handles DPR.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const orientation = viewport.width / viewport.height >= 1 ? "landscape" : "portrait";
      const { mode, zoom, offsetY } = FIT[orientation];
      fit = computeFit(viewport, imageSize, mode, zoom, offsetY);
      onLayoutRef.current?.(fit);
      dirty = true;
    };

    const render = () => {
      raf = 0;
      if (!fit) return;
      const index = frameIndexAt(progress.get(), images.length);
      if (index === drawnIndex && !dirty) return; // nothing new to paint
      drawFrame(ctx, images[index], fit, edges);
      drawnIndex = index;
      dirty = false;
    };

    /** Coalesce any number of change events into one paint per frame. */
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(() => {
      resize();
      schedule();
    });
    observer.observe(canvas);

    resize();
    render();
    const unsubscribe = progress.on("change", schedule);

    return () => {
      unsubscribe();
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [images, imageSize, progress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block h-full w-full"
      role="img"
      aria-label={label}
    />
  );
}
