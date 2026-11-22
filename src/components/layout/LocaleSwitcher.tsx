"use client";

/**
 * TR / EN switcher. The ink "pill" behind the active locale is a single
 * element shared between both buttons via `layoutId`, so on switch Motion
 * physically slides it across with a spring rather than cross-fading.
 */
import { LayoutGroup, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { spring } from "@/lib/motion";

export function LocaleSwitcher({ id = "nav", tone = "ink" }: { id?: string; tone?: "ink" | "paper" }) {
  const t = useTranslations("nav");
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Optimistic: the pill starts sliding immediately, before the new locale's
  // RSC payload arrives, so the interaction feels instant.
  const [selected, setSelected] = useState<Locale>(active);
  const shown = pending ? selected : active;

  const select = (locale: Locale) => {
    if (locale === active) return;
    setSelected(locale);
    startTransition(() => {
      router.replace(pathname, { locale, scroll: false });
    });
  };

  const fg = tone === "ink" ? "text-ink" : "text-paper";
  const activeFg = tone === "ink" ? "text-paper" : "text-ink";
  const pill = tone === "ink" ? "bg-ink" : "bg-paper";

  return (
    <LayoutGroup id={`locale-${id}`}>
      <div
        role="group"
        aria-label={t("language")}
        aria-busy={pending}
        className={`relative flex items-center rounded-full border p-[3px] ${
          tone === "ink" ? "border-ink/20" : "border-paper/25"
        }`}
      >
        {routing.locales.map((locale) => {
          const isActive = locale === shown;
          return (
            <button
              key={locale}
              type="button"
              lang={locale}
              aria-pressed={isActive}
              onClick={() => select(locale)}
              className={`relative z-0 h-7 w-10 rounded-full font-mono text-[0.7rem] tracking-[0.14em] uppercase transition-colors duration-300 ${
                isActive ? activeFg : `${fg} opacity-70 hover:opacity-100`
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="locale-pill"
                  className={`absolute inset-0 -z-10 rounded-full ${pill}`}
                  transition={spring.pill}
                />
              )}
              {locale}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
