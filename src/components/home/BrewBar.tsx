"use client";

/**
 * BrewBar — four sensory stations with locked 60/120fps GPU transitions.
 * Avoids animating `font-size` or `width`/`height` (which previously forced
 * variable-font glyph re-rasterization every frame). Instead, flex-grow expands
 * smoothly via CSS while separate fixed-size title/detail layers cross-fade and
 * transform on the compositor, enriched with extraction telemetry.
 */
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BrewIcons, type BrewKey } from "./BrewIcons";

const STATIONS: {
  key: BrewKey;
  surface: string;
  fg: string;
  badgeCls: string;
  specBorder: string;
  temp: string;
  ratio: string;
}[] = [
  {
    key: "espresso",
    surface: "bg-ink",
    fg: "text-paper",
    badgeCls: "border-paper/20 text-paper/85",
    specBorder: "border-paper/15",
    temp: "93 °C",
    ratio: "1:2",
  },
  {
    key: "pourover",
    surface: "bg-stone-light",
    fg: "text-ink",
    badgeCls: "border-ink/20 text-ink/85",
    specBorder: "border-ink/15",
    temp: "92 °C",
    ratio: "1:16",
  },
  {
    key: "coldbrew",
    surface: "brushed-steel",
    fg: "text-ink",
    badgeCls: "border-ink/25 bg-paper/35 text-ink",
    specBorder: "border-ink/20",
    temp: "4 °C",
    ratio: "1:10",
  },
  {
    key: "cezve",
    surface: "copper-sheen",
    fg: "text-paper",
    badgeCls: "border-paper/25 text-paper/90",
    specBorder: "border-paper/20",
    temp: "96 °C",
    ratio: "1:10",
  },
];

export function BrewBar() {
  const t = useTranslations("home.brewbar");
  const [active, setActive] = useState<BrewKey>("espresso");

  return (
    <section className="bg-paper py-10 md:py-24" aria-labelledby="brewbar-title">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/15 pb-5">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 id="brewbar-title" className="display mt-2.5 text-headline">
              {t("title")}
            </h2>
          </div>
          <p className="eyebrow text-ink-soft">{t("hint")}</p>
        </div>

        <div className="mt-7 flex flex-col gap-2 md:h-[26rem] md:flex-row">
          {STATIONS.map(({ key, surface, fg, badgeCls, specBorder, temp, ratio }, i) => {
            const isActive = active === key;
            const Icon = BrewIcons[key];
            return (
              <button
                key={key}
                type="button"
                onMouseEnter={() => setActive(key)}
                onFocus={() => setActive(key)}
                onClick={() => setActive(key)}
                aria-expanded={isActive}
                style={{ flexGrow: isActive ? 3.8 : 1 }}
                className={`group relative flex basis-auto flex-col overflow-hidden p-5 text-left transition-[flex-grow] duration-500 ease-[var(--ease-out-quint)] will-change-[flex-grow] md:basis-0 md:p-6 ${surface} ${fg}`}
              >
                {/* Decorative oversized watermark icon inside active card */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute bottom-2 right-2 transition-[opacity,transform] duration-500 ease-[var(--ease-out-quint)] ${
                    isActive ? "scale-100 opacity-[0.09]" : "scale-75 opacity-0"
                  }`}
                >
                  <Icon className="size-36 md:size-44" />
                </span>

                {/* Top row: index + GPU-scaled icon */}
                <div className="relative z-10 flex w-full items-start justify-between gap-3">
                  <span className="eyebrow opacity-70">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={`block origin-top-right transition-transform duration-500 ease-[var(--ease-out-quint)] will-change-transform ${
                      isActive ? "scale-100" : "scale-[0.65]"
                    }`}
                  >
                    <Icon className="size-12 md:size-14" />
                  </span>
                </div>

                {/* Desktop collapsed vertical spine label (GPU opacity + translate only) */}
                <span
                  aria-hidden={isActive}
                  className={`pointer-events-none absolute bottom-6 left-6 hidden font-display text-2xl leading-none tracking-tight [writing-mode:vertical-rl] rotate-180 transition-[opacity,transform] duration-300 ease-[var(--ease-out-quint)] md:block ${
                    isActive ? "translate-y-3 opacity-0" : "translate-y-0 opacity-95"
                  }`}
                >
                  {t(`items.${key}.name`)}
                </span>

                {/* Mobile collapsed header */}
                {!isActive && (
                  <span className="relative z-10 mt-3 block font-display text-2xl leading-none tracking-tight md:hidden">
                    {t(`items.${key}.name`)}
                  </span>
                )}

                {/* Active expanded content (fixed font size — zero font-size animation!) */}
                <div
                  className={`relative z-10 mt-auto transition-[opacity,transform] duration-400 ease-[var(--ease-out-quint)] will-change-[opacity,transform] ${
                    isActive
                      ? "pointer-events-auto translate-y-0 opacity-100 delay-100"
                      : "pointer-events-none hidden translate-y-3 opacity-0 md:block md:h-0 md:overflow-hidden"
                  }`}
                >
                  <p className="eyebrow opacity-75">{t(`items.${key}.tag`)}</p>
                  <h3 className="mt-1.5 font-display text-3xl leading-none tracking-tight md:text-5xl">
                    {t(`items.${key}.name`)}
                  </h3>
                  <p className="mt-3 max-w-[44ch] text-sm leading-relaxed opacity-90">
                    {t(`items.${key}.body`)}
                  </p>

                  {/* Extraction telemetry bar filling the card purposefully */}
                  <dl className={`mt-5 grid max-w-md grid-cols-3 gap-3 border-t pt-3.5 ${specBorder}`}>
                    <div>
                      <dt className="eyebrow text-xs opacity-65">{t("specs.temp")}</dt>
                      <dd className="mt-0.5 whitespace-nowrap num text-xs tabular-nums md:text-sm">{temp}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-xs opacity-65">{t("specs.ratio")}</dt>
                      <dd className="mt-0.5 whitespace-nowrap num text-xs tabular-nums md:text-sm">{ratio}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-xs opacity-65">{t("specs.method")}</dt>
                      <dd className="mt-0.5 whitespace-nowrap num text-xs md:text-sm">{t(`items.${key}.setup`)}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 num text-[0.65rem] ${badgeCls}`}>
                      {t(`items.${key}.note`)}
                    </span>
                    <span className="eyebrow ml-auto text-xs opacity-65">
                      0{i + 1} / 04
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
