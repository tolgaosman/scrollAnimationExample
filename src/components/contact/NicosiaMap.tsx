"use client";

/**
 * NicosiaMap — architectural cartographic plate of walled Nicosia (Lefkoşa Surlariçi).
 * Layered 1567 Venetian eleven-bastion fortification, limestone parchment relief,
 * principal & secondary old-town lanes, subtle hatched buffer corridor, interactive
 * map pins with animated copper walking routes to the atelier, and crisp HTML callouts.
 */
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { bastionPath } from "@/components/brand/WallMark";
import { ease } from "@/lib/motion";

type LandmarkKey = "us" | "arasta" | "buyukhan" | "selimiye" | "kyrenia";

interface LandmarkMeta {
  x: number;
  y: number;
  walkMin?: number;
  /** Schematic walking path from this landmark to Cyprus Roasters Atelier. */
  routeToUs?: string;
  /** Flip callout below pin when near the top edge of the map. */
  labelBelow?: boolean;
}

const LANDMARKS: Record<LandmarkKey, LandmarkMeta> = {
  us: { x: 3.5, y: -11 },
  arasta: {
    x: 5,
    y: -5.5,
    walkMin: 1,
    routeToUs: "M5,-5.5 Q4.2,-8.2 3.5,-11",
  },
  buyukhan: {
    x: -3.5,
    y: -8,
    walkMin: 2,
    routeToUs: "M-3.5,-8 Q0,-9.8 3.5,-11",
  },
  selimiye: {
    x: 13.5,
    y: -3,
    walkMin: 3,
    routeToUs: "M13.5,-3 Q9,-5.2 5,-5.5 Q4.2,-8.2 3.5,-11",
  },
  kyrenia: {
    x: -7,
    y: -40.5,
    walkMin: 7,
    routeToUs: "M-7,-40.5 C-5.5,-28 -4.5,-18 -3.5,-8 Q0,-9.8 3.5,-11",
    labelBelow: true,
  },
};

const LANDMARK_ORDER: LandmarkKey[] = ["us", "arasta", "buyukhan", "selimiye", "kyrenia"];

const MOAT_OUTER = bastionPath(45.2);
const MOAT_INNER = bastionPath(42.6);
const WALL_MAIN = bastionPath(40);
const WALL_PARAPET = bastionPath(37.6);

// Principal radial & cross-city streets (schematic).
const PRIMARY_STREETS = [
  "M-7,-40.5 C-6,-28 -4.5,-18 -3.5,-8 S1,5 0.5,12", // Girne Caddesi → Ledra
  "M-36,-14 C-22,-12 -12,-9 -3.5,-8 S10,-4 13.5,-3 S28,0 36.5,4", // East–West spine
  "M-3.5,-8 C2,-14 8,-20 14,-31",
  "M13.5,-3 C16,-12 22,-20 30,-26",
  "M-3.5,-8 C-12,-18 -20,-26 -26,-30",
];

// Fine secondary old-town lanes around Arasta, Selimiye & Büyük Han.
const SECONDARY_LANES = [
  "M-16,-22 C-10,-16 -2,-15 3.5,-11 S12,-10 19,-14",
  "M-18,-2 C-10,-3 -2,-5 5,-5.5 S16,-10 24,-12",
  "M2,-27 C5,-20 5,-15 3.5,-11",
  "M-22,18 C-10,16 4,18 18,16",
  "M-8,12 C-6,22 -4,29 -3,35",
  "M10,12 C12,21 15,28 19,33",
];

const BUFFER_PATH = "M-62,7.5 C-42,4.5 -28,10 -14,7.2 S6,11.5 18,8.8 S42,12.2 62,8.5";

const VB_X = -66;
const VB_Y = -58;
const VB_W = 132;
const VB_H = 116;

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=35.1761,33.3636";

