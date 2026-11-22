#!/usr/bin/env node
/**
 * verify.mjs — end-to-end smoke test with Playwright.
 *
 *   BASE_URL=http://localhost:3100 node scripts/verify.mjs
 *   BROWSER_CHANNEL=msedge node scripts/verify.mjs   (use installed Edge/Chrome)
 *
 * Checks every route in both locales for HTTP 200, correct <html lang>, an
 * <h1>, zero console errors / page errors / failed requests; then exercises
 * the canvas hero (preload, non-blank paint, all four scroll phases), the
 * locale switcher, the menu drawer, the brew calculator and the contact form.
 * Screenshots land in ./verify-output.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = path.resolve("verify-output");
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = {
  tr: ["/", "/cekirdekler", "/menu", "/ekibimiz", "/hakkimizda", "/iletisim"],
  en: ["/en", "/en/beans", "/en/menu", "/en/team", "/en/about", "/en/contact"],
};

const failures = [];
const check = (cond, msg) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else {
    console.log(`  ✗ ${msg}`);
    failures.push(msg);
  }
};

const browser = await chromium.launch(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {});

async function newPage(viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const problems = [];
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => {
    // Aborted prefetches during navigation are not real failures.
    const err = r.failure()?.errorText ?? "";
    if (!/ERR_ABORTED|NS_BINDING_ABORTED/.test(err)) problems.push(`requestfailed: ${r.url()} ${err}`);
  });
  page.on("response", (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()}: ${r.url()}`));
  return { page, context, problems };
}

async function waitForPreloader(page) {
  await page.waitForSelector('[role="progressbar"]', { state: "detached", timeout: 60_000 });
}

/* ------------------------------------------------------------ routes */
for (const [locale, routes] of Object.entries(ROUTES)) {
  console.log(`\n■ Routes (${locale})`);
  for (const route of routes) {
    const { page, context, problems } = await newPage();
    const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
    check(res?.status() === 200, `${route} → 200`);
    check((await page.getAttribute("html", "lang")) === locale, `${route} lang=${locale}`);
    check((await page.locator("h1").count()) > 0, `${route} has <h1>`);
    if (route === "/" || route === "/en") await waitForPreloader(page);
    await page.waitForTimeout(1800);
    // Masked reveals must actually reveal: no line of the <h1> may still sit below its clip box.
    const h1Clipped = await page.evaluate(() => {
      const h = document.querySelector("h1");
      const box = h.getBoundingClientRect();
      return [...h.querySelectorAll("span")].some((s) => s.getBoundingClientRect().top > box.bottom - 2);
    });
    check(!h1Clipped, `${route} <h1> revealed (not stuck behind its mask)`);
    check(problems.length === 0, `${route} no console/network errors${problems.length ? `\n      ${problems.join("\n      ")}` : ""}`);
    await context.close();
  }
}

/* -------------------------------------------------------- canvas hero */
for (const locale of ["tr", "en"]) {
  console.log(`\n■ Canvas hero (${locale})`);
  const { page, context, problems } = await newPage();
  await page.goto(BASE + (locale === "tr" ? "/" : "/en"), { waitUntil: "domcontentloaded" });
  await waitForPreloader(page);
  await page.waitForSelector("canvas");

  const stats = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    const ctx = c.getContext("2d");
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 4 * 97) {
      const l = (data[i] + data[i + 1] + data[i + 2]) / 3;
      min = Math.min(min, l);
      max = Math.max(max, l);
    }
    // Seamless-edge check: the four borders must be studio grey, never black/empty.
    const px = (x, y) => {
      const i = (y * c.width + x) * 4;
      return (data[i] + data[i + 1] + data[i + 2]) / 3;
    };
    const borders = [];
    for (let x = 0; x < c.width; x += 37) borders.push(px(x, 0), px(x, c.height - 1));
    for (let y = 0; y < c.height; y += 37) borders.push(px(0, y), px(c.width - 1, y));
    return { w: c.width, h: c.height, range: max - min, darkestBorder: Math.min(...borders) };
  });
  check(stats.w > 0 && stats.h > 0, `canvas sized ${stats.w}×${stats.h}`);
  check(stats.range > 60, `canvas painted a frame (luma range ${stats.range.toFixed(0)})`);
  check(stats.darkestBorder > 120, `canvas edges blend into studio grey (darkest border luma ${stats.darkestBorder.toFixed(0)})`);

  const sectionHeight = await page.evaluate(() => document.querySelector("section").getBoundingClientRect().height);
  const vh = 900;
  const phases = [
    { p: 0.05, name: "hero", text: locale === "tr" ? "SURLARİÇİ" : "SURLARİÇİ" },
    { p: 0.36, name: "boiler", text: locale === "tr" ? "Bakır Isı Eşanjörlü Kazan" : "Copper Heat-Exchange Boiler" },
    { p: 0.61, name: "groups", text: locale === "tr" ? "3 Gruplu E61" : "Triple E61" },
    { p: 0.85, name: "pump", text: locale === "tr" ? "Döner Kanatlı Pompa" : "Rotary Vane Pump" },
  ];
  for (const ph of phases) {
    await page.evaluate((y) => window.scrollTo(0, y), ph.p * (sectionHeight - vh));
    await page.waitForTimeout(1400); // let the scrub spring settle
    const visible = await page.evaluate((txt) => {
      const el = [...document.querySelectorAll("h1, h2")].find((n) => n.textContent?.includes(txt));
      if (!el) return 0;
      let o = 1;
      for (let n = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
      return o;
    }, ph.text);
    check(visible > 0.6, `phase "${ph.name}" overlay visible (opacity ${visible.toFixed(2)})`);
    await page.screenshot({ path: path.join(OUT, `hero-${locale}-${ph.name}.png`) });
  }
  check(problems.length === 0, `hero no errors${problems.length ? `\n      ${problems.join("\n      ")}` : ""}`);
  await context.close();
}

