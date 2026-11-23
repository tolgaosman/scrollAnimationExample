"use client";

/**
 * MenuList — rich interactive Atelier Menu & Tasting Board.
 * Features:
 *  1. Atelier Signature Trio spotlight cards with architectural vessel art & specs
 *  2. Interactive Category tabs (sliding Motion layoutId) + Hot/Iced filter pills
 *  3. Framed editorial menu cards with craft telemetry, flavor pills & calculator jump
 */
import { LayoutGroup, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { menu, MENU_SECTIONS, type MenuItem, type MenuSection, type ServeStyle } from "@/content/menu";
import type { Locale } from "@/i18n/routing";
import { spring } from "@/lib/motion";

type SectionFilter = "all" | MenuSection;
type ServeFilter = "all" | ServeStyle;

const SECTION_TABS: SectionFilter[] = ["all", ...MENU_SECTIONS];
const SERVE_FILTERS: ServeFilter[] = ["all", "hot", "iced", "baked"];

export function MenuList() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const priceFmt = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB");

  const [section, setSection] = useState<SectionFilter>("all");
  const [serve, setServe] = useState<ServeFilter>("all");

  const signatures = menu.filter((m) => m.section === "signature");
  const filtered = menu.filter(
    (m) => (section === "all" || m.section === section) && (serve === "all" || m.serve === serve),
  );

  const groupedSections = MENU_SECTIONS.filter((sec) => filtered.some((m) => m.section === sec));

  return (
    <section className="shell pb-16 md:pb-24" aria-label={t("title")}>
      {/* 1. Atelier Signature Trio Spotlight */}
      <div className="mb-12">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="eyebrow text-copper">{t("spotlight.eyebrow")}</p>
          <p className="eyebrow text-ink-soft">{t("spotlight.note")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {signatures.map((item, idx) => {
            const surface =
              idx === 0
                ? "bg-ink text-paper border-ink"
                : idx === 1
                  ? "bg-stone-light/70 text-ink border-ink/15"
                  : "brushed-steel text-ink border-ink/20";
            const muted = idx === 0 ? "text-paper/70" : "text-ink-soft";
            const chip = idx === 0 ? "border-paper/20 text-paper/85" : "border-ink/20 bg-paper/50 text-ink";
            return (
              <article
                key={item.id}
                className={`group relative flex flex-col justify-between overflow-hidden border p-5 transition-transform duration-500 ease-[var(--ease-out-quint)] hover:-translate-y-1 md:p-6 ${surface}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="eyebrow text-[0.62rem] opacity-75">
                    0{idx + 1} · {item.badge ? t(item.badge) : t("sections.signature")}
                  </span>
                  <span className="shrink-0 whitespace-nowrap font-mono text-sm font-medium tabular-nums">
                    {`${priceFmt.format(item.price)}\u00A0${t("currency")}`}
                  </span>
                </div>

                <div className="my-5">
                  <h2 className="font-display text-2xl leading-tight tracking-tight md:text-[1.75rem]">
                    {item.name[locale]}
                  </h2>
                  <p className={`mt-2 text-xs leading-relaxed md:text-sm ${muted}`}>
                    {item.description[locale]}
                  </p>
                </div>

                <div>
                  <p className="eyebrow mb-3 text-[0.6rem] opacity-70">{item.spec[locale]}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {item.notes[locale].map((note) => (
                      <li key={note} className={`rounded-full border px-2.5 py-0.5 text-[0.68rem] ${chip}`}>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Category & Serve Filter Toolbar */}
      <LayoutGroup id="menu-filters">
        <div className="mb-10 flex flex-col gap-4 border-y border-ink/15 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label={t("filters.categories")} className="flex flex-wrap gap-1.5">
            {SECTION_TABS.map((tab) => {
              const active = section === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSection(tab)}
                  className={`relative z-0 h-9 shrink-0 whitespace-nowrap rounded-full px-3.5 text-xs tracking-wide transition-colors md:px-4 md:text-sm ${
                    active ? "text-paper" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="menu-cat-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-ink"
                      transition={spring.pill}
                    />
                  )}
                  {tab === "all" ? t("filters.all") : t(`sections.${tab}`)}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 lg:justify-end">
            <div role="group" aria-label={t("filters.serve")} className="flex items-center gap-1 rounded-full border border-ink/15 p-1">
              {SERVE_FILTERS.map((sv) => {
                const active = serve === sv;
                return (
                  <button
                    key={sv}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setServe(sv)}
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[0.64rem] uppercase tracking-[0.1em] transition-colors sm:px-3 ${
                      active ? "bg-copper text-paper" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {t(`serve.${sv}`)}
                  </button>
                );
              })}
            </div>
            <span className="eyebrow text-ink-soft tabular-nums">
              {filtered.length} / {menu.length}
            </span>
          </div>
        </div>
      </LayoutGroup>

      {/* 3. Architectural Editorial Menu Ledger */}
      {groupedSections.length === 0 ? (
        <div className="border border-ink/15 bg-paper-deep/40 p-10 text-center">
          <p className="font-display text-2xl italic text-ink-soft">{t("empty")}</p>
          <button
            type="button"
            onClick={() => {
              setSection("all");
              setServe("all");
            }}
            className="eyebrow mt-4 rounded-full border border-ink/25 px-4 py-2 text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            {t("resetFilters")}
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedSections.map((sec, si) => {
            const items = filtered.filter((m) => m.section === sec);
            return (
              <div key={sec}>
                <div className="mb-5 flex items-baseline justify-between border-b border-ink pb-2.5">
                  <div className="flex items-baseline gap-3.5">
                    <span className="eyebrow text-copper">{String(si + 1).padStart(2, "0")}</span>
                    <h2 className="font-display text-2xl tracking-tight md:text-3xl">{t(`sections.${sec}`)}</h2>
                  </div>
                  <span className="eyebrow text-ink-soft tabular-nums">{items.length}</span>
                </div>

                <ul className="grid gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <MenuCard key={item.id} item={item} locale={locale} priceFmt={priceFmt} t={t} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MenuCard({
  item,
  locale,
  priceFmt,
  t,
}: {
  item: MenuItem;
  locale: Locale;
  priceFmt: Intl.NumberFormat;
  t: ReturnType<typeof useTranslations<"menu">>;
}) {
  const serveDot =
    item.serve === "iced" ? "bg-steel" : item.serve === "baked" ? "bg-stone-deep" : "bg-copper";

  return (
    <li className="group flex flex-col justify-between border border-ink/12 bg-paper-deep/35 p-4 transition-colors duration-300 hover:border-ink/35 hover:bg-paper sm:p-5">
      <div>
        <div className="flex items-baseline gap-2">
          <span className={`size-2 shrink-0 rounded-full ${serveDot}`} title={t(`serve.${item.serve}`)} />
          <h3 className="min-w-0 font-display text-[clamp(1.05rem,3.8vw,1.35rem)] leading-tight tracking-tight transition-colors group-hover:text-copper md:text-[clamp(1.15rem,1.35vw,1.45rem)]">
            {item.name[locale]}
          </h3>
          {item.badge && (
            <span className="eyebrow shrink-0 whitespace-nowrap rounded-full border border-copper/50 px-1.5 py-0.5 text-[0.52rem] text-copper sm:px-2 sm:text-[0.56rem]">
              {t(item.badge)}
            </span>
          )}
          <span className="mb-1 hidden min-w-3 flex-1 border-b border-dotted border-ink/25 sm:block" aria-hidden="true" />
          <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-sm font-medium tabular-nums text-ink sm:ml-0">
            {`${priceFmt.format(item.price)}\u00A0${t("currency")}`}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.description[locale]}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.notes[locale].map((note) => (
            <span key={note} className="whitespace-nowrap rounded-full border border-ink/15 bg-paper px-2 py-0.5 text-[0.68rem] text-ink-soft">
              {note}
            </span>
          ))}
        </div>
        <span className="eyebrow whitespace-nowrap text-[0.58rem] text-ink-soft">{item.spec[locale]}</span>
      </div>
    </li>
  );
}
