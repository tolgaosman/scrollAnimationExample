# SURLARİÇİ // Lefkon Roasters & Atelier

A bilingual (Turkish-first, English) website for a fictional specialty coffee roastery inside the Venetian walls of Lefkoşa (Nicosia). The homepage is a **scroll-scrubbed `<canvas>`**: a three-group espresso machine comes apart into its components as you scroll. The code is meant to double as a reference implementation of that technique.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) · next-intl · zod · Playwright

## Run it

```bash
npm install
npm run frames     # one-off: unzip the frame archive → public/frames + manifest.json
npm run dev        # http://localhost:3000  (Turkish)  ·  /en  (English)
```

| Script | What it does |
|---|---|
| `npm run build` / `npm start` | Production build (every page is statically generated) |
| `npm run lint` · `npm run typecheck` | ESLint (unused vars and imports are errors) · `tsc` |
| `npm run verify` | Playwright smoke test against a running server (see below) |

## Routes

| Turkish (default, no prefix) | English |
|---|---|
| `/` Ana Sayfa | `/en` |
| `/cekirdekler` Çekirdekler | `/en/beans` |
| `/menu` Menü & Demleme | `/en/menu` |
| `/ekibimiz` Ekibimiz | `/en/team` |
| `/hakkimizda` Hakkımızda | `/en/about` |
| `/iletisim` İletişim | `/en/contact` |

Localized slugs live in [`src/i18n/routing.ts`](src/i18n/routing.ts). UI copy lives in [`messages/`](messages). Structured content such as beans, team, menu and timeline lives in [`src/content/`](src/content), with both locales side by side.

## How the scroll-scrubbed canvas works

Everything lives in [`src/components/scroll-machine/`](src/components/scroll-machine). Each file has one job:

| File | Responsibility |
|---|---|
| [`scripts/prepare-frames.mjs`](scripts/prepare-frames.mjs) | Unzips the JPEG sequence, natural-sorts it, renames it to `frame_0001.jpg…`, and writes `manifest.json` (count and pixel size, read from the JPEG header). |
| [`src/lib/frames.ts`](src/lib/frames.ts) | Reads the manifest at build time and hands the client a URL list, so no filename is hard-coded. |
| `useFramePreloader.ts` | Loads and `decode()`s the frames with a concurrency pool. Phones load every 2nd frame. Failed frames retry, then fall back to a neighbour. |
| `Preloader.tsx` | The 000 → 100 counter; it locks scroll until the frames are ready. |
| `ScrollMachine.tsx` | A 500vh section with a sticky 100svh stage. Its `useScroll` → `useSpring` chain produces one `progress` value that drives everything else. |
| `timeline.ts` | **The choreography, as data:** scroll→frame keyframes, phase windows, per-part anchor tracks, and fit/zoom per orientation. |
| `geometry.ts` | Pure cover/contain fit math plus `imageToScreen()`, shared by the canvas and the HTML overlays. |
| `FrameCanvas.tsx` | The render loop. It sizes the backing store for devicePixelRatio and paints at most once per animation frame, only when the frame index changes. It never triggers a React render while scrolling. |
| `drawFrame.ts` | Edge extension: the frame's own border pixels are stretched to fill any gap, so the studio background has no visible edge at any aspect ratio. |
| `PhaseOverlays.tsx` | The four story phases. Callout leader lines follow their part frame by frame (see `anchorAt`). |
| `Hud.tsx` | Frame counter and progress rail. |

### Ideas worth stealing

- **`<img>` + `decode()` over `ImageBitmap`.** 300 decoded 1280×720 bitmaps take about 1.1 GB of RAM. `<img>` elements keep only the compressed bytes and let the browser manage decoding.
- **Remap scroll to frames with keyframes, not a straight line.** The source footage spends half its length on slow drift. `FRAME_KEYS` spreads out the dramatic part.
- **One source of truth for layout.** The canvas and the overlays both call `computeFit()`, so callouts can point at real pixels.
- **Observe the mask, not the masked element.** A line clipped by `overflow: hidden` never intersects the viewport, so put `whileInView` on its wrapper. The comment in `src/components/ui/Reveal.tsx` explains this.

## Contact form and security

- The Server Action [`src/app/[locale]/iletisim/actions.ts`](src/app/%5Blocale%5D/iletisim/actions.ts) re-validates every input with the shared zod schema. It also strips unknown keys, applies a honeypot and a per-IP sliding-window rate limit, and never logs personal data.
- **No email or CRM backend is connected yet.** A valid submission is acknowledged but not delivered anywhere. Plug delivery in at the marked spot.
- The rate limit is in-memory. On multi-instance hosting, replace it with a shared store such as Redis or Upstash.
- Security headers are set in [`next.config.ts`](next.config.ts): CSP, HSTS, `X-Frame-Options: DENY`, nosniff, Referrer-Policy and Permissions-Policy. The CSP's `script-src` includes `'unsafe-inline'` because the pages are statically generated (per-request nonces would force dynamic rendering). No third-party origins are allowed.

## Verification

```bash
npm run build && npm start -- -p 3200
BASE_URL=http://localhost:3200 npm run verify                          # Playwright's Chromium
BASE_URL=http://localhost:3200 BROWSER_CHANNEL=msedge npm run verify   # or an installed Edge/Chrome
```

The verifier visits all 12 routes and fails on any console error, page error, failed request or HTTP 4xx/5xx. It also:

- confirms each `<h1>` is actually revealed;
- checks that the canvas paints and that its edges blend into the studio grey;
- scrolls through the four story phases;
- exercises the TR/EN switcher, bean filters and detail sheet, menu drawer, brew calculator and contact form;
- checks for horizontal overflow at 390, 768 and 1440 px.

Screenshots go to `verify-output/`.

## Deploy (Docker)

```bash
docker compose up -d --build        # serves on http://<server-ip>:4010
# or without compose:
docker build -t surlarici-web --build-arg NEXT_PUBLIC_SITE_URL=http://5.75.128.196:4010 .
docker run -d --name surlarici-web --restart unless-stopped -p 4010:4010 surlarici-web
```

- The image uses Next's `standalone` output and runs as a non-root user.
- `NEXT_PUBLIC_SITE_URL` is baked in at build time (canonical URLs, sitemap, hreflang).
- Over plain HTTP, leave `HTTPS_ONLY=0` (the default). Once a domain with TLS sits in front, rebuild with `--build-arg HTTPS_ONLY=1` to enable HSTS and `upgrade-insecure-requests`; otherwise the browser would rewrite asset URLs to https and break the page.

## Assets

`assets-source/` holds the original render: the start and end frames, the mp4 and the frame zip. `public/frames/` is generated from it by `npm run frames`.

> The business, people and address are fictional. The phone number is a placeholder.
