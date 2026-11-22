import { defineRouting } from "next-intl/routing";

/**
 * Routing contract for the whole site.
 * - Turkish is the default locale and lives at the bare root ("/", "/cekirdekler").
 * - English is prefixed ("/en", "/en/beans").
 * - Internal pathnames (the keys below) mirror the folder names in src/app/[locale];
 *   each locale can expose its own human-readable slug.
 */
export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/cekirdekler": { tr: "/cekirdekler", en: "/beans" },
    "/menu": { tr: "/menu", en: "/menu" },
    "/ekibimiz": { tr: "/ekibimiz", en: "/team" },
    "/hakkimizda": { tr: "/hakkimizda", en: "/about" },
    "/iletisim": { tr: "/iletisim", en: "/contact" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;

/** Ordered list used by the nav, drawer, footer and sitemap. */
export const NAV_PATHS = [
  "/",
  "/cekirdekler",
  "/menu",
  "/ekibimiz",
  "/hakkimizda",
  "/iletisim",
] as const satisfies readonly AppPathname[];
