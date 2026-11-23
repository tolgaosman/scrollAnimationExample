"use client";

/**
 * FloatingWhatsApp — circular icon-only bottom-right WhatsApp button in the
 * site's main copper accent.
 *
 * When the footer's own WhatsApp button (`[data-wa-target]`) scrolls up past the
 * floating button's resting spot, the floating one docks into it: it rides up
 * with the footer button, slides sideways towards it, shrinks and fades out, so
 * there's never a second WhatsApp button on screen. Scrolling back reverses it.
 * Scroll-linked, written straight to the element's style (no React state).
 */
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { SOCIAL_LINKS } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/SocialLinks";

/** Scroll distance (px) over which the button melts into the footer button. */
const DOCK_RANGE = 200;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function FloatingWhatsApp() {
  const t = useTranslations("ui.whatsapp");
  const href = SOCIAL_LINKS.whatsapp(t("prefill"));
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const target = document.querySelector<HTMLElement>("[data-wa-target]");
      let q = 0;
      let dx = 0;
      let dy = 0;

      if (target) {
        const cs = getComputedStyle(el);
        const size = el.offsetWidth;
        const restX = document.documentElement.clientWidth - parseFloat(cs.right) - size / 2;
        const restY = window.innerHeight - parseFloat(cs.bottom) - size / 2;
        const r = target.getBoundingClientRect();
        const tx = r.left + r.width / 2;
        const ty = r.top + r.height / 2;

        if (r.width > 0 && ty < restY) {
          q = clamp01((restY - ty) / DOCK_RANGE);
          dy = ty - restY; // glued to the footer button vertically
          dx = (tx - restX) * q; // slides towards it horizontally
        }
      }

      const fade = clamp01((q - 0.35) / 0.65);
      el.style.transform = q > 0 ? `translate3d(${dx}px, ${dy}px, 0) scale(${1 - 0.3 * q})` : "";
      el.style.opacity = q > 0 ? String(1 - fade) : "";
      const docked = q > 0.5;
      el.style.pointerEvents = docked ? "none" : "";
      el.tabIndex = docked ? -1 : 0;
      el.setAttribute("aria-hidden", docked ? "true" : "false");
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Footer content can shift once fonts/images settle.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("aria")}
      title={t("label")}
      className="fixed bottom-4 right-4 z-40 grid size-12 place-items-center rounded-full bg-copper text-paper shadow-[0_14px_34px_-10px_rgb(180_100_58/0.6)] transition-[background-color,translate,scale] duration-300 will-change-transform hover:-translate-y-0.5 hover:bg-copper-light active:scale-95 md:bottom-7 md:right-7 md:size-14"
    >
      <WhatsAppIcon className="size-5 md:size-6" />
    </a>
  );
}
