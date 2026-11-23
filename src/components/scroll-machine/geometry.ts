/**
 * geometry.ts — pure layout math for drawing an image into a viewport.
 * ------------------------------------------------------------------
 * Framework-free so it can be reasoned about (and tested) on its own.
 *
 *   computeFit() → where/how big the image is drawn (CSS pixels)
 */

export interface Size {
  width: number;
  height: number;
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

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
