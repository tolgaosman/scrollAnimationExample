/**
 * geometry.ts — pure layout math for drawing an image into a viewport.
 * ------------------------------------------------------------------
 * The canvas and the HTML overlays MUST agree on where the image is drawn,
 * otherwise the callout leader lines would point at empty space. So the
 * math lives here, framework-free, and both sides import it.
 *
 *   computeFit()    → where/how big the image is drawn (CSS pixels)
 *   imageToScreen() → map a point in source-image pixels to CSS pixels
 */

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export type FitMode = "cover" | "contain";

export interface Fit {
  /** Uniform scale from source-image pixels to CSS pixels. */
  scale: number;
  /** Top-left of the drawn image, in CSS pixels (can be negative when cropping). */
  dx: number;
  dy: number;
  /** Drawn size, in CSS pixels. */
  dw: number;
  dh: number;
  viewport: Size;
}

/**
 * object-fit math, plus a `zoom` multiplier.
 *
 * - cover:   scale = max(vw/iw, vh/ih) → fills the viewport, crops overflow.
 * - contain: scale = min(vw/iw, vh/ih) → whole image visible, letterboxed.
 *
 * `zoom` lets us art-direct beyond the two CSS keywords, e.g. "contain, but
 * 12% bigger" on portrait phones so the exploded parts aren't microscopic.
 * Any gap this leaves is filled by edge extension (see drawFrame.ts), so the
 * studio background still looks infinite.
 */
export function computeFit(viewport: Size, image: Size, mode: FitMode, zoom = 1, offsetY = 0): Fit {
  const sx = viewport.width / image.width;
  const sy = viewport.height / image.height;
  const scale = (mode === "cover" ? Math.max(sx, sy) : Math.min(sx, sy)) * zoom;
  const dw = image.width * scale;
  const dh = image.height * scale;
  return {
    scale,
    dw,
    dh,
    // Centre the image (then nudge vertically by a fraction of the viewport,
    // to leave room for typography). Rounding keeps edges on whole pixels.
    dx: Math.round((viewport.width - dw) / 2),
    dy: Math.round((viewport.height - dh) / 2 + offsetY * viewport.height),
    viewport,
  };
}

/** Reference dimensions in which anchor tracks in timeline.ts were measured. */
const REF_W = 1280;
const REF_H = 720;

/** Map a point measured on the 1280×720 reference space into CSS pixels (resolution-independent). */
export function imageToScreen(pt: Point, fit: Fit): Point {
  return { x: fit.dx + (pt.x / REF_W) * fit.dw, y: fit.dy + (pt.y / REF_H) * fit.dh };
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
