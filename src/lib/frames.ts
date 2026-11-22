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
  count: number;
  width: number;
  height: number;
  padding: number;
  prefix: string;
  extension: string;
  basePath: string;
}

export interface FrameSequence {
  urls: string[];
  width: number;
  height: number;
}

export async function getFrameSequence(): Promise<FrameSequence> {
  const file = path.join(process.cwd(), "public", "frames", "manifest.json");
  const manifest = JSON.parse(await fs.readFile(file, "utf8")) as FrameManifest;

  if (!Number.isInteger(manifest.count) || manifest.count < 1) {
    throw new Error("frames/manifest.json: invalid frame count — run `npm run frames`.");
  }

  const urls = Array.from({ length: manifest.count }, (_, i) => {
    const n = String(i + 1).padStart(manifest.padding, "0");
    return `${manifest.basePath}${manifest.prefix}${n}${manifest.extension}`;
  });

  return { urls, width: manifest.width, height: manifest.height };
}
