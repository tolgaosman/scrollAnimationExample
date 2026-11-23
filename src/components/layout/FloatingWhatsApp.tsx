"use client";

/**
 * FloatingWhatsApp — circular icon-only bottom-right WhatsApp button
 * styled in SURLARİÇİ's espresso-ink, warm paper, and copper palette.
 */
import { useTranslations } from "next-intl";
import { SOCIAL_LINKS } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/SocialLinks";

export function FloatingWhatsApp() {
  const t = useTranslations("ui.whatsapp");
  const href = SOCIAL_LINKS.whatsapp(t("prefill"));

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("aria")}
      title={t("label")}
      className="fixed bottom-5 right-5 z-40 grid size-13 place-items-center rounded-full border border-copper/55 bg-ink text-paper shadow-[0_14px_34px_-10px_rgb(28_24_20/0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:border-copper-light hover:bg-copper active:scale-95 md:bottom-7 md:right-7 md:size-14"
    >
      <WhatsAppIcon className="size-6" />
    </a>
  );
}
