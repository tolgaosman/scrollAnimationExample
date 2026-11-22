/**
 * drawFrame.ts — paint one frame, with an "infinite studio" background.
 * ------------------------------------------------------------------
 * The footage was shot on a seamless grey sweep with a soft vignette:
 * ~#C0C2C1 at the top centre, falling to ~#9E9E9E in the corners. A
 * flat page colour can never match that, so instead of guessing we
 * *extend the frame's own edges* outward:
 *
 *   ┌──────── top strip (stretched down) ────────┐
 *   │ L │                                    │ R │
 *   │ e │          the actual frame          │ i │
 *   │ f │                                    │ g │
 *   │ t │                                    │ h │
 *   └────── bottom strip (stretched up) ─────────┘
 *
 * The strips are built once from frame 0. A few edge rows/columns get
 * averaged into a tiny 64-px canvas (downscaling = a free blur that kills
 * JPEG noise), then stretched with bilinear smoothing to fill any gap.
 * The result: no visible frame border at any aspect ratio.
 */
import type { Fit } from "./geometry";

export interface EdgeTextures {
  top: HTMLCanvasElement;
  bottom: HTMLCanvasElement;
  left: HTMLCanvasElement;
  right: HTMLCanvasElement;
  /** Average colours for the four corner regions. */
  corners: { tl: string; tr: string; bl: string; br: string };
  /** Overall average edge colour — used as the CSS fallback background. */
  average: string;
}

const STRIP_RES = 64; // resolution of each strip along its long axis
const SAMPLE_DEPTH = 6; // how many px deep into the frame we sample (skips the 1-px JPEG edge)
const INSET = 2;

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return [c, ctx];
}

const rgb = (d: Uint8ClampedArray, i: number) => `rgb(${d[i]} ${d[i + 1]} ${d[i + 2]})`;

export function buildEdgeTextures(img: HTMLImageElement): EdgeTextures {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // Horizontal strips: (w × SAMPLE_DEPTH) region → (STRIP_RES × 1) canvas
  const [top, tctx] = makeCanvas(STRIP_RES, 1);
  tctx.drawImage(img, 0, INSET, w, SAMPLE_DEPTH, 0, 0, STRIP_RES, 1);
  const [bottom, bctx] = makeCanvas(STRIP_RES, 1);
  bctx.drawImage(img, 0, h - INSET - SAMPLE_DEPTH, w, SAMPLE_DEPTH, 0, 0, STRIP_RES, 1);

  // Vertical strips: (SAMPLE_DEPTH × h) region → (1 × STRIP_RES) canvas
  const [left, lctx] = makeCanvas(1, STRIP_RES);
  lctx.drawImage(img, INSET, 0, SAMPLE_DEPTH, h, 0, 0, 1, STRIP_RES);
  const [right, rctx] = makeCanvas(1, STRIP_RES);
  rctx.drawImage(img, w - INSET - SAMPLE_DEPTH, 0, SAMPLE_DEPTH, h, 0, 0, 1, STRIP_RES);

  const t = tctx.getImageData(0, 0, STRIP_RES, 1).data;
  const b = bctx.getImageData(0, 0, STRIP_RES, 1).data;
  const last = (STRIP_RES - 1) * 4;

  // Average of the top-centre and bottom-centre for the CSS fallback colour.
  const mid = Math.floor(STRIP_RES / 2) * 4;
  const avg = [0, 1, 2].map((k) => Math.round((t[mid + k] + b[mid + k]) / 2));

  return {
    top,
    bottom,
    left,
    right,
    corners: { tl: rgb(t, 0), tr: rgb(t, last), bl: rgb(b, 0), br: rgb(b, last) },
    average: `rgb(${avg[0]} ${avg[1]} ${avg[2]})`,
  };
}

/**
 * Draw `img` according to `fit` on a context whose transform is already
 * scaled for devicePixelRatio (so all numbers here are CSS pixels).
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  fit: Fit,
  edges: EdgeTextures | null,
) {
  const { dx, dy, dw, dh, viewport } = fit;
  const { width: W, height: H } = viewport;
  const right = dx + dw;
  const bottom = dy + dh;

  if (edges) {
    // Each side is independent: the image may be offset (e.g. lifted up), so
    // there can be a gap at the bottom but none at the top, and so on.
    // +1 px overlaps hide sub-pixel hairlines between a strip and the frame.
    const gapT = dy > 0;
    const gapB = bottom < H;
    const gapL = dx > 0;
    const gapR = right < W;

    if (gapT) ctx.drawImage(edges.top, 0, 0, STRIP_RES, 1, dx, 0, dw, dy + 1);
    if (gapB) ctx.drawImage(edges.bottom, 0, 0, STRIP_RES, 1, dx, bottom - 1, dw, H - bottom + 1);
    if (gapL) ctx.drawImage(edges.left, 0, 0, 1, STRIP_RES, 0, dy, dx + 1, dh);
    if (gapR) ctx.drawImage(edges.right, 0, 0, 1, STRIP_RES, right - 1, dy, W - right + 1, dh);

    const corner = (color: string, x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };
    if (gapT && gapL) corner(edges.corners.tl, 0, 0, dx + 1, dy + 1);
    if (gapT && gapR) corner(edges.corners.tr, right - 1, 0, W - right + 1, dy + 1);
    if (gapB && gapL) corner(edges.corners.bl, 0, bottom - 1, dx + 1, H - bottom + 1);
    if (gapB && gapR) corner(edges.corners.br, right - 1, bottom - 1, W - right + 1, H - bottom + 1);
  }

  ctx.drawImage(img, dx, dy, dw, dh);
}
