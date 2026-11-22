import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";
import { NicosiaMap } from "@/components/contact/NicosiaMap";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/iletisim">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta.contact" });
  return pageMetadata(locale as Locale, "/iletisim", t("title"), t("description"));
}

export default async function ContactPage({ params }: PageProps<"/[locale]/iletisim">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("contact");

  const hours = [
    [t("hours.weekdays"), t("hours.weekdaysTime")],
    [t("hours.saturday"), t("hours.saturdayTime")],
    [t("hours.sunday"), t("hours.sundayTime")],
  ] as const;

  return (
    <>
      <PageHero index="06 / 06" eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

      <section className="shell grid-arch gap-y-14 pb-24 md:pb-36">
        <div className="col-span-12 space-y-10 lg:col-span-5">
          <Reveal>
            <NicosiaMap />
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2">
            <Reveal>
              <h2 className="eyebrow mb-3 text-ink-soft">{t("address.label")}</h2>
              <address className="not-italic leading-relaxed">
                {t("address.line1")}
                <br />
                {t("address.line2")}
                <br />
                {t("address.line3")}
              </address>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="eyebrow mb-3 text-ink-soft">{t("reach.label")}</h2>
              <p>
                <a href={`mailto:${t("reach.email")}`} className="link-underline">
                  {t("reach.email")}
                </a>
              </p>
              <p className="font-mono text-sm">{t("reach.phone")}</p>
            </Reveal>
            <Reveal delay={0.12} className="sm:col-span-2">
              <h2 className="eyebrow mb-3 text-ink-soft">{t("hours.label")}</h2>
              <dl className="divide-y divide-ink/10 border-y border-ink/10">
                {hours.map(([day, time]) => (
                  <div key={day} className="flex justify-between py-2.5 text-sm">
                    <dt>{day}</dt>
                    <dd className="font-mono tabular-nums">{time}</dd>
                  </div>
                ))}
              </dl>
              <p className="eyebrow mt-3 text-copper">{t("hours.roastDay")}</p>
            </Reveal>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
