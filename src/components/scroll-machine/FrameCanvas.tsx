"use client";

/**
 * FrameCanvas — the render loop.
 * ------------------------------------------------------------------
 * Responsibilities, in order:
 *   1. Size the backing store for devicePixelRatio — capped at the footage's
 *      own resolution, since a finer canvas adds fill cost but no detail.
 *   2. Work out the fit (cover/contain + zoom) and report it upward so the
 *      HTML overlays can align with the image.
 *   3. Subscribe to the (spring-smoothed) scroll progress MotionValue and
 *      paint the matching frame — at most once per animation frame, and
 *      only when what's on screen would actually change. It always paints
 *      the exact frame for the current position: holding a stale frame and
 *      catching up later reads as jitter.
 *   4. Keep the frames around the scroll position (biased toward its
 *      direction) pre-decoded as ImageBitmaps from their Blobs (off the main
 *      thread), which are cheap to paint. If a bitmap isn't ready, the exact
 *      frame is painted from its <img> instead.
 *   5. On fine-pointer screens, cross-fade neighbouring frames by the
 *      fractional position for continuous motion.
 *
 * Add `?debug` to the URL for an on-screen readout of frame rate and paint
 * cost — the quickest way to see what a real phone is doing.
 *
 * Note what's *not* here: no React state per scroll tick. MotionValue
 * subscriptions run outside React's render cycle, so scrubbing never
 * triggers a re-render of anything.
 */
import { type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { computeFit, type Fit, type Size } from "./geometry";
import { buildEdgeTextures, drawFrame, type EdgeTextures } from "./drawFrame";
import { FIT, framePositionAt } from "./timeline";
import type { Frame, FrameStore } from "./useFramePreloader";

interface FrameCanvasProps {
  store: FrameStore;
  imageSize: Size;
  progress: MotionValue<number>;
  /** Accessible description of the animation. */
  label: string;
  /** Cross-fade between frames. */
  blend: boolean;
  onLayout?: (fit: Fit) => void;
  /** Called once with the sampled studio colour (for CSS fallbacks). */
  onBackground?: (color: string) => void;
}

/** Never finer than 3× — and see the per-fit cap at the footage's resolution in resize(). */
const MAX_DPR = 3;
/** …and never allocate more than a 4K backing store (big desktop monitors). */
const MAX_BACKING_PIXELS = 3840 * 2160;
/** Cross-fade resolution: 1/32 steps are invisible and skip redundant paints. */
const BLEND_STEPS = 32;
/** How many frames ahead of the scroll direction to keep decoded. */
const WARM_AHEAD = 16;
const WARM_BEHIND = 4;
/** Concurrent bitmap decodes. */
const MAX_IN_FLIGHT = 4;

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
    if (!canvas || store.frames.length === 0) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const edges: EdgeTextures = buildEdgeTextures(store.frames[0].img);
    onBackgroundRef.current?.(edges.average);

    let fit: Fit | null = null;
    let drawnKey = -1;
    let dirty = true; // layout changed → must repaint even if the frame didn't
    let raf = 0;
    let direction: 1 | -1 = 1;
    let lastPos = 0;
    let warmedAt = -1;
    let warmedVersion = -1;
    let shownFrame = -1;
    const debug = debugPanel(canvas);

    /** Coalesce any number of change events into one paint per frame. */
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    // Pre-decoded ImageBitmaps for the frames around the scroll position,
    // decoded from the compressed Blobs (off the main thread). Painting a
    // bitmap is cheap; painting an <img> can mean a synchronous decode. When a
    // bitmap isn't ready yet we still paint the exact frame from its <img> —
    // never hold a stale frame and jump later (that reads as jitter).
    const bitmaps = new Map<Blob, ImageBitmap>();
    const inFlight = new Set<Blob>();
    let wanted = new Set<Blob>();
    let queue: Blob[] = [];
    let disposed = false;
    const canBitmap = typeof createImageBitmap === "function";

    const pump = () => {
      while (inFlight.size < MAX_IN_FLIGHT && queue.length > 0) {
        const blob = queue.shift()!;
        inFlight.add(blob);
        createImageBitmap(blob).then(
          (bmp) => {
            inFlight.delete(blob);
            if (disposed || !wanted.has(blob)) bmp.close();
            else bitmaps.set(blob, bmp);
            pump();
          },
          () => {
            inFlight.delete(blob);
            pump();
          },
        );
      }
    };

    /** Re-centre the decode window on `index`, biased toward the scroll direction. */
    const warm = (index: number) => {
      const frames = store.frames;
      const order: Frame[] = [];
      const seen = new Set<Blob>();
      const add = (i: number) => {
        const f = frames[i];
        if (f && !seen.has(f.blob)) {
          seen.add(f.blob);
          order.push(f);
        }
      };
      add(index);
      add(index + 1);
      for (let k = 1; k <= WARM_AHEAD; k++) {
        add(index + k * direction);
        if (k <= WARM_BEHIND) add(index - k * direction);
      }
      if (!canBitmap) {
        // No ImageBitmap support: at least keep the browser's decode cache hot.
        for (const f of order) f.img.decode().catch(() => {});
        return;
      }
      wanted = seen;
      for (const [blob, bmp] of bitmaps) {
        if (!seen.has(blob)) {
          bmp.close();
          bitmaps.delete(blob);
        }
      }
      queue = order.map((f) => f.blob).filter((b) => !bitmaps.has(b) && !inFlight.has(b));
      pump();
    };

    const drawable = (f: Frame | undefined) => (f ? (bitmaps.get(f.blob) ?? f.img) : undefined);

    /** (Re)size the backing store to match CSS size × DPR. */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const viewport = { width: rect.width, height: rect.height };

      const orientation = viewport.width / viewport.height >= 1 ? "landscape" : "portrait";
      const { mode, zoom, offsetY } = FIT[orientation];
      fit = computeFit(viewport, imageSize, mode, zoom, offsetY);

      // Source pixels per CSS pixel of the drawn frame: the finest backing-store
      // density that can still show real detail.
      const sourceDensity = Math.max(1, imageSize.width / fit.dw);
      let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR, sourceDensity);
      const area = viewport.width * viewport.height;
      if (area * dpr * dpr > MAX_BACKING_PIXELS) dpr = Math.max(1, Math.sqrt(MAX_BACKING_PIXELS / area));
      canvas.width = Math.round(viewport.width * dpr);
      canvas.height = Math.round(viewport.height * dpr);
      // Draw in CSS pixels from here on; the transform handles DPR.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      onLayoutRef.current?.(fit);
      dirty = true;
    };

    function render() {
      raf = 0;
      if (!fit) return;
      const frames = store.frames;
      const count = frames.length;
      if (count === 0) return;
      const pos = framePositionAt(progress.get(), count);
      // Only flip direction on real movement, so the spring's tiny settling
      // wobble doesn't keep flipping which side we pre-decode.
      if (Math.abs(pos - lastPos) > 0.5) {
        direction = pos > lastPos ? 1 : -1;
        lastPos = pos;
      }

      let index = Math.min(count - 1, Math.max(0, (blend ? Math.floor(pos) : Math.round(pos)) || 0));
      let frac = blend ? Math.round((pos - index) * BLEND_STEPS) / BLEND_STEPS : 0;
      if (frac >= 1) {
        index += 1;
        frac = 0;
      }
      if (index >= count - 1) {
        index = count - 1;
        frac = 0;
      }

      if (index !== warmedAt || store.version !== warmedVersion) {
        warm(index);
        warmedAt = index;
        warmedVersion = store.version;
      }

      const next = frac > 0 ? drawable(frames[index + 1]) : undefined;
      const key = index * (BLEND_STEPS + 1) + (next ? frac * BLEND_STEPS : 0);
      if (key === drawnKey && !dirty) return; // nothing new to paint

      const base = drawable(frames[index]);
      if (!base) return; // frame not decoded yet — keep the last paint
      const t0 = performance.now();
      drawFrame(ctx!, base, fit, edges, next ? { img: next, alpha: frac } : undefined);
      debug?.paint(performance.now() - t0, index, base instanceof HTMLImageElement);
      drawnKey = key;
      dirty = false;
      if (index !== shownFrame) {
        shownFrame = index;
        canvas!.dataset.frame = String(index); // hook for tests / debugging
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
      disposed = true;
      for (const bmp of bitmaps.values()) bmp.close();
      bitmaps.clear();
      debug?.dispose();
    };
  }, [store, imageSize, progress, blend]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 block h-full w-full contrast-[1.04] saturate-[1.03]"
      role="img"
      aria-label={label}
    />
  );
}

