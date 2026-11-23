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

  return (
    <>
      <PageHero index="05 / 06" eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

      {/* Story: compact stone arch vignette + tight editorial narrative */}
      <section className="shell grid-arch items-start gap-y-8 pb-16 md:pb-22">
        <Reveal className="relative col-span-12 aspect-[4/4.2] max-h-[21rem] w-full overflow-hidden border border-ink/15 md:col-span-4">
          <LimestoneTexture className="absolute inset-0 h-full w-full" />
          {/* An arch cut into the stone with architectural drafting lines */}
          <svg viewBox="0 0 100 105" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M22 105V52a28 28 0 0 1 56 0v53Z" fill="#1c1814" fillOpacity="0.88" />
            <path d="M22 105V52a28 28 0 0 1 56 0v53" fill="none" stroke="#b89a66" strokeWidth="0.7" />
            <path d="M16 105V52a34 34 0 0 1 68 0v53" fill="none" stroke="#1c1814" strokeOpacity="0.28" strokeWidth="0.4" strokeDasharray="2 2" />
          </svg>
          <WallMark className="absolute bottom-[12%] left-1/2 size-12 -translate-x-1/2 text-copper-light" />
          <p className="eyebrow absolute left-3.5 top-3.5 bg-paper/75 px-2 py-0.5 text-[0.6rem] text-ink">
            Arasta · 1890 → 2019
          </p>
        </Reveal>

        <div className="col-span-12 space-y-5 md:col-span-8 md:pl-4">
          <Reveal>
            <p className="font-display text-xl leading-snug md:text-2xl">{t("story.p1")}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[62ch] text-sm leading-relaxed text-ink-soft md:text-base">{t("story.p2")}</p>
          </Reveal>
          <DrawnRule />
          <Reveal delay={0.12}>
            <blockquote className="border-l-2 border-copper bg-paper-deep/45 px-5 py-4">
              <p className="font-display text-lg italic leading-relaxed md:text-xl">“{t("story.quote")}”</p>
              <footer className="eyebrow mt-3 text-[0.62rem] text-ink-soft">— {t("story.quoteBy")}</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      <div className="border-t border-ink/10 bg-paper-deep">
        <Timeline />
      </div>

      {/* Philosophy on brushed silver steel — connects directly flush into the Footer */}
      <section className="brushed-steel border-t border-ink/15">
        <div className="shell grid-arch gap-y-8 py-16 md:py-22">
          <div className="col-span-12 md:col-span-5">
            <p className="eyebrow">{t("philosophy.eyebrow")}</p>
            <MaskedLines lines={[t("philosophy.title")]} className="display mt-3 text-headline" />
          </div>
          <div className="col-span-12 space-y-5 md:col-span-6 md:col-start-7">
            <Reveal>
              <p className="text-sm leading-relaxed md:text-base">{t("philosophy.p1")}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="text-sm leading-relaxed text-ink-soft md:text-base">{t("philosophy.p2")}</p>
            </Reveal>
            <Reveal delay={0.12}>
              <ul className="divide-y divide-ink/20 border-y border-ink/20">
                {(["a", "b", "c"] as const).map((k, i) => (
                  <li key={k} className="flex items-baseline gap-4 py-2.5">
                    <span className="eyebrow text-copper">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm">{t(`philosophy.points.${k}`)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
