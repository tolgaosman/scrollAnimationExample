"use client";

/**
 * Full-screen menu drawer.
 * The curtain drops with a decisive in/out curve; each link then rises out
 * of its own overflow mask, staggered, like type being set line by line.
 * Accessibility: dialog semantics, Esc to close, focus trapped inside and
 * restored to the trigger on close, page scroll locked while open.
 */
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { WallMark } from "@/components/brand/WallMark";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Link, usePathname } from "@/i18n/navigation";
import { ease } from "@/lib/motion";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NAV_ITEMS } from "./nav-items";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("nav");
  const tc = useTranslations("contact");
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Close whenever the route changes (a link inside was followed).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onCloseRef.current();
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const focusFirst = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
      trigger?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="menu-drawer"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("menuLabel")}
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto overscroll-contain bg-ink text-paper"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.85, ease: ease.drawer }}
        >
          <div className="shell flex h-16 shrink-0 items-center justify-between md:h-[4.5rem]">
            <span className="flex items-center gap-3">
              <WallMark className="size-7 text-copper-light" />
              {/* Wordmark drops out on the narrowest phones so switcher + close still fit. */}
              <span className="hidden wordmark text-[1.05rem] min-[400px]:inline">CYPRUS ROASTERS</span>
            </span>
            <div className="flex items-center gap-3">
              <LocaleSwitcher id="drawer" tone="paper" />
              <button
                type="button"
                onClick={onClose}
                className="group flex h-9 items-center gap-3 rounded-full border border-paper/30 pl-4 pr-3 transition-colors hover:bg-paper hover:text-ink"
              >
                <span className="eyebrow text-xs">{t("close")}</span>
                <span className="relative block size-3" aria-hidden="true">
                  <span className="absolute left-0 top-1/2 block h-px w-3 rotate-45 bg-current" />
                  <span className="absolute left-0 top-1/2 block h-px w-3 -rotate-45 bg-current" />
                </span>
              </button>
            </div>
          </div>

          <div className="shell grid-arch flex-1 items-end gap-y-12 pb-10 pt-8 md:pb-14">
            <nav aria-label={t("primary")} className="col-span-12 lg:col-span-8">
              <ul>
                {NAV_ITEMS.map((item, i) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href} className="overflow-hidden border-b border-paper/10">
                      <motion.div
                        initial={{ y: "110%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "110%" }}
                        transition={{ duration: 0.9, ease: ease.outQuint, delay: 0.25 + i * 0.055 }}
                      >
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className="group flex items-baseline gap-5 py-2 md:py-3"
                        >
                          <span className="eyebrow w-8 text-paper/45">{String(i + 1).padStart(2, "0")}</span>
                          <span
                            className={`font-display text-[clamp(2.4rem,7vw,5.5rem)] font-light leading-[1.02] tracking-[-0.03em] transition-[color,transform] duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-3 group-hover:italic ${
                              active ? "text-copper-light" : ""
                            }`}
                          >
                            {t(item.key)}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <motion.aside
              className="col-span-12 space-y-6 text-sm text-paper/70 lg:col-span-3 lg:col-start-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: ease.outQuint, delay: 0.55 }}
            >
              <p className="font-display text-xl italic text-paper">{t("drawerNote")}</p>
              <div>
                <p className="eyebrow mb-2 text-paper/45">{tc("address.label")}</p>
                <p>{tc("address.line1")}</p>
                <p>{tc("address.line2")}</p>
                <p>{tc("address.line3")}</p>
              </div>
              <div>
                <p className="eyebrow mb-2 text-paper/45">{tc("hours.label")}</p>
                <p>
                  {tc("hours.weekdays")} · {tc("hours.weekdaysTime")}
                </p>
                <p>
                  {tc("hours.saturday")} · {tc("hours.saturdayTime")}
                </p>
                <p>
                  {tc("hours.sunday")} · {tc("hours.sundayTime")}
                </p>
              </div>
              <SocialLinks tone="dark" compact className="pt-2" />
            </motion.aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
