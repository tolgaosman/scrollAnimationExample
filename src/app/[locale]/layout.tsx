import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Instrument_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

// Serif: warm, soft-cornered display + editorial voice (opsz = optical size, SOFT = corner softness).
const display = Fraunces({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  variable: "--font-serif-src",
  display: "swap",
});

// UI + body + all numbers (tabular figures, not mono).
const sans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans-src",
  display: "swap",
});

// Machine telemetry + roast-curve axes only.
const mono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--num-src",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#c0c2c1",
  colorScheme: "light",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("home.title"), template: "%s" },
    description: t("home.description"),
    applicationName: t("siteName"),
    openGraph: {
      siteName: t("siteName"),
      locale: locale === "tr" ? "tr_TR" : "en_GB",
      type: "website",
      images: [{ url: "/frames/frame_0001.jpg", width: 1280, height: 720 }],
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="grain bg-paper text-ink">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
          >
            {t("skip")}
          </a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <FloatingWhatsApp />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