export function NicosiaMap() {
  const t = useTranslations("contact.map");
  const uid = useId().replace(/:/g, "");
  // Nothing is selected until the visitor hovers or clicks a landmark. A hovered
  // or clicked landmark stays selected after the pointer leaves; clicking empty
  // map space clears the selection (and with it the label and route).
  const [focus, setFocus] = useState<LandmarkKey | null>(null);

  const activeLandmark = focus ? LANDMARKS[focus] : null;
  const pillLeft = activeLandmark ? ((activeLandmark.x - VB_X) / VB_W) * 100 : 0;
  const pillTop = activeLandmark ? ((activeLandmark.y - VB_Y) / VB_H) * 100 : 0;

  return (
    <figure className="overflow-hidden border border-ink/15 bg-paper-deep/55">
      {/* Top architectural cartographic header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/12 bg-paper/75 px-4 py-2.5">
        <span className="eyebrow flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-ink">
          <span className="block size-1.5 rounded-full bg-copper" aria-hidden="true" />
          {t("walls")}
        </span>
        <span className="num text-[0.68rem] tracking-wider text-ink-soft">{t("coords")}</span>
      </div>

      {/* Interactive SVG Map Stage */}
      <div className="relative aspect-[132/116] w-full overflow-hidden lg:aspect-auto lg:h-[min(46svh,28rem)] bg-gradient-to-b from-paper-deep/70 via-paper-deep/45 to-stone-light/40">
        <svg
          viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
          className="h-full w-full select-none"
          onClick={() => setFocus(null)}
          role="img"
          aria-label={t("title")}
        >
          <defs>
            {/* Warm Nicosia limestone parchment gradient inside the walls */}
            <radialGradient id={`stone-fill-${uid}`} cx="48%" cy="44%" r="58%">
              <stop offset="0%" stopColor="#efe7d4" />
              <stop offset="68%" stopColor="#dfd0b2" />
              <stop offset="100%" stopColor="#cbb68f" />
            </radialGradient>

            {/* Recessed outer moat ring gradient */}
            <radialGradient id={`moat-fill-${uid}`} cx="50%" cy="50%" r="54%">
              <stop offset="72%" stopColor="#c7bea8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#b5ab96" stopOpacity="0.18" />
            </radialGradient>

            {/* Soft architectural elevation shadow under the Venetian walls */}
            <filter id={`wall-shadow-${uid}`} x="-12%" y="-12%" width="124%" height="124%">
              <feDropShadow dx="0" dy="1.4" stdDeviation="1.6" floodColor="#1c1814" floodOpacity="0.14" />
            </filter>

            {/* Subtle 45° diagonal hatch for the buffer corridor */}
            <pattern
              id={`buffer-hatch-${uid}`}
              width="2.4"
              height="2.4"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="2.4" stroke="#6c7278" strokeWidth="0.45" strokeOpacity="0.55" />
            </pattern>

            {/* Clip interior streets to the walled city */}
            <clipPath id={`city-clip-${uid}`}>
              <path d={WALL_PARAPET} />
            </clipPath>
          </defs>

          {/* Subtle cartographic coordinate graticule */}
          <g stroke="currentColor" strokeOpacity="0.065" strokeWidth="0.22" className="text-ink">
            {[-40, -20, 0, 20, 40].map((x) => (
              <line key={`vx-${x}`} x1={x} y1={VB_Y} x2={x} y2={VB_Y + VB_H} />
            ))}
            {[-40, -20, 0, 20, 40].map((y) => (
              <line key={`hy-${y}`} x1={VB_X} y1={y} x2={VB_X + VB_W} y2={y} />
            ))}
          </g>

          {/* Outer moat & glacis contour */}
          <path d={MOAT_OUTER} fill={`url(#moat-fill-${uid})`} stroke="#1c1814" strokeOpacity="0.1" strokeWidth="0.25" />
          <path d={MOAT_INNER} fill="none" stroke="#1c1814" strokeOpacity="0.12" strokeWidth="0.22" strokeDasharray="1.1 1.1" />

          {/* Main 1567 Venetian fortress wall */}
          <motion.path
            d={WALL_MAIN}
            fill={`url(#stone-fill-${uid})`}
            stroke="#2c221b"
            strokeWidth="0.65"
            strokeLinejoin="miter"
            filter={`url(#wall-shadow-${uid})`}
            initial={{ pathLength: 0, opacity: 0.7 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: ease.outQuint }}
          />

          {/* Inner parapet relief line */}
          <path d={WALL_PARAPET} fill="none" stroke="#5a3d2b" strokeOpacity="0.28" strokeWidth="0.3" />

          {/* Walled city street network (clipped cleanly inside parapet) */}
          <g clipPath={`url(#city-clip-${uid})`}>
            {SECONDARY_LANES.map((d, i) => (
              <path
                key={`sec-${i}`}
                d={d}
                fill="none"
                stroke="#4a423a"
                strokeOpacity="0.22"
                strokeWidth="0.32"
                strokeLinecap="round"
              />
            ))}
            {PRIMARY_STREETS.map((d, i) => (
              <path
                key={`pri-${i}`}
                d={d}
                fill="none"
                stroke="#3d3128"
                strokeOpacity="0.42"
                strokeWidth="0.55"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Refined Buffer Zone (Green Line / Ara Bölge) */}
          <g>
            <path d={BUFFER_PATH} fill="none" stroke={`url(#buffer-hatch-${uid})`} strokeWidth="2.8" />
            <path
              d={BUFFER_PATH}
              fill="none"
              stroke="#6c7278"
              strokeOpacity="0.5"
              strokeWidth="0.25"
              strokeDasharray="1.4 1.2"
            />
            {/* Clean non-overlapping label placed inside the open western corridor */}
            <g transform="translate(-23 8.2)">
              <rect
                x="-11.5"
                y="-2.3"
                width="23"
                height="4.6"
                rx="2.3"
                fill="#efeae0"
                fillOpacity="0.92"
                stroke="#1c1814"
                strokeOpacity="0.14"
                strokeWidth="0.2"
              />
              <text
                x="0"
                y="0.8"
                textAnchor="middle"
                className="fill-ink-soft num text-[2.2px] uppercase tracking-[0.16em]"
              >
                {t("buffer")}
              </text>
            </g>
          </g>

          {/* Animated copper walking route from focused landmark to our atelier */}
          <AnimatePresence mode="wait">
            {activeLandmark?.routeToUs && (
              <motion.path
                key={`route-${focus}`}
                d={activeLandmark.routeToUs}
                fill="none"
                stroke="var(--color-copper)"
                strokeWidth="0.95"
                strokeLinecap="round"
                strokeDasharray="1.4 1.4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: ease.outQuint }}
              />
            )}
          </AnimatePresence>

          {/* Interactive Landmark Pins */}
          {LANDMARK_ORDER.map((key) => {
            const { x, y } = LANDMARKS[key];
            const active = focus === key;
            const isUs = key === "us";
            return (
              <g
                key={key}
                transform={`translate(${x} ${y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFocus(key);
                }}
                onMouseEnter={() => setFocus(key)}
                className="cursor-pointer"
                role="button"
                tabIndex={-1}
                aria-label={t(key)}
              >
                {/* Generous invisible hit target for easy touch/click */}
                <circle r="4.8" fill="transparent" />

                {isUs && (
                  <motion.circle
                    r="2.4"
                    className="fill-copper"
                    animate={{ r: [2.4, 6.8], opacity: [0.45, 0] }}
                    transition={{ duration: 2.1, repeat: Infinity, ease: "easeOut" }}
                  />
                )}

                {/* Active selection halo ring */}
                <motion.circle
                  r={isUs ? 3.5 : 2.6}
                  fill="none"
                  stroke={isUs ? "var(--color-copper)" : "var(--color-ink)"}
                  strokeWidth="0.4"
                  initial={false}
                  animate={{
                    scale: active ? 1 : 0.65,
                    opacity: active ? 0.65 : 0,
                  }}
                  transition={{ duration: 0.3, ease: ease.outQuint }}
                />

                {/* Pin body */}
                <motion.circle
                  r={isUs ? 2.2 : 1.35}
                  className={isUs ? "fill-copper" : "fill-ink"}
                  stroke="#efeae0"
                  strokeWidth={isUs ? 0.55 : 0.4}
                  animate={{ scale: active ? 1.25 : 1 }}
                  transition={{ duration: 0.3, ease: ease.outQuint }}
                />

                {isUs && <circle r="0.65" fill="#efeae0" />}
              </g>
            );
          })}

          {/* Refined architectural 4-point compass rose (top-right) */}
          <g transform="translate(53 -46)" className="text-ink">
            <circle r="5.2" fill="#efeae0" fillOpacity="0.65" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.25" />
            <line x1="0" y1="-4.4" x2="0" y2="4.4" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.2" />
            <line x1="-4.4" y1="0" x2="4.4" y2="0" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.2" />
            <path d="M0,-4.4 L1.15,0 L0,-0.75 L-1.15,0 Z" fill="var(--color-copper)" />
            <path d="M0,4.4 L1.15,0 L0,0.75 L-1.15,0 Z" fill="currentColor" fillOpacity="0.45" />
            <text y="8.2" textAnchor="middle" className="fill-ink-soft num text-[2.3px] font-medium tracking-[0.15em]">
              N
            </text>
          </g>

          {/* Graphic cartographic scale bar (bottom-right) */}
          <g transform="translate(42 50.5)" className="text-ink-soft">
            <line x1="0" y1="0" x2="18" y2="0" stroke="currentColor" strokeWidth="0.35" />
            <line x1="0" y1="-1.1" x2="0" y2="0.4" stroke="currentColor" strokeWidth="0.35" />
            <line x1="9" y1="-0.7" x2="9" y2="0.3" stroke="currentColor" strokeWidth="0.28" />
            <line x1="18" y1="-1.1" x2="18" y2="0.4" stroke="currentColor" strokeWidth="0.35" />
            <text x="9" y="-2.1" textAnchor="middle" className="fill-ink-soft num text-[2.2px] tracking-[0.12em]">
              250 M
            </text>
          </g>
        </svg>

        {/* Crisp HTML floating callout pill synced to the active landmark */}
        <div
          className="pointer-events-none absolute z-10"
          style={{ left: `${pillLeft}%`, top: `${pillTop}%` }}
        >
          <AnimatePresence mode="wait">
            {focus && activeLandmark && (
              <motion.div
                key={focus}
                initial={{ opacity: 0, y: activeLandmark.labelBelow ? -4 : 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: activeLandmark.labelBelow ? -2 : 2, scale: 0.96 }}
                transition={{ duration: 0.22, ease: ease.outQuint }}
                className={`relative -translate-x-1/2 whitespace-nowrap rounded-full border border-paper/15 bg-ink px-3 py-1 text-[0.7rem] font-medium tracking-wide text-paper shadow-md ${
                  activeLandmark.labelBelow ? "translate-y-3" : "-translate-y-[calc(100%+12px)]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={`block size-1.5 rounded-full ${focus === "us" ? "bg-copper-light" : "bg-stone"}`}
                    aria-hidden="true"
                  />
                  {t(focus)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Interactive Landmark Selector & Walking Distance Strip */}
      <figcaption className="border-t border-ink/12 bg-paper/80 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
          {/* Nothing selected -> no text here (the row keeps its height). */}
          <p className="min-h-[1.1em] text-xs font-medium text-ink" aria-live="polite">
            {focus && activeLandmark
              ? focus === "us"
                ? t("ourLocation")
                : t("walkMin", { min: activeLandmark.walkMin ?? 2 })
              : null}
          </p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow ml-auto inline-flex items-center gap-1 text-[0.7rem] text-copper transition-colors hover:text-ink"
          >
            {t("directions")}
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {LANDMARK_ORDER.map((key) => {
            const active = focus === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  aria-pressed={active}
                  onMouseEnter={() => setFocus(key)}
                  onFocus={() => setFocus(key)}
                  onClick={() => setFocus(key)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/15 bg-paper/70 text-ink-soft hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  <span
                    className={`block size-1.5 rounded-full ${
                      key === "us" ? "bg-copper" : active ? "bg-stone" : "bg-ink/50"
                    }`}
                  />
                  {t(key)}
                </button>
              </li>
            );
          })}
        </ul>
      </figcaption>
    </figure>
  );
}
