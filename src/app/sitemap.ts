import type { MetadataRoute } from "next";
import { NAV_PATHS, routing } from "@/i18n/routing";
import { localizedUrl } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return NAV_PATHS.map((href) => ({
    url: localizedUrl(routing.defaultLocale, href),
    changeFrequency: "weekly",
    priority: href === "/" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, href)])),
    },
  }));
}
