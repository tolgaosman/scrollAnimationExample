import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname, type Locale } from "@/i18n/routing";
import { SITE_URL } from "./site";

/** Absolute, locale-correct URL for an internal pathname (e.g. "/cekirdekler" → "/en/beans"). */
export function localizedUrl(locale: Locale, href: AppPathname): string {
  return `${SITE_URL}${getPathname({ locale, href })}`;
}

/** Per-page metadata with canonical + hreflang alternates for every locale. */
export function pageMetadata(locale: Locale, href: AppPathname, title: string, description: string): Metadata {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, href)]));
  return {
    title,
    description,
    alternates: {
      canonical: localizedUrl(locale, href),
      languages: { ...languages, "x-default": localizedUrl(routing.defaultLocale, href) },
    },
    openGraph: { title, description, url: localizedUrl(locale, href) },
  };
}
