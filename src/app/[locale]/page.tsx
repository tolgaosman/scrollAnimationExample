import type { Metadata } from "next";
import { preload } from "react-dom";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrewBar } from "@/components/home/BrewBar";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Manifesto } from "@/components/home/Manifesto";
import { SignatureRoasts } from "@/components/home/SignatureRoasts";
import { CafeStops } from "@/components/scroll-machine/CafeStops";
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

  // Start downloading the hero's opening frame in the HTML head before hydration.
  if (sequence.urls[0]) {
    preload(sequence.urls[0], { as: "image", fetchPriority: "high" });
  }

  return (
    <>
      <ScrollMachine sequence={sequence}>
        <CafeStops />
      </ScrollMachine>
      <Manifesto />
      <SignatureRoasts />
      <BrewBar />
      <ClosingCta />
    </>
  );
}
