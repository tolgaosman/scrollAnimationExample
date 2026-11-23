/** Public origin used for canonical URLs, sitemap and Open Graph. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cyprusroasters.coffee").replace(/\/$/, "");

/** Centralized social & messaging endpoints (override via NEXT_PUBLIC_* env vars). */
const WHATSAPP_PHONE = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "903920000000").replace(/\D/g, "");

export const SOCIAL_LINKS = {
  whatsapp: (text?: string) =>
    `https://wa.me/${WHATSAPP_PHONE}${text ? `?text=${encodeURIComponent(text)}` : ""}`,
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/cyprusroasters",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://facebook.com/cyprusroasters",
} as const;
