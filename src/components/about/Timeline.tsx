"use client";

/**
 * Vertical timeline. The copper spine fills in step with the scroll
 * (useScroll → scaleY); each milestone node lights up as the fill passes
 * it, and each entry expands on click to reveal its full story.
 */
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { timeline } from "@/content/timeline";
import { ease } from "@/lib/motion";

export function Timeline() {
  const t = useTranslations("about.timeline");
  const locale = useLocale() as "tr" | "en";
  const ref = useRef<HTMLOListElement>(null);
  const [open, setOpen] = useState<number>(timeline.length - 1);
  const [reached, setReached] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setReached(Math.round(p * (timeline.length - 1)));
  });

  return (
    <section className="shell grid-arch gap-y-10 py-24 md:py-36" aria-labelledby="timeline-title">
      <div className="col-span-12 md:col-span-4">
        <div className="md:sticky md:top-32">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="timeline-title" className="display mt-4 text-headline">
            {t("title")}
          </h2>
        </div>
      </div>

      <ol ref={ref} className="relative col-span-12 md:col-span-7 md:col-start-6">
        {/* spine */}
        <span className="absolute bottom-2 left-[0.45rem] top-2 w-px bg-ink/15" aria-hidden="true" />
        <motion.span
          className="absolute bottom-2 left-[0.45rem] top-2 w-px origin-top bg-copper"
          style={{ scaleY: fill }}
          aria-hidden="true"
        />

        {timeline.map((m, i) => {
          const isOpen = open === i;
          const lit = i <= reached;
          return (
            <li key={m.year} className="relative pb-10 pl-10 last:pb-0 md:pl-14">
              <span
                aria-hidden="true"
                className={`absolute left-0 top-2 block size-[0.95rem] rounded-full border transition-colors duration-500 ${
                  lit ? "border-copper bg-copper" : "border-ink/30 bg-paper"
                }`}
              />
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                aria-controls={`milestone-${m.year}`}
                className="group flex w-full items-baseline justify-between gap-6 text-left"
              >
                <span className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6">
                  <span className="font-mono text-sm tabular-nums text-copper">{m.year}</span>
                  <span className="font-display text-2xl tracking-tight transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-1 md:text-3xl">
                    {m.title[locale]}
                  </span>
                </span>
                <span className="eyebrow shrink-0 text-ink-soft">
                  <span className="sr-only">{isOpen ? t("collapse") : t("expand")}</span>
                  <motion.span
                    aria-hidden="true"
                    className="inline-block text-lg"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.4, ease: ease.outQuint }}
                  >
                    +
                  </motion.span>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`milestone-${m.year}`}
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.55, ease: ease.outQuint }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-[56ch] pt-3 leading-relaxed text-ink-soft">{m.body[locale]}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
