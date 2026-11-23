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

      {/* The calculator and the footer are both dark: a light band keeps them apart. */}
      <div aria-hidden="true" className="shell bg-paper py-8 md:py-12">
        <div className="flex items-center">
          <div className="h-px w-full bg-ink/15" />
          <span className="mx-4 block size-1.5 shrink-0 rotate-45 bg-copper" />
          <div className="h-px w-full bg-ink/15" />
        </div>
      </div>
    </>
  );
}
