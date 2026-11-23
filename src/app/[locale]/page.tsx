import type { Metadata } from "next";
import { preload } from "react-dom";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrewBar } from "@/components/home/BrewBar";
import { ClosingCta } from "@/components/home/ClosingCta";
import { ScrollMachine } from "@/components/scroll-machine/ScrollMachine";
import { getFrameSequence } from "@/lib/frames";
import { pageMetadata } from "@/lib/metadata";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta.home" });
  return pageMetadata(locale as Locale, "/", t("title"), t("description"));
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const sequence = await getFrameSequence();

  // Preload frame 0001 in HTML <head> for 0ms first-paint readiness.
  if (sequence.urls[0]) {
    preload(sequence.urls[0], { as: "image", fetchPriority: "high" });
  }

  return (
    <>
      <ScrollMachine sequence={sequence} />
      <BrewBar />
      <ClosingCta />
    </>
  );
}
