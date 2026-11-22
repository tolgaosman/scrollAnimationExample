import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Timeline } from "@/components/about/Timeline";
import { WallMark } from "@/components/brand/WallMark";
import { LimestoneTexture } from "@/components/ui/LimestoneTexture";
import { PageHero } from "@/components/ui/PageHero";
import { DrawnRule, MaskedLines, Reveal } from "@/components/ui/Reveal";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/hakkimizda">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta.about" });
  return pageMetadata(locale as Locale, "/hakkimizda", t("title"), t("description"));
}

export default async function AboutPage({ params }: PageProps<"/[locale]/hakkimizda">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("about");

  const stats = [
    ["80%", t("sustain.stats.direct")],
    ["+45%", t("sustain.stats.premium")],
    ["100%", t("sustain.stats.waste")],
  ] as const;

  return (
    <>
      <PageHero index="05 / 06" eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

      {/* Story: stone arch + text */}
      <section className="shell grid-arch gap-y-12 pb-24 md:pb-36">
        <Reveal className="relative col-span-12 aspect-[4/5] overflow-hidden md:col-span-5">
          <LimestoneTexture className="absolute inset-0 h-full w-full" />
          {/* an arch cut into the stone */}
          <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M22 125V60a28 28 0 0 1 56 0v65Z" fill="#1c1814" fillOpacity="0.88" />
            <path d="M22 125V60a28 28 0 0 1 56 0v65" fill="none" stroke="#b89a66" strokeWidth="0.6" />
          </svg>
          <WallMark className="absolute bottom-[12%] left-1/2 size-16 -translate-x-1/2 text-copper-light" />
          <p className="eyebrow absolute left-4 top-4 text-ink/70">Arasta · 1890 → 2019</p>
        </Reveal>

        <div className="col-span-12 space-y-8 md:col-span-6 md:col-start-7 md:pt-16">
          <Reveal>
            <p className="font-display text-2xl leading-snug md:text-3xl">{t("story.p1")}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="leading-relaxed text-ink-soft">{t("story.p2")}</p>
          </Reveal>
          <DrawnRule />
          <Reveal delay={0.15}>
            <blockquote>
              <p className="font-display text-xl italic leading-relaxed md:text-2xl">“{t("story.quote")}”</p>
              <footer className="eyebrow mt-4 text-ink-soft">— {t("story.quoteBy")}</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      <div className="bg-paper-deep">
        <Timeline />
      </div>

      {/* Philosophy on steel */}
      <section className="brushed-steel">
        <div className="shell grid-arch gap-y-10 py-24 md:py-36">
          <div className="col-span-12 md:col-span-6">
            <p className="eyebrow">{t("philosophy.eyebrow")}</p>
            <MaskedLines lines={[t("philosophy.title")]} className="display mt-4 text-headline" />
          </div>
          <div className="col-span-12 space-y-6 md:col-span-5 md:col-start-8">
            <Reveal>
              <p className="leading-relaxed">{t("philosophy.p1")}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="leading-relaxed">{t("philosophy.p2")}</p>
            </Reveal>
            <Reveal delay={0.12}>
              <ul className="divide-y divide-ink/20 border-y border-ink/20">
                {(["a", "b", "c"] as const).map((k, i) => (
                  <li key={k} className="flex items-baseline gap-4 py-3">
                    <span className="eyebrow text-copper">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm">{t(`philosophy.points.${k}`)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Direct trade */}
      <section className="shell grid-arch gap-y-12 py-24 md:py-36">
        <div className="col-span-12 md:col-span-5">
          <p className="eyebrow">{t("sustain.eyebrow")}</p>
          <MaskedLines lines={[t("sustain.title")]} className="display mt-4 text-headline" />
        </div>
        <div className="col-span-12 space-y-6 md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="font-display text-xl leading-relaxed md:text-2xl">{t("sustain.p1")}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="leading-relaxed text-ink-soft">{t("sustain.p2")}</p>
          </Reveal>
        </div>
        <dl className="col-span-12 grid grid-cols-1 border-t border-ink/15 sm:grid-cols-3">
          {stats.map(([value, label], i) => (
            <Reveal
              key={label}
              delay={i * 0.08}
              className="flex flex-col-reverse border-b border-ink/15 py-6 sm:border-b-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0"
            >
              <dt className="eyebrow mt-2 text-ink-soft">{label}</dt>
              <dd className="display text-[clamp(3rem,6vw,5.5rem)]">{value}</dd>
            </Reveal>
          ))}
        </dl>
      </section>
    </>
  );
}
