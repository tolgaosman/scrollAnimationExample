#!/usr/bin/env node
/**
 * prepare-frames.mjs
 * ------------------------------------------------------------------
 * One-shot asset pipeline for the scroll-scrubbed canvas hero.
 *
 *  1. Locates the frame archive (first *.zip in the repo root or in
 *     ./assets-source) — or accepts an explicit path as argv[2].
 *  2. Extracts it into a throw-away temp directory (bsdtar ships with
 *     Windows 10+, macOS and most Linux distros and reads .zip files).
 *  3. Natural-sorts every JPEG it finds (so "frame-10" follows "frame-9"),
 *     then copies them to public/frames/frame_0001.jpg … frame_NNNN.jpg.
 *  4. Reads the pixel size of the first frame straight from the JPEG
 *     SOF marker (no image library needed) and writes
 *     public/frames/manifest.json — the single source of truth the
 *     runtime loader reads. No filenames are ever hard-coded in the app.
 *
 * Usage:  npm run frames            (auto-detect zip)
 *         node scripts/prepare-frames.mjs path/to/frames.zip
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "frames");
const PAD = 4;

function findZip() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  for (const dir of [ROOT, path.join(ROOT, "assets-source")]) {
    if (!fs.existsSync(dir)) continue;
    const zip = fs.readdirSync(dir).find((f) => f.toLowerCase().endsWith(".zip"));
    if (zip) return path.join(dir, zip);
  }
  throw new Error("No .zip archive found in the repo root or ./assets-source");
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

const zipPath = findZip();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "frames-"));
console.log(`› extracting ${path.relative(ROOT, zipPath)} → ${tmp}`);
execFileSync("tar", ["-xf", zipPath, "-C", tmp], { stdio: "inherit" });

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const frames = collectJpegs(tmp).sort((a, b) => collator.compare(path.basename(a), path.basename(b)));
if (frames.length === 0) throw new Error("Archive contained no JPEG frames");

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

frames.forEach((src, idx) => {
  const name = `frame_${String(idx + 1).padStart(PAD, "0")}.jpg`;
  fs.copyFileSync(src, path.join(OUT_DIR, name));
});

const { width, height } = jpegSize(fs.readFileSync(frames[0]));
const manifest = {
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
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`✓ ${frames.length} frames (${width}×${height}) → public/frames/`);
