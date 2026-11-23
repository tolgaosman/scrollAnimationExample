#!/usr/bin/env node
/**
 * prepare-frames.mjs
 * ------------------------------------------------------------------
 * One-shot asset pipeline for the scroll-scrubbed canvas hero.
 *
 * Preferred source: the master video (first *.mp4 in ./assets-source).
 *  - Frames are decoded straight from the video with ffmpeg (ffmpeg-static)
 *    at its native frame rate and written once, at high JPEG quality.
 *    That's one lossy step instead of two (video → online splitter → JPEG),
 *    and no duplicated frames from a splitter resampling 24 → 30 fps.
 *
 * Fallback source: a frame archive (first *.zip in the repo root or in
 * ./assets-source), when no video or no ffmpeg binary is available.
 *  1. Extracts it into a throw-away temp directory (bsdtar ships with
 *     Windows 10+, macOS and most Linux distros and reads .zip files).
 *  2. Natural-sorts every JPEG it finds (so "frame-10" follows "frame-9"),
 *     then copies them to public/frames/frame_0001.jpg … frame_NNNN.jpg.
 *
 * Either way it then reads the pixel size of the first frame straight from
 * the JPEG SOF marker (no image library needed) and writes
 * public/frames/manifest.json — the single source of truth the runtime
 * loader reads. No filenames are ever hard-coded in the app.
 *
 * Usage:  npm run frames                         (auto-detect mp4, else zip)
 *         node scripts/prepare-frames.mjs path/to/video.mp4|frames.zip
 *         FRAME_QUALITY=3 npm run frames         (ffmpeg -q:v, 2 = best … 31; default 4)
 */
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "frames");
const PAD = 4;

// q:v 2 at 1600×900 preserves razor-sharp metallic & walnut grain detail with
// virtually zero JPEG compression artefacts.
const QUALITY = process.env.FRAME_QUALITY ?? "2";

// Ultra-crisp 1600×900 Lanczos upscale + multi-band unsharp masking + studio
// color/contrast calibration (no temporal blur, so pouring espresso & hand
// motion stay razor-sharp on every single frame).
const FILTER =
  process.env.FRAME_FILTER ??
  "scale=1600:900:flags=lanczos,unsharp=7:7:1.15:3:3:0.35,eq=contrast=1.09:brightness=-0.012:saturation=1.12";

function findSource() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  const dirs = [path.join(ROOT, "assets-source"), ROOT].filter((d) => fs.existsSync(d));
  for (const ext of [".mp4", ".zip"]) {
    for (const dir of dirs) {
      const hit = fs.readdirSync(dir).find((f) => f.toLowerCase().endsWith(ext));
      if (hit) return path.join(dir, hit);
    }
  }
  throw new Error("No .mp4 video or .zip archive found in ./assets-source or the repo root");
}

async function findFfmpeg() {
  try {
    return (await import("ffmpeg-static")).default;
  } catch {
    return null;
  }
}

/** Recursively collect JPEG paths below `dir`. */
function collectJpegs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectJpegs(full);
    return /\.jpe?g$/i.test(entry.name) ? [full] : [];
  });
}

/** Read width/height from the first SOFn marker of a JPEG buffer. */
function jpegSize(buf) {
  let i = 2; // skip SOI (FFD8)
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    // SOF0..SOF15 except DHT(C4), JPG(C8), DAC(CC)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  throw new Error("Could not find SOF marker — is this a valid JPEG?");
}

const source = findSource();
const ffmpeg = source.toLowerCase().endsWith(".mp4") ? await findFfmpeg() : null;
if (source.toLowerCase().endsWith(".mp4") && !ffmpeg) {
  throw new Error("Found a video but no ffmpeg binary — run `npm install` (ffmpeg-static) or pass a .zip");
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "frames-"));
let frames;
if (ffmpeg) {
  console.log(`› decoding ${path.relative(ROOT, source)} with ffmpeg (q:v ${QUALITY}${FILTER ? `, ${FILTER}` : ""}) → ${tmp}`);
  execFileSync(
    ffmpeg,
    [
      "-hide_banner", "-loglevel", "error",
      "-i", source,
      "-an",
      "-fps_mode", "passthrough", // every source frame exactly once, no dupes/drops
      ...(FILTER ? ["-vf", FILTER] : []),
      "-q:v", QUALITY,
      path.join(tmp, `frame_%0${PAD}d.jpg`),
    ],
    { stdio: "inherit" },
  );
  frames = collectJpegs(tmp).sort();
  // Ensure the espresso glass handle (present from frame 78 onward in the
  // source video) is seamlessly composited onto frames 1..77.
  const patchScript = path.join(ROOT, "scripts", "patch-cup-handle.py");
  if (fs.existsSync(patchScript)) {
    try {
      execFileSync("python", [patchScript, tmp], { stdio: "inherit" });
    } catch {
      console.warn("⚠ Could not run patch-cup-handle.py (Python/Pillow not available)");
    }
  }
} else {
  console.log(`› extracting ${path.relative(ROOT, source)} → ${tmp}`);
  execFileSync("tar", ["-xf", source, "-C", tmp], { stdio: "inherit" });
  const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
  frames = collectJpegs(tmp).sort((a, b) => collator.compare(path.basename(a), path.basename(b)));
}
if (frames.length === 0) throw new Error("Source produced no JPEG frames");

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

let bytes = 0;
// Content hash of the whole sequence → `version`, appended to every frame URL
// as ?v=… The file names never change between regenerations, and frames are
// cached for a long time — without this, a returning visitor gets a mix of
// old cached frames and new ones (two different timelines interleaved: the
// machine jumps back and forth).
const hash = crypto.createHash("sha256");
frames.forEach((src, idx) => {
  const name = `frame_${String(idx + 1).padStart(PAD, "0")}.jpg`;
  const buf = fs.readFileSync(src);
  fs.writeFileSync(path.join(OUT_DIR, name), buf);
  hash.update(buf);
  bytes += buf.length;
});
const version = hash.digest("hex").slice(0, 12);

const { width, height } = jpegSize(fs.readFileSync(frames[0]));
const manifest = {
  version,
  count: frames.length,
  width,
  height,
  padding: PAD,
  prefix: "frame_",
  extension: ".jpg",
  basePath: "/frames/",
  generatedAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const zeros = Array.from({ length: frames.length }, () => 0);
fs.writeFileSync(
  path.join(OUT_DIR, "stabilize.json"),
  JSON.stringify({ shiftX: zeros, shiftY: zeros }) + "\n",
);
fs.rmSync(tmp, { recursive: true, force: true });

const mb = (bytes / 1024 / 1024).toFixed(1);
const kb = Math.round(bytes / frames.length / 1024);
console.log(`✓ ${frames.length} frames (${width}×${height}, ${mb} MB, ~${kb} KB/frame) → public/frames/`);
