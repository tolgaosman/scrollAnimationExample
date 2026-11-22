#!/usr/bin/env node
/**
 * perf-mobile.mjs — scroll-jank benchmark for the canvas hero on a phone.
 *
 *   BASE_URL=http://localhost:3100 node scripts/perf-mobile.mjs [label]
 *
 * Emulates a 390×844 @3x touch device with 4× CPU throttling, then drives a
 * real compositor scroll gesture (CDP Input.synthesizeScrollGesture)
 * through the whole pinned hero. Reports:
 *   - frame times (rAF deltas): p50 / p95 / max, and frames slower than 33 ms
 *   - long tasks (>50 ms) on the main thread: count and total ms
 *   - distinct animation frames painted on the canvas
 *   - canvas backing-store size (sharpness: should equal CSS size × DPR)
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const label = process.argv[2] ?? "run";
const THROTTLE = Number(process.env.CPU_THROTTLE ?? 4);

const browser = await chromium.launch(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();

// Record which frame each canvas paint shows: prefer the explicit data-frame
// hook, fall back to the <img> src passed to drawImage.
await page.addInitScript(() => {
  window.__painted = new Set();
  const orig = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (img, ...rest) {
    if (img instanceof HTMLImageElement && this.canvas.isConnected) window.__painted.add(img.src);
    return orig.call(this, img, ...rest);
  };
  new MutationObserver((list) => {
    for (const m of list) if (m.attributeName === "data-frame") window.__painted.add("f" + m.target.dataset.frame);
  }).observe(document, { attributes: true, subtree: true, attributeFilter: ["data-frame"] });
});

await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
// Diagnostics: PERF_CSS="selector{display:none}" to rule a suspect in or out.
if (process.env.PERF_CSS) await page.addStyleTag({ content: process.env.PERF_CSS });
await page.waitForSelector('[role="progressbar"]', { state: "detached", timeout: 90_000 });
await page.waitForSelector("canvas");
await page.waitForTimeout(1500);

const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });

const distance = await page.evaluate(() => {
  const s = document.querySelector("section");
  return s.getBoundingClientRect().height - window.innerHeight;
});

// PERF_WARM=1: scroll the whole route once first, so one-off costs (first
// raster of each section, GPU shader compilation) don't count — isolates
// steady-state scrubbing performance.
if (process.env.PERF_WARM) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
}

await page.evaluate(() => {
  window.__painted.clear();
  window.__frames = [];
  window.__long = [];
  let last = performance.now();
  window.__slow = [];
  const tick = (t) => {
    window.__frames.push(t - last);
    if (t - last > 33.4) window.__slow.push(`${Math.round(t - last)}ms@y${Math.round(scrollY)}`);
    last = t;
    if (!window.__stop) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__long.push(e.duration);
  }).observe({ type: "longtask", buffered: false });
});

await cdp.send("Input.synthesizeScrollGesture", {
  x: 195,
  y: 600,
  yDistance: -Math.round(distance + Number(process.env.PERF_EXTRA ?? 0)),
  speed: 700,
  // Headless Chromium ignores synthetic *touch* scroll gestures; a wheel
  // gesture still scrolls on the compositor, which is what we measure.
  gestureSourceType: "mouse",
  preventFling: true,
});
await page.waitForTimeout(1200); // let the scrub spring settle

const result = await page.evaluate(() => {
  window.__stop = true;
  const f = window.__frames.slice(2).sort((a, b) => a - b);
  const q = (p) => f[Math.min(f.length - 1, Math.floor(p * f.length))] ?? 0;
  const c = document.querySelector("canvas");
  const r = c.getBoundingClientRect();
  return {
    frames: f.length,
    p50: +q(0.5).toFixed(1),
    p95: +q(0.95).toFixed(1),
    max: +(f[f.length - 1] ?? 0).toFixed(1),
    slowFrames: f.filter((d) => d > 33.4).length,
    slowAt: window.__slow.slice(1).join(" "),
    longTasks: window.__long.length,
    longTaskMs: Math.round(window.__long.reduce((a, b) => a + b, 0)),
    distinctPainted: window.__painted.size,
    canvas: `${c.width}×${c.height} for ${Math.round(r.width)}×${Math.round(r.height)} css @${devicePixelRatio}x`,
    scrolledTo: Math.round(scrollY),
    coarsePointer: matchMedia("(pointer: coarse)").matches,
  };
});

console.log(JSON.stringify({ label, throttle: THROTTLE, distance: Math.round(distance), ...result }, null, 2));
await browser.close();
