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
 *      only when what's on screen would actually change.
 *   4. Keep a window of frames around the scroll position decoded off the
 *      main thread (FrameDecoder), so painting never stalls on a JPEG decode.
 *   5. Cross-fade between neighbouring frames by the fractional position,
 *      so the machine moves continuously rather than in frame-sized steps.
 *
 * Note what's *not* here: no React state per scroll tick. MotionValue
 * subscriptions run outside React's render cycle, so scrubbing never
 * triggers a re-render of anything.
 */
import { type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { computeFit, type Fit, type Size } from "./geometry";
import { buildEdgeTextures, drawFrame, type EdgeTextures } from "./drawFrame";
import { FrameDecoder, type Drawable } from "./frameDecoder";
import { FIT, framePositionAt } from "./timeline";
import type { FrameStore } from "./useFramePreloader";

interface FrameCanvasProps {
  store: FrameStore;
  imageSize: Size;
  progress: MotionValue<number>;
  /** Accessible description of the animation. */
  label: string;
  /** Cross-fade between frames (off for prefers-reduced-motion). */
  blend: boolean;
  onLayout?: (fit: Fit) => void;
  /** Called once with the sampled studio colour (for CSS fallbacks). */
  onBackground?: (color: string) => void;
}

/**
 * Match the screen up to 3×. Capping at 2× made 3× phones upscale the canvas
 * a second time in the compositor — two resampling passes, visibly softer.
 */
const MAX_DPR = 3;
/** …but never allocate more than a 4K backing store (big desktop monitors). */
const MAX_BACKING_PIXELS = 3840 * 2160;
/** Cross-fade resolution: 1/32 steps are invisible and skip redundant paints. */
const BLEND_STEPS = 32;

export function FrameCanvas({
  store,
  imageSize,
  progress,
  label,
  blend,
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
    if (!canvas || store.blobs.length === 0) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const edges: EdgeTextures = buildEdgeTextures(store.poster);
    onBackgroundRef.current?.(edges.average);

    let fit: Fit | null = null;
    let drawnKey = -1;
    let dirty = true; // layout changed → must repaint even if the frame didn't
    let painted = false;
    let raf = 0;
    let focused = -1;
    let focusedVersion = -1;
    let direction: 1 | -1 = 1;
    let lastPos = 0;
    let shownFrame = -1;

    /** Coalesce any number of change events into one paint per frame. */
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const decoder = new FrameDecoder(() => store.blobs, schedule);

    /** (Re)size the backing store to match CSS size × DPR. */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const viewport = { width: rect.width, height: rect.height };
      let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const area = viewport.width * viewport.height;
      if (area * dpr * dpr > MAX_BACKING_PIXELS) dpr = Math.max(1, Math.sqrt(MAX_BACKING_PIXELS / area));
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

    function render() {
      raf = 0;
      if (!fit) return;
      const count = store.blobs.length;
      const pos = framePositionAt(progress.get(), count);
      // Only flip direction on real movement, so the spring's tiny settling
      // wobble doesn't keep re-centring the decode window.
      if (Math.abs(pos - lastPos) > 0.25) {
        direction = pos > lastPos ? 1 : -1;
        lastPos = pos;
      }

      let index = blend ? Math.floor(pos) : Math.round(pos);
      let frac = blend ? Math.round((pos - index) * BLEND_STEPS) / BLEND_STEPS : 0;
      if (frac >= 1) {
        index += 1;
        frac = 0;
      }
      if (index >= count - 1) {
        index = count - 1;
        frac = 0;
      }

      // Move the decode window when the frame changes (or new frames streamed in).
      if (index !== focused || store.version !== focusedVersion) {
        decoder.focus(index, direction);
        focused = index;
        focusedVersion = store.version;
      }

      const shown = index;
      let base: Drawable | undefined = decoder.get(index);
      if (!base) {
        // A fast fling outran the decoder. Keep what's on screen (never jump to
        // some other frame — that reads as flicker); onDecoded() repaints the
        // moment this frame is ready.
        if (painted) return;
        base = store.poster;
        frac = 0;
      }
      const next = frac > 0 ? decoder.get(index + 1) : undefined;
      const key = shown * (BLEND_STEPS + 1) + (next ? frac * BLEND_STEPS : 0);
      if (key === drawnKey && !dirty) return; // nothing new to paint

      drawFrame(ctx!, base!, fit, edges, next ? { img: next, alpha: frac } : undefined);
      drawnKey = key;
      dirty = false;
      painted = true;
      if (shown !== shownFrame) {
        shownFrame = shown;
        canvas!.dataset.frame = String(shown); // hook for tests / debugging
      }
    }

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
      decoder.dispose();
    };
  }, [store, imageSize, progress, blend]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block h-full w-full"
      role="img"
      aria-label={label}
    />
  );
}
