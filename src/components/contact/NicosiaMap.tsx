"use client";

/**
 * NicosiaMap — a stylised plan of walled Nicosia (Lefkoşa Surlariçi).
 * The eleven-bastion Venetian ring, the moat, the buffer zone, a few
 * principal streets and landmarks. Landmarks are keyboard-focusable
 * buttons in the legend; selecting one highlights it on the plan.
 * Schematic, not survey-accurate.
 */
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { bastionPath } from "@/components/brand/WallMark";
import { ease } from "@/lib/motion";

type LandmarkKey = "us" | "selimiye" | "buyukhan" | "arasta" | "kyrenia";

const LANDMARKS: Record<LandmarkKey, { x: number; y: number }> = {
  kyrenia: { x: -7, y: -40.5 },
  buyukhan: { x: -3, y: -8 },
  arasta: { x: 5, y: -6 },
  selimiye: { x: 13, y: -3 },
  us: { x: 3.5, y: -11 },
};

const WALL = bastionPath(40);
// Principal streets (schematic).
const STREETS = [
  "M-7,-40 C-6,-28 -4,-18 -2,-6 S2,6 1,12", // Girne Caddesi → Ledra
  "M-36,-14 C-22,-12 -12,-9 -3,-8 S10,-4 13,-3 S28,0 37,4", // east–west spine
  "M-3,-8 C2,-14 8,-20 14,-30",
  "M13,-3 C16,-12 22,-20 30,-26",
  "M-3,-8 C-12,-18 -20,-26 -26,-30",
];

export function NicosiaMap() {
  const t = useTranslations("contact.map");
  const [focus, setFocus] = useState<LandmarkKey>("us");

  return (
    <figure className="grid gap-6 md:grid-cols-[1fr_auto]">
      <div className="relative aspect-square overflow-hidden bg-paper-deep">
        <svg viewBox="-62 -62 124 124" className="h-full w-full" role="img" aria-label={t("title")}>
          {/* moat */}
          <circle r="51" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="9" />
          {/* walls */}
          <motion.path
            d={WALL}
            className="fill-stone/45 text-ink"
            stroke="currentColor"
            strokeWidth="0.6"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.2, ease: ease.outQuint }}
          />
          {/* streets */}
          {STREETS.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.45" />
          ))}
          {/* buffer zone */}
          <path
            d="M-58,7 C-40,4 -28,10 -14,7 S6,12 18,9 S40,13 58,9"
            fill="none"
            stroke="var(--color-steel)"
            strokeWidth="2.2"
            strokeDasharray="1.4 1.2"
            strokeOpacity="0.7"
          />
          <text x="-56" y="15" className="fill-ink-soft font-mono text-[2.6px] uppercase tracking-[0.2em]">
            {t("buffer")}
          </text>
          <text x="0" y="-55" textAnchor="middle" className="fill-ink-soft font-mono text-[2.6px] uppercase tracking-[0.2em]">
            {t("walls")}
          </text>

          {/* landmarks */}
          {(Object.keys(LANDMARKS) as LandmarkKey[]).map((key) => {
            const { x, y } = LANDMARKS[key];
            const active = focus === key;
            const isUs = key === "us";
            return (
              <g key={key} transform={`translate(${x} ${y})`}>
                {isUs && (
                  <motion.circle
                    r="2"
                    className="fill-copper"
                    animate={{ r: [2, 6], opacity: [0.5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <motion.circle
                  r={isUs ? 2.1 : 1.3}
                  className={isUs ? "fill-copper" : "fill-ink"}
                  animate={{ scale: active ? 1.5 : 1 }}
                  transition={{ duration: 0.4, ease: ease.outQuint }}
                />
              </g>
            );
          })}

          {/* active label — positioned directly above the selected landmark dot */}
          <g transform={`translate(${LANDMARKS[focus].x} ${LANDMARKS[focus].y})`}>
            <AnimatePresence mode="wait">
              <motion.g
                key={focus}
                initial={{ opacity: 0, y: 1.5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -1.5 }}
                transition={{ duration: 0.25 }}
              >
                <text
                  x={0}
                  y={-4.8}
                  textAnchor="middle"
                  className={`font-display text-[4.3px] italic ${
                    focus === "us" ? "fill-ink" : "fill-[#8c3f19]"
                  }`}
                >
                  {t(focus)}
                </text>
              </motion.g>
            </AnimatePresence>
          </g>

          {/* compass */}
          <g transform="translate(52 -52)" className="text-ink">
            <path d="M0,-5 L1.6,2 L0,1 L-1.6,2 Z" fill="currentColor" />
            <text y="7" textAnchor="middle" className="fill-ink font-mono text-[2.6px]">
              N
            </text>
          </g>
        </svg>
      </div>

      <figcaption>
        <ul className="flex flex-wrap gap-2 md:w-48 md:flex-col">
          {(Object.keys(LANDMARKS) as LandmarkKey[]).map((key) => (
            <li key={key}>
              <button
                type="button"
                aria-pressed={focus === key}
                onMouseEnter={() => setFocus(key)}
                onFocus={() => setFocus(key)}
                onClick={() => setFocus(key)}
                className={`flex w-full items-center gap-3 rounded-full border px-3 py-1.5 text-left text-xs transition-colors ${
                  focus === key ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"
                }`}
              >
                <span className={`block size-2 rounded-full ${key === "us" ? "bg-copper" : focus === key ? "bg-paper" : "bg-ink"}`} />
                {t(key)}
              </button>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
