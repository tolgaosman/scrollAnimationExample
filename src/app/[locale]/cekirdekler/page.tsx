import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BeanExplorer } from "@/components/beans/BeanExplorer";
import { PageHero } from "@/components/ui/PageHero";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/cekirdekler">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta.beans" });
  return pageMetadata(locale as Locale, "/cekirdekler", t("title"), t("description"));
}

export default async function BeansPage({ params }: PageProps<"/[locale]/cekirdekler">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("beans");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />
      <BeanExplorer />
    </>
  );
}
