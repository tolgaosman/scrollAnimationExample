/**
 * frameDecoder.ts — keep a small, moving window of frames decoded.
 * ------------------------------------------------------------------
 * Drawing a JPEG-backed <img> whose pixels the browser has evicted forces a
 * synchronous decode inside drawImage() — on a phone that's 5–15 ms of main
 * thread per frame, i.e. visible scroll jank. createImageBitmap(blob)
 * decodes off the main thread instead, so we:
 *
 *   - decode the frames around the current scroll position ahead of time,
 *     biased in the direction of travel (AHEAD frames forward, BEHIND back),
 *   - release (close()) bitmaps that fall out of the window, which caps
 *     memory at ~WINDOW × 3.7 MB for 720p frames,
 *   - let the renderer fall back to the nearest decoded frame if a very fast
 *     fling outruns the decoder (a brief hold beats a hitch).
 *
 * Bitmaps are keyed by Blob, so slots that share a borrowed Blob (see
 * useFramePreloader backfill) are decoded once.
 */

export type Drawable = ImageBitmap | HTMLImageElement;

const AHEAD = 14;
const BEHIND = 6;
const MAX_IN_FLIGHT = 3;

/** Decode a compressed frame. Falls back to <img> where createImageBitmap is missing. */
export async function decodeFrame(blob: Blob): Promise<Drawable> {
  if (typeof createImageBitmap === "function") return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // The decoded <img> keeps its pixels; the object URL is no longer needed.
    URL.revokeObjectURL(url);
  }
}

function release(d: Drawable) {
  if ("close" in d) d.close();
}

export class FrameDecoder {
  private ready = new Map<Blob, Drawable>();
  private inFlight = new Set<Blob>();
  private queue: Blob[] = [];
  private wanted = new Set<Blob>();
  private disposed = false;

  /**
   * @param getBlobs returns the live slot array (it can change as frames backfill)
   * @param onDecoded called whenever a wanted frame becomes drawable
   */
  constructor(
    private getBlobs: () => Blob[],
    private onDecoded: () => void,
  ) {}

  /** Decoded frame for slot `i`, if ready. */
  get(i: number): Drawable | undefined {
    const blob = this.getBlobs()[i];
    return blob ? this.ready.get(blob) : undefined;
  }

  /** Nearest decoded slot to `i` (searching outward), or -1. */
  nearestReady(i: number): number {
    const blobs = this.getBlobs();
    for (let d = 0; d < blobs.length; d++) {
      if (i - d >= 0 && this.ready.has(blobs[i - d])) return i - d;
      if (i + d < blobs.length && this.ready.has(blobs[i + d])) return i + d;
    }
    return -1;
  }

  /** Re-centre the window on slot `i`, moving in `direction` (+1 forward, −1 back). */
  focus(i: number, direction: 1 | -1) {
    if (this.disposed) return;
    const blobs = this.getBlobs();
    const order: Blob[] = [];
    const seen = new Set<Blob>();
    const add = (k: number) => {
      const b = blobs[k];
      if (b && !seen.has(b)) {
        seen.add(b);
        order.push(b);
      }
    };
    // Current frame and the one we blend toward first, then fan out ahead-biased.
    add(i);
    add(i + 1);
    for (let k = 1; k <= AHEAD; k++) {
      add(i + direction * k);
      if (k <= BEHIND) add(i - direction * k);
    }

    this.wanted = seen;
    for (const [blob, d] of this.ready) {
      if (!seen.has(blob)) {
        release(d);
        this.ready.delete(blob);
      }
    }
    this.queue = order.filter((b) => !this.ready.has(b) && !this.inFlight.has(b));
    this.pump();
  }

  private pump() {
    while (this.inFlight.size < MAX_IN_FLIGHT && this.queue.length > 0) {
      const blob = this.queue.shift()!;
      this.inFlight.add(blob);
      decodeFrame(blob).then(
        (d) => {
          this.inFlight.delete(blob);
          if (this.disposed || !this.wanted.has(blob)) release(d);
          else {
            this.ready.set(blob, d);
            this.onDecoded();
          }
          this.pump();
        },
        () => {
          this.inFlight.delete(blob);
          this.pump();
        },
      );
    }
  }

  dispose() {
    this.disposed = true;
    this.queue = [];
    for (const d of this.ready.values()) release(d);
    this.ready.clear();
  }
}