/* ---------------------------------------------------- interactions */
console.log("\n■ Interactions");
{
  const { page, context, problems } = await newPage();

  // Locale switcher keeps you on the same page.
  await page.goto(BASE + "/cekirdekler", { waitUntil: "networkidle" });
  await page.locator('header button[lang="en"]').click();
  await page.waitForURL("**/en/beans", { timeout: 15_000 });
  check(page.url().endsWith("/en/beans"), "TR→EN switch maps /cekirdekler → /en/beans");

  // Bean filter + detail sheet.
  await page.getByRole("button", { name: "Micro-Lot" }).click();
  await page.waitForTimeout(600);
  check((await page.locator("main ul li button[aria-haspopup]").count()) === 2, "Micro-Lot filter shows 2 beans");
  await page.locator("main ul li button[aria-haspopup]").first().click();
  await page.waitForSelector('[role="dialog"] figure svg');
  check(true, "bean sheet opens with roast curve");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  // Drawer navigation. (The nav auto-hides while scrolled down; scrolling up reveals it.)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await page.locator("header button[aria-controls='menu-drawer']").click();
  await page.locator("#menu-drawer").getByRole("link", { name: "Team" }).click();
  await page.waitForURL("**/en/team", { timeout: 15_000 });
  check(page.url().endsWith("/en/team"), "drawer link navigates to /en/team");

  // Brew calculator.
  await page.goto(BASE + "/menu", { waitUntil: "networkidle" });
  await page.locator("#calculator").getByRole("button", { name: "Espresso" }).click();
  await page.waitForTimeout(1200);
  const water = await page.locator("#calculator p.display").first().innerText();
  check(water.replace(/\s/g, "").startsWith("36.0"), `espresso 18 g × 1:2 → 36.0 g (got "${water.trim()}")`);

  // Contact form: invalid then valid.
  await page.goto(BASE + "/en/contact", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "General" }).click();
  await page.getByRole("button", { name: "Send" }).click();
  await page.waitForSelector('[role="alert"]');
  check((await page.locator('[aria-invalid="true"]').count()) >= 3, "empty submit flags invalid fields");
  await page.getByLabel("Full name").fill("Deniz Test");
  await page.getByLabel("Email").fill("deniz@example.com");
  await page.getByLabel("Your message").fill("We would love to book a cupping session next week.");
  await page.getByRole("button", { name: "Send" }).click();
  await page.waitForSelector('[role="status"]', { timeout: 15_000 });
  check(true, "valid submit shows success state");

  check(problems.length === 0, `interactions no errors${problems.length ? `\n      ${problems.join("\n      ")}` : ""}`);
  await context.close();
}

/* ------------------------------------------------- responsive shots */
console.log("\n■ Responsive screenshots");
for (const [w, h] of [[390, 844], [768, 1024], [1440, 900]]) {
  const { page, context, problems } = await newPage({ width: w, height: h });
  for (const route of ["/", "/cekirdekler", "/menu", "/ekibimiz", "/hakkimizda", "/iletisim"]) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    if (route === "/") await waitForPreloader(page);
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 1, `${w}px ${route} no horizontal overflow (${overflow}px)`);
    // Scroll through like a visitor so in-view reveals fire before the full-page capture.
    if (route !== "/") {
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.6) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);
    }
    const name = route === "/" ? "home" : route.slice(1);
    await page.screenshot({ path: path.join(OUT, `${name}-${w}.png`), fullPage: route !== "/" });
    if (route === "/") {
      // Homepage below the hero: capture each section as the visitor would see it.
      const sections = await page.locator("main > section").count();
      for (let i = 1; i < sections; i++) {
        const s = page.locator("main > section").nth(i);
        await s.scrollIntoViewIfNeeded();
        const box = await s.boundingBox();
        // Pinned sections (sticky galleries) — sample their midpoint.
        if (box && box.height > h * 1.5) await page.evaluate((y) => window.scrollBy(0, y), box.height * 0.35);
        await page.waitForTimeout(1400);
        await page.screenshot({ path: path.join(OUT, `home-s${i}-${w}.png`) });
      }
    }
  }
  check(problems.length === 0, `${w}px no errors${problems.length ? `\n      ${problems.join("\n      ")}` : ""}`);
  await context.close();
}

await browser.close();
console.log(failures.length ? `\n✗ ${failures.length} check(s) failed` : "\n✓ all checks passed");
process.exit(failures.length ? 1 : 0);
