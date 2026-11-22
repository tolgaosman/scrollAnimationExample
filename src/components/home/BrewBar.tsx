"use client";

/**
 * Brew Bar teaser — four stations in a row. The focused station grows
 * (flex-grow is layout-animated by Motion) and reveals its description;
 * the others compress to slim vertical spines. Works with hover, keyboard
 * focus and tap.
 */
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ease, spring } from "@/lib/motion";
import { BrewIcons, type BrewKey } from "./BrewIcons";

const STATIONS: { key: BrewKey; surface: string; fg: string }[] = [
  { key: "espresso", surface: "bg-ink", fg: "text-paper" },
  { key: "pourover", surface: "bg-stone-light", fg: "text-ink" },
  { key: "coldbrew", surface: "brushed-steel", fg: "text-ink" },
  { key: "cezve", surface: "copper-sheen", fg: "text-paper" },
];

export function BrewBar() {
  const t = useTranslations("home.brewbar");
  const [active, setActive] = useState<BrewKey>("espresso");

  return (
    <section className="bg-paper py-24 md:py-36" aria-labelledby="brewbar-title">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/15 pb-6">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 id="brewbar-title" className="display mt-3 text-headline">
              {t("title")}
            </h2>
          </div>
          <p className="eyebrow text-ink-soft">{t("hint")}</p>
        </div>

        <div className="mt-10 flex h-auto flex-col gap-2 md:h-[34rem] md:flex-row">
          {STATIONS.map(({ key, surface, fg }, i) => {
            const isActive = active === key;
            const Icon = BrewIcons[key];
            return (
              <motion.button
                key={key}
                type="button"
                layout
                onMouseEnter={() => setActive(key)}
                onFocus={() => setActive(key)}
                onClick={() => setActive(key)}
                aria-expanded={isActive}
                transition={spring.soft}
                style={{ flexGrow: isActive ? 4 : 1 }}
                className={`relative flex min-h-24 basis-0 flex-col overflow-hidden p-5 text-left md:min-h-0 md:p-7 ${surface} ${fg}`}
              >
                <motion.div layout="position" className="flex w-full items-start justify-between gap-4">
                  <span className="eyebrow opacity-70">{String(i + 1).padStart(2, "0")}</span>
                  <Icon className={`shrink-0 transition-all duration-700 ${isActive ? "size-16 md:size-20" : "size-10"}`} />
                </motion.div>

                <motion.div layout="position" className="mt-auto">
                  <h3
                    className={`font-display leading-none tracking-tight transition-[font-size] duration-500 ${
                      isActive ? "text-4xl md:text-6xl" : "text-2xl md:[writing-mode:vertical-rl] md:rotate-180 md:text-3xl"
                    }`}
                  >
                    {t(`items.${key}.name`)}
                  </h3>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="body"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.5, ease: ease.outQuint, delay: 0.12 }}
                      >
                        <p className="eyebrow mt-4 opacity-75">{t(`items.${key}.tag`)}</p>
                        <p className="mt-3 max-w-[38ch] text-sm leading-relaxed opacity-90 md:text-base">
                          {t(`items.${key}.body`)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
