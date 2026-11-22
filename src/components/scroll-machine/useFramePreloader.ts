"use client";

/**
 * useFramePreloader — fetch + decode an image sequence before scrubbing.
 * ------------------------------------------------------------------
 * Each frame is kept as its compressed bytes (a Blob, ~48 KB) plus an <img>
 * made from them — no second download. FrameCanvas decodes the frames around
 * the scroll position from the Blobs into ImageBitmaps (off the main thread;
 * note createImageBitmap(<img>) is NOT — it decodes on the main thread in
 * Chrome) and paints those. If a bitmap isn't ready, it paints the <img>, so
 * the exact frame is always on screen. Memory stays modest: 240 decoded
 * 1280×720 frames would be ~880 MB, the bytes are ~11 MB.
 *
 * Loading strategy:
 *   - A small concurrency pool (6) — enough to saturate HTTP/1.1 per-host
 *     limits without starving the main thread with decode callbacks.
 *   - Narrow screens load every 2nd frame first; the hero unlocks as soon as
 *     that half is in, then the remaining frames stream in the background and
 *     slot into place. Until a frame arrives, its slot borrows the nearest
 *     loaded neighbour, so the animation is never missing a frame.
 *     Save-Data users only ever get the half set.
 *   - Failed frames retry twice, then keep borrowing their neighbour.
 *   - Results are memoised per URL list at module level: navigating away and
 *     back to the homepage is instant, with no second preloader.
 */
import { useEffect, useState } from "react";

const CONCURRENCY = 6;
const BACKFILL_CONCURRENCY = 3;
const RETRIES = 2;

/** One loaded frame: its compressed bytes and an <img> made from them. */
export interface Frame {
  /** Decoded off the main thread into an ImageBitmap by FrameCanvas. */
  blob: Blob;
  /** Fallback that can always be painted (possibly with a synchronous decode). */
  img: HTMLImageElement;
}

export interface FrameStore {
  /** One entry per frame; a slot that hasn't loaded yet holds a neighbour's frame. */
  frames: Frame[];
  /** Bumped whenever a background-loaded frame replaces a borrowed slot. */
  version: number;
}

interface PreloadState {
  store: FrameStore | null;
  /** 0–1 */
  progress: number;
  ready: boolean;
}

const cache = new Map<string, FrameStore>();

function pickStride(): { stride: number; backfill: boolean } {
  if (typeof window === "undefined") return { stride: 1, backfill: false };
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return { stride: 2, backfill: false };
  return window.matchMedia("(max-width: 767px)").matches
    ? { stride: 2, backfill: true }
    : { stride: 1, backfill: false };
}

/** Indices for the first pass: every `stride`-th frame, always including the last one. */
function firstPass(count: number, stride: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i += stride) out.push(i);
  if (out[out.length - 1] !== count - 1) out.push(count - 1);
  return out;
}

async function loadFrame(src: string): Promise<Frame> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${src}`);
      const blob = await res.blob();
      const img = new Image();
      img.decoding = "async";
      // Lives as long as the cached store (i.e. the page session).
      img.src = URL.createObjectURL(blob);
      await img.decode(); // validates the file and warms the decode cache
      return { blob, img };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/** Point every empty slot at the nearest loaded frame. */
function fillHoles(loaded: (Frame | undefined)[]): Frame[] {
  const have = loaded.map((frame, i) => (frame ? i : -1)).filter((i) => i >= 0);
  if (have.length === 0) return [];
  return loaded.map((frame, i) => {
    if (frame) return frame;
    const nearest = have.reduce((a, c) => (Math.abs(c - i) < Math.abs(a - i) ? c : a));
    return loaded[nearest]!;
  });
}

/** Run `job` over `items` with at most `limit` in flight. */
async function pool<T>(items: T[], limit: number, job: (item: T) => Promise<void>, cancelled: () => boolean) {
  let next = 0;
  const worker = async () => {
    while (!cancelled() && next < items.length) await job(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

/** Stream the frames skipped by the first pass into an existing store. */
function backfill(urls: string[], store: FrameStore, loaded: (Frame | undefined)[], indices: number[]) {
  void pool(
    indices,
    BACKFILL_CONCURRENCY,
    async (i) => {
      try {
        loaded[i] = await loadFrame(urls[i]);
      } catch {
        return; // keeps borrowing its neighbour
      }
      const filled = fillHoles(loaded);
      for (let k = 0; k < filled.length; k++) store.frames[k] = filled[k];
      store.version++;
    },
    () => false, // keep going after unmount: the store is cached for next time
  );
}

export function useFramePreloader(urls: string[]): PreloadState {
  const key = urls.join("|");
  const [state, setState] = useState<PreloadState>(() => {
    const hit = cache.get(key);
    return hit ? { store: hit, progress: 1, ready: true } : { store: null, progress: 0, ready: false };
  });

  useEffect(() => {
    if (cache.has(key)) return;

    let cancelled = false;
    const { stride, backfill: wantsBackfill } = pickStride();
    const first = firstPass(urls.length, stride);
    const loaded: (Frame | undefined)[] = new Array(urls.length);
    let done = 0;
    let lastReported = -1;

    const report = () => {
      // Only push a React update when the visible percentage changes.
      const pct = Math.floor((done / first.length) * 100);
      if (pct !== lastReported && !cancelled) {
        lastReported = pct;
        setState((s) => ({ ...s, progress: done / first.length }));
      }
    };

    void (async () => {
      await pool(
        first,
        CONCURRENCY,
        async (i) => {
          try {
            loaded[i] = await loadFrame(urls[i]);
          } catch {
            loaded[i] = undefined; // patched by fillHoles()
          }
          done++;
          report();
        },
        () => cancelled,
      );
      if (cancelled) return;

      const frames = fillHoles(loaded);
      if (frames.length === 0) {
        setState({ store: null, progress: 1, ready: true });
        return;
      }
      const store: FrameStore = { frames, version: 0 };
      cache.set(key, store);
      setState({ store, progress: 1, ready: true });

      if (wantsBackfill) {
        const firstSet = new Set(first);
        const rest = urls.map((_, i) => i).filter((i) => !firstSet.has(i));
        backfill(urls, store, loaded, rest);
      }
    })();

    return () => {
      cancelled = true;
    };
    // `key` is a stable fingerprint of `urls`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