/**
 * `?debug` readout: real frame rate, frames slower than 33 ms, and the
 * slowest canvas paint (a slow paint = a synchronous JPEG decode).
 */
function debugPanel(canvas: HTMLCanvasElement) {
  if (!new URLSearchParams(window.location.search).has("debug")) return null;
  const el = document.createElement("pre");
  el.style.cssText =
    "position:fixed;left:8px;bottom:8px;z-index:100;margin:0;padding:6px 8px;font:11px/1.35 ui-monospace,monospace;background:rgb(0 0 0/.75);color:#0f0;pointer-events:none;white-space:pre";
  document.body.appendChild(el);

  let frames = 0;
  let slow = 0;
  let worstFrame = 0;
  let worstPaint = 0;
  let paints = 0;
  let fallbacks = 0;
  let index = 0;
  let last = performance.now();
  let raf = 0;
  const tick = (t: number) => {
    const dt = t - last;
    last = t;
    frames++;
    if (dt > 33.4) slow++;
    worstFrame = Math.max(worstFrame, dt);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  const timer = window.setInterval(() => {
    el.textContent =
      `fps ${frames * 2}  slow ${slow}  worst ${worstFrame.toFixed(0)}ms\n` +
      `paints ${paints * 2}/s  from <img> ${fallbacks}  worst paint ${worstPaint.toFixed(1)}ms\n` +
      `frame ${index}  canvas ${canvas.width}×${canvas.height} @${devicePixelRatio}x`;
    frames = slow = paints = fallbacks = 0;
    worstFrame = worstPaint = 0;
  }, 500);

  return {
    paint(ms: number, i: number, fromImg: boolean) {
      paints++;
      if (fromImg) fallbacks++;
      index = i;
      worstPaint = Math.max(worstPaint, ms);
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      el.remove();
    },
  };
}
