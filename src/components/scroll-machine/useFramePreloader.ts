"use client";

/**
 * useFramePreloader — fetch + decode an image sequence before scrubbing.
 * ------------------------------------------------------------------
 * Why HTMLImageElement and not ImageBitmap?
 *   300 decoded 1280×720 RGBA bitmaps ≈ 1.1 GB of RAM. ImageBitmaps pin that
 *   memory. <img> elements keep the *compressed* bytes (~6 MB here) and let
 *   the browser's decoded-image cache decide what stays hot; drawImage()
 *   on an evicted image re-decodes a small JPEG in a few ms. `img.decode()`
 *   up front guarantees every file is valid and warms that cache.
 *
 * Other details:
 *   - A small concurrency pool (6) — enough to saturate HTTP/1.1 per-host
 *     limits without starving the main thread with decode callbacks.
 *   - Narrow screens / Save-Data load every 2nd frame (stride). The timeline
 *     works in normalised 0–1 frame positions, so nothing else changes.
 *   - Failed frames retry twice, then borrow their nearest loaded neighbour,
 *     so a single 404 never leaves a black hole in the animation.
 *   - Results are memoised per URL list at module level: navigating away and
 *     back to the homepage is instant, with no second preloader.
 */
import { useEffect, useState } from "react";

const CONCURRENCY = 6;
const RETRIES = 2;

interface PreloadState {
  images: HTMLImageElement[];
  /** 0–1 */
  progress: number;
  ready: boolean;
}

const cache = new Map<string, HTMLImageElement[]>();

function pickStride(): number {
  if (typeof window === "undefined") return 1;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return 2;
  return window.matchMedia("(max-width: 767px)").matches ? 2 : 1;
}

function strided(urls: string[], stride: number): string[] {
  if (stride <= 1) return urls;
  const out = urls.filter((_, i) => i % stride === 0);
  // Always keep the final frame so the teardown ends on the true last frame.
  if (out[out.length - 1] !== urls[urls.length - 1]) out.push(urls[urls.length - 1]);
  return out;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      await img.decode();
      return img;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/** Replace holes (failed frames) with the nearest successfully loaded frame. */
function fillHoles(list: (HTMLImageElement | undefined)[]): HTMLImageElement[] {
  const loaded = list.map((img, i) => (img ? i : -1)).filter((i) => i >= 0);
  if (loaded.length === 0) return [];
  return list.map((img, i) => {
    if (img) return img;
    const nearest = loaded.reduce((a, b) => (Math.abs(b - i) < Math.abs(a - i) ? b : a));
    return list[nearest]!;
  });
}

export function useFramePreloader(urls: string[]): PreloadState {
  const key = urls.join("|");
  const [state, setState] = useState<PreloadState>(() => {
    const hit = cache.get(key);
    return hit ? { images: hit, progress: 1, ready: true } : { images: [], progress: 0, ready: false };
  });

  useEffect(() => {
    if (cache.has(key)) return;

    let cancelled = false;
    const list = strided(urls, pickStride());
    const results: (HTMLImageElement | undefined)[] = new Array(list.length);
    let next = 0;
    let done = 0;
    let lastReported = -1;

    const report = () => {
      // Only push a React update when the visible percentage changes.
      const pct = Math.floor((done / list.length) * 100);
      if (pct !== lastReported && !cancelled) {
        lastReported = pct;
        setState((s) => ({ ...s, progress: done / list.length }));
      }
    };

    const worker = async () => {
      while (!cancelled && next < list.length) {
        const i = next++;
        try {
          results[i] = await loadImage(list[i]);
        } catch {
          results[i] = undefined; // patched by fillHoles()
        }
        done++;
        report();
      }
    };

    Promise.all(Array.from({ length: Math.min(CONCURRENCY, list.length) }, worker)).then(() => {
      if (cancelled) return;
      const images = fillHoles(results);
      if (images.length) cache.set(key, images);
      setState({ images, progress: 1, ready: true });
    });

    return () => {
      cancelled = true;
    };
    // `key` is a stable fingerprint of `urls`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
