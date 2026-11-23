import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrewCalculator } from "@/components/menu/BrewCalculator";
import { MenuList } from "@/components/menu/MenuList";
import { PageHero } from "@/components/ui/PageHero";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/menu">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta.menu" });
  return pageMetadata(locale as Locale, "/menu", t("title"), t("description"));
}

export default async function MenuPage({ params }: PageProps<"/[locale]/menu">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("menu");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />
      <MenuList />
      <BrewCalculator />
    </>
  );
}
