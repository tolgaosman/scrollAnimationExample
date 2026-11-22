import { NAV_PATHS, type AppPathname } from "@/i18n/routing";

export const NAV_LABEL_KEY: Record<AppPathname, "home" | "beans" | "menu" | "team" | "about" | "contact"> = {
  "/": "home",
  "/cekirdekler": "beans",
  "/menu": "menu",
  "/ekibimiz": "team",
  "/hakkimizda": "about",
  "/iletisim": "contact",
};

export const NAV_ITEMS = NAV_PATHS.map((href) => ({ href, key: NAV_LABEL_KEY[href] }));
