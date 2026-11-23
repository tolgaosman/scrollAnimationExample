import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Frame manifest (server-side)
 * ------------------------------------------------------------------
 * `npm run frames` writes public/frames/manifest.json. We read it here at
 * build time (pages are statically generated) and hand the client a plain,
 * serialisable description of the sequence. The client never guesses file
 * names — if the sequence is regenerated with a different length or size,
 * nothing in the app needs to change.
 */
export interface FrameManifest {
  /** Content hash of the sequence; busts caches whenever the frames change. */
  version?: string;
  count: number;
  width: number;
  height: number;
  padding: number;
  prefix: string;
  extension: string;
  basePath: string;
  generatedAt?: string;
}

export interface FrameSequence {
  urls: string[];
  width: number;
  height: number;
  /** Per-frame horizontal drift of the footage in source px (scripts/stabilize-frames.py). */
  shiftX?: number[];
  shiftY?: number[];
}

export async function getFrameSequence(): Promise<FrameSequence> {
  const file = path.join(process.cwd(), "public", "frames", "manifest.json");
  const manifest = JSON.parse(await fs.readFile(file, "utf8")) as FrameManifest;

  if (!Number.isInteger(manifest.count) || manifest.count < 1) {
    throw new Error("frames/manifest.json: invalid frame count — run `npm run frames`.");
  }

  // Frame file names are stable across regenerations and the files are cached
  // long-term, so every URL carries the sequence's content version. Without
  // it, browsers that cached an older sequence mix old and new frames.
  const version = manifest.version ?? manifest.generatedAt ?? "0";
  const urls = Array.from({ length: manifest.count }, (_, i) => {
    const n = String(i + 1).padStart(manifest.padding, "0");
    return `${manifest.basePath}${manifest.prefix}${n}${manifest.extension}?v=${encodeURIComponent(version)}`;
  });

  let shiftX: number[] | undefined;
  let shiftY: number[] | undefined;
  try {
    const raw = JSON.parse(await fs.readFile(path.join(process.cwd(), "public", "frames", "stabilize.json"), "utf8"));
    if (Array.isArray(raw.shiftX) && raw.shiftX.length === manifest.count) shiftX = raw.shiftX;
    if (Array.isArray(raw.shiftY) && raw.shiftY.length === manifest.count) shiftY = raw.shiftY;
  } catch {
    // optional: no stabilisation data
  }

  return { urls, width: manifest.width, height: manifest.height, shiftX, shiftY };
}
