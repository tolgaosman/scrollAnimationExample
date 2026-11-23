"use client";

/**
 * useFramePreloader — fast two-stage progressive image-sequence loader.
 * ------------------------------------------------------------------
 * Stage 1 (Boot): fetches a sparse keyframe pass (stride 10 → ~25 frames,
 * always including frame 0 and the final frame) with high concurrency (16).
 * As soon as those ~25 keyframes decode (~300–600 ms), `fillHoles()` maps
 * every slot to its nearest loaded keyframe and unlocks the hero immediately.
 *
 * Stage 2 (Background refinement): streams the remaining frames in
 * progressively finer passes (stride 5 → stride 2 → remaining) without
 * blocking the UI, bumping `store.version` as each frame arrives.
 */
import { useEffect, useState } from "react";

const BOOT_CONCURRENCY = 16;
const BACKFILL_CONCURRENCY = 8;
const RETRIES = 2;

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

function pickStrategy(): { bootStride: number; backfill: boolean } {
  if (typeof window === "undefined") return { bootStride: 10, backfill: true };
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return { bootStride: 6, backfill: false };
  return { bootStride: 10, backfill: true };
}

/** Indices for the boot pass: frame 0, last frame, then every `stride`-th frame. */
function bootIndices(count: number, stride: number): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  const add = (i: number) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i);
      out.push(i);
    }
  };
  add(0);
  add(count - 1);
  for (let i = 0; i < count; i += stride) add(i);
  return out;
}

/** Order remaining indices in progressively finer stride waves (5 → 2 → 1). */
function refinementOrder(count: number, loadedSet: Set<number>): number[] {
  const out: number[] = [];
  const seen = new Set(loadedSet);
  for (const step of [5, 2, 1]) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        out.push(i);
      }
    }
  }
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
      img.src = URL.createObjectURL(blob);
      await img.decode();
      return { blob, img };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/**
 * Point every empty slot at the nearest loaded frame. Uses Array.from rather
 * than .map so that holes in a sparse array are visited (and filled) too —
 * .map skips them and would leave `undefined` slots for the canvas to paint.
 */
function fillHoles(loaded: (Frame | undefined)[]): Frame[] {
  const have: number[] = [];
  for (let i = 0; i < loaded.length; i++) if (loaded[i]) have.push(i);
  if (have.length === 0) return [];
  return Array.from({ length: loaded.length }, (_, i) => {
    const frame = loaded[i];
    if (frame) return frame;
    const nearest = have.reduce((a, c) => (Math.abs(c - i) < Math.abs(a - i) ? c : a));
    return loaded[nearest]!;
  });
}

async function pool<T>(items: T[], limit: number, job: (item: T) => Promise<void>, cancelled: () => boolean) {
  let next = 0;
  const worker = async () => {
    while (!cancelled() && next < items.length) await job(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

function backfill(urls: string[], store: FrameStore, loaded: (Frame | undefined)[], indices: number[]) {
  void pool(
    indices,
    BACKFILL_CONCURRENCY,
    async (i) => {
      try {
        loaded[i] = await loadFrame(urls[i]);
      } catch {
        return;
      }
      const filled = fillHoles(loaded);
      for (let k = 0; k < filled.length; k++) store.frames[k] = filled[k];
      store.version++;
    },
    () => false,
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
    const { bootStride, backfill: wantsBackfill } = pickStrategy();
    const first = bootIndices(urls.length, bootStride);
    const loaded: (Frame | undefined)[] = new Array<Frame | undefined>(urls.length).fill(undefined);
    let done = 0;
    let lastReported = -1;

    const report = () => {
      const pct = Math.floor((done / first.length) * 100);
      if (pct !== lastReported && !cancelled) {
        lastReported = pct;
        setState((s) => ({ ...s, progress: done / first.length }));
      }
    };

    void (async () => {
      await pool(
        first,
        BOOT_CONCURRENCY,
        async (i) => {
          try {
            loaded[i] = await loadFrame(urls[i]);
          } catch {
            loaded[i] = undefined;
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
        const rest = refinementOrder(urls.length, new Set(first));
        backfill(urls, store, loaded, rest);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
