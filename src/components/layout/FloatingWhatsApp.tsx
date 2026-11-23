"use client";

/**
 * FloatingWhatsApp — bottom-right quick-contact action styled in SURLARİÇİ's
 * espresso-ink, warm paper, and copper palette (never jarring neon green).
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
      className="group fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-2.5 rounded-full border border-copper/55 bg-ink pl-3.5 pr-4 text-paper shadow-[0_14px_34px_-10px_rgb(28_24_20/0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:border-copper-light hover:bg-copper active:scale-95 md:bottom-7 md:right-7"
    >
      <span className="relative flex size-6 items-center justify-center">
        <span className="absolute -right-0.5 -top-0.5 block size-2 rounded-full bg-copper-light ring-2 ring-ink transition-colors group-hover:bg-paper group-hover:ring-copper" aria-hidden="true" />
        <WhatsAppIcon className="size-5" />
      </span>
      <span className="eyebrow hidden text-[0.65rem] tracking-[0.16em] text-paper sm:inline">
        {t("label")}
      </span>
    </a>
  );
}

