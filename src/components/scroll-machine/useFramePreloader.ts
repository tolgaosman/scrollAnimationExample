"use client";

/**
 * useFramePreloader — zero-barrier instant-first-frame progressive loader.
 * ------------------------------------------------------------------
 * Never blocks the page with a curtain:
 *   1. Immediately fetches & decodes `urls[0]` and publishes a valid `store`
 *      on frame 0 so the canvas paints right away (~80–150 ms).
 *   2. Streams a sparse keyframe wave (stride 10, concurrency 16) so scrubbing
 *      anywhere in the page immediately responds smoothly.
 *   3. Refines the remaining frames silently in the background (stride 5 → 2 → 1)
 *      bumping `store.version` as each frame slots in.
 */
import { useEffect, useState } from "react";

const BOOT_CONCURRENCY = 16;
const BACKFILL_CONCURRENCY = 8;
const RETRIES = 2;

export interface Frame {
  blob: Blob;
  img: HTMLImageElement;
}

export interface FrameStore {
  frames: Frame[];
  version: number;
}

interface PreloadState {
  store: FrameStore | null;
  progress: number;
  ready: boolean;
}

const cache = new Map<string, FrameStore>();

function waveOrder(count: number, skip: Set<number>): number[] {
  const out: number[] = [];
  const seen = new Set(skip);
  const add = (i: number) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i);
      out.push(i);
    }
  };
  add(count - 1);
  for (const step of [10, 5, 2, 1]) {
    for (let i = 0; i < count; i += step) add(i);
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

function fillHoles(loaded: (Frame | undefined)[]): Frame[] {
  const n = loaded.length;
  const out = new Array<Frame | undefined>(n);
  const dist = new Int32Array(n);
  let lastIdx = -1;

  // Forward pass: carry nearest loaded frame on the left.
  for (let i = 0; i < n; i++) {
    if (loaded[i]) {
      lastIdx = i;
      out[i] = loaded[i];
      dist[i] = 0;
    } else if (lastIdx >= 0) {
      out[i] = loaded[lastIdx];
      dist[i] = i - lastIdx;
    } else {
      dist[i] = n + 1;
    }
  }
  if (lastIdx < 0) return [];

  // Backward pass: replace with closer loaded frame on the right.
  let nextIdx = -1;
  for (let i = n - 1; i >= 0; i--) {
    if (loaded[i]) {
      nextIdx = i;
    } else if (nextIdx >= 0 && nextIdx - i < dist[i]) {
      out[i] = loaded[nextIdx];
    }
  }
  return out as Frame[];
}

async function pool<T>(items: T[], limit: number, job: (item: T) => Promise<void>, cancelled: () => boolean) {
  let next = 0;
  const worker = async () => {
    while (!cancelled() && next < items.length) await job(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

export function useFramePreloader(urls: string[]): PreloadState {
  const key = urls.join("|");
  const [state, setState] = useState<PreloadState>(() => {
    const hit = cache.get(key);
    return hit ? { store: hit, progress: 1, ready: true } : { store: null, progress: 0, ready: false };
  });

  useEffect(() => {
    if (cache.has(key) || urls.length === 0) return;

    let cancelled = false;
    let flushRaf = 0;
    const loaded: (Frame | undefined)[] = new Array<Frame | undefined>(urls.length).fill(undefined);

    void (async () => {
      // 1. Instant frame 0 — unlock canvas right away without waiting for the rest.
      try {
        loaded[0] = await loadFrame(urls[0]);
      } catch {
        if (!cancelled) setState({ store: null, progress: 1, ready: true });
        return;
      }
      if (cancelled) return;

      const store: FrameStore = { frames: fillHoles(loaded), version: 0 };
      cache.set(key, store);
      setState({ store, progress: 0.1, ready: true });

      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      const allRest = waveOrder(urls.length, new Set([0]));
      const bootCount = Math.min(24, allRest.length);
      const bootWave = allRest.slice(0, bootCount);
      const refineWave = conn?.saveData ? [] : allRest.slice(bootCount);

      const flush = () => {
        flushRaf = 0;
        const filled = fillHoles(loaded);
        for (let k = 0; k < filled.length; k++) store.frames[k] = filled[k];
        store.version++;
      };

      const ingest = (i: number, frame: Frame) => {
        loaded[i] = frame;
        if (!flushRaf) flushRaf = requestAnimationFrame(flush);
      };

      // 2. High-concurrency keyframe wave
      await pool(
        bootWave,
        BOOT_CONCURRENCY,
        async (i) => {
          try {
            const f = await loadFrame(urls[i]);
            ingest(i, f);
          } catch {
            // keeps borrowing nearest neighbour
          }
        },
        () => false,
      );

      // 3. Background full-density refinement
      if (refineWave.length > 0) {
        await pool(
          refineWave,
          BACKFILL_CONCURRENCY,
          async (i) => {
            try {
              const f = await loadFrame(urls[i]);
              ingest(i, f);
            } catch {
              // keeps borrowing nearest neighbour
            }
          },
          () => false,
        );
      }
    })();

    return () => {
      cancelled = true;
      if (flushRaf) cancelAnimationFrame(flushRaf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
