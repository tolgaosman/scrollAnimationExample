import { getLocale, getTranslations } from "next-intl/server";
import { menu, MENU_SECTIONS } from "@/content/menu";
import type { Locale } from "@/i18n/routing";
import { Reveal } from "@/components/ui/Reveal";

/** Editorial menu: section numerals, dotted leaders, prices set in mono. */
export async function MenuList() {
  const t = await getTranslations("menu");
  const locale = (await getLocale()) as Locale;
  const price = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB");

  return (
    <section className="shell pb-24 md:pb-36" aria-label={t("title")}>
      <div className="grid-arch gap-y-16">
        {MENU_SECTIONS.map((section, si) => (
          <Reveal
            key={section}
            className={`col-span-12 md:col-span-6 ${si % 2 === 1 ? "md:mt-24" : ""}`}
          >
            <div className="flex items-baseline gap-4 border-b border-ink pb-3">
              <span className="eyebrow text-copper">{String(si + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-3xl tracking-tight md:text-4xl">{t(`sections.${section}`)}</h2>
            </div>
            <ul>
              {menu
                .filter((m) => m.section === section)
                .map((item) => (
                  <li key={item.id} className="group border-b border-ink/10 py-5">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-xl transition-[font-style] duration-300 group-hover:italic md:text-2xl">
                        {item.name[locale]}
                      </h3>
                      {item.badge && (
                        <span className="eyebrow rounded-full border border-copper/50 px-2 py-0.5 text-[0.58rem] text-copper">
                          {t(item.badge)}
                        </span>
                      )}
                      <span className="mb-1 flex-1 border-b border-dotted border-ink/30" aria-hidden="true" />
                      <span className="font-mono text-sm tabular-nums">
                        {price.format(item.price)} {t("currency")}
                      </span>
                    </div>
                    <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-ink-soft">{item.description[locale]}</p>
                  </li>
                ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
