import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TeamGrid } from "@/components/team/TeamGrid";
import { PageHero } from "@/components/ui/PageHero";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/ekibimiz">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta.team" });
  return pageMetadata(locale as Locale, "/ekibimiz", t("title"), t("description"));
}

export default async function TeamPage({ params }: PageProps<"/[locale]/ekibimiz">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("team");

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={t("lede")}
        aside={<p className="eyebrow mt-6 text-copper">{t("hint")}</p>}
      />
      <TeamGrid />
    </>
  );
}
