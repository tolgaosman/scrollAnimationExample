"use client";

/**
 * Floating architectural nav bar.
 * - Transparent over the top of the page; gains a paper backing + hairline
 *   once you scroll.
 * - Slides away while scrolling down, returns on the slightest scroll up.
 * - Desktop link underline is a shared `layoutId` that glides between links.
 */
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { WallMark } from "@/components/brand/WallMark";
import { Link, usePathname } from "@/i18n/navigation";
import { ease, spring } from "@/lib/motion";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MenuDrawer } from "./MenuDrawer";
import { NAV_ITEMS } from "./nav-items";

export function Nav() {
  const t = useTranslations("nav");
  const tb = useTranslations("brand");
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (open) return;

    // Mobile: the nav stays put for the whole pinned hero animation and only
    // starts auto-hiding once the animation has finished playing.
    const runway = document.querySelector<HTMLElement>("[data-hero-runway]");
    if (runway && window.matchMedia("(max-width: 1023px)").matches) {
      const animationEnd = runway.getBoundingClientRect().bottom + y - window.innerHeight;
      if (y < animationEnd) {
        setHidden(false);
        return;
      }
    }

    if (y > prev + 4 && y > 160) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });

  const underlineTarget = hovered ?? pathname;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.55, ease: ease.outQuint }}
      >
        <div
          className={`shell flex h-16 items-center justify-between gap-3 transition-[background-color,border-color,backdrop-filter] duration-500 sm:gap-6 md:h-[4.5rem] ${
            // No backdrop blur on touch devices: re-blurring the constantly
            // repainting hero canvas every frame is a major source of scroll jank.
            scrolled
              ? "border-b border-ink/10 bg-paper/95 pointer-fine:bg-paper/85 pointer-fine:backdrop-blur-md"
              : "border-b border-transparent"
          }`}
        >
          <Link href="/" className="group flex items-center gap-3" aria-label={`Cyprus Roasters — ${t("home")}`}>
            <WallMark className="size-7 transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:rotate-[32.7deg]" />
            <span className="leading-none">
              <span className="block wordmark text-[1.05rem]">CYPRUS ROASTERS</span>
              <span className="eyebrow mt-0.5 block text-xs text-ink-soft">{tb("sub")}</span>
            </span>
          </Link>

          <nav aria-label={t("primary")} className="hidden lg:block" onMouseLeave={() => setHovered(null)}>
            <ul className="flex items-center gap-7">
              {NAV_ITEMS.slice(1).map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onMouseEnter={() => setHovered(item.href)}
                      onFocus={() => setHovered(item.href)}
                      className={`block py-2 text-[0.82rem] tracking-wide transition-opacity ${
                        active ? "opacity-100" : "opacity-65 hover:opacity-100"
                      }`}
                    >
                      {t(item.key)}
                    </Link>
                    <AnimatePresence>
                      {underlineTarget === item.href && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-x-0 -bottom-0.5 h-px bg-copper"
                          transition={spring.pill}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {/* Below `sm` the bar is too narrow for both; the drawer has its own switcher. */}
            <div className="hidden sm:block">
              <LocaleSwitcher id="bar" />
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="menu-drawer"
              className="group flex h-9 items-center gap-3 rounded-full bg-ink pl-4 pr-3 text-paper transition-transform duration-300 active:scale-[0.97] lg:hidden"
            >
              <span className="eyebrow text-xs">{t("menuLabel")}</span>
              <span className="flex flex-col gap-[3px]" aria-hidden="true">
                <span className="block h-px w-4 bg-paper transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5" />
                <span className="block h-px w-4 bg-paper transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:-translate-x-0.5" />
              </span>
              <span className="sr-only">{t("open")}</span>
            </button>
          </div>
        </div>
      </motion.header>

      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
