"use client";

/**
 * BeanExplorer — filterable bean index + detail sheet.
 * - Filter tabs share one sliding underline (`layoutId`).
 * - Rows enter/leave with AnimatePresence and re-flow with `layout`.
 * - Opening a row flies its roast-colour swatch from the row into the detail
 *   sheet, and closing flies it back, so the eye follows the same object. The
 *   swatch travels in its own fixed layer (not inside the sliding, clipped
 *   sheet), so its path is always row <-> sheet slot, in both directions.
 */
import { animate, AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { beans, type Bean, type BeanCategory } from "@/content/beans";
import { CoffeeBeanSwatch } from "@/components/ui/CoffeeBeanSwatch";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Meter } from "@/components/ui/Meter";
import { ease, spring } from "@/lib/motion";
import { RoastCurve } from "./RoastCurve";

type Filter = "all" | BeanCategory;
type SortKey = "featured" | "altitudeDesc" | "roastAsc";
const FILTERS: Filter[] = ["all", "espresso", "filter", "micro"];
const ROAST_ORDER = { light: 0, medium: 1, mediumDark: 2 } as const;

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}
interface Fly {
  id: string;
  tone: string;
  from: Box;
  /** Closing only: the row swatch to fly back to. Opening measures the sheet slot itself. */
  to?: Box;
  dir: "in" | "out";
}

const toBox = (r: DOMRect): Box => ({ left: r.left, top: r.top, width: r.width, height: r.height });
const rowSwatchEl = (id: string) => document.querySelector<HTMLElement>(`[data-swatch="${id}"]`);
const sheetSwatchInner = () => document.querySelector<HTMLElement>("[data-sheet-swatch-inner]");
const FLY_SPRING = { type: "spring", stiffness: 300, damping: 34, mass: 0.8 } as const;

export function BeanExplorer() {
  const t = useTranslations("beans");
  const locale = useLocale();
  const sortId = useId();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const list = beans.filter((b) => filter === "all" || b.category === filter);
    if (sort === "altitudeDesc") return [...list].sort((a, b) => b.altitude - a.altitude);
    if (sort === "roastAsc") return [...list].sort((a, b) => ROAST_ORDER[a.roast] - ROAST_ORDER[b.roast]);
    return list;
  }, [filter, sort]);

  const open = beans.find((b) => b.id === openId) ?? null;

  const [fly, setFly] = useState<Fly | null>(null);
  /** Row whose swatch is currently "in the air" / inside the sheet. */
  const [hiddenId, setHiddenId] = useState<string | null>(null);

  const openBean = (bean: Bean) => {
    const el = rowSwatchEl(bean.id);
    setOpenId(bean.id);
    if (!el) {
      requestAnimationFrame(() => {
        const inner = sheetSwatchInner();
        if (inner) inner.style.opacity = "1";
      });
      return;
    }
    setHiddenId(bean.id);
    setFly({ id: bean.id, tone: bean.tone, from: toBox(el.getBoundingClientRect()), dir: "in" });
  };

  const closeSheet = () => {
    if (!openId) return;
    const slot = document.querySelector<HTMLElement>("[data-sheet-swatch]");
    const row = rowSwatchEl(openId);
    const bean = beans.find((b) => b.id === openId);
    const inner = sheetSwatchInner();
    if (inner) inner.style.opacity = "0";
    if (slot && row && bean) {
      setFly({
        id: openId,
        tone: bean.tone,
        from: toBox(slot.getBoundingClientRect()),
        to: toBox(row.getBoundingClientRect()),
        dir: "out",
      });
    } else {
      setHiddenId(null);
    }
    setOpenId(null);
  };
  // Stable identity so the sheet's focus/scroll-lock effect doesn't re-run on every render.
  const closeRef = useRef(closeSheet);
  useEffect(() => {
    closeRef.current = closeSheet;
  });
  const onClose = useCallback(() => closeRef.current(), []);

  const onFlyDone = useCallback((done: Fly) => {
    if (done.dir === "in") {
      const inner = sheetSwatchInner();
      if (inner) inner.style.opacity = "1";
    } else {
      setHiddenId(null);
    }
    setFly((cur) => (cur === done ? null : cur));
  }, []);

  return (
    <LayoutGroup>
      <section className="shell pb-18 md:pb-24" aria-label={t("title")}>
        {/* Roastery lot telemetry bar */}
        <dl className="mb-8 grid grid-cols-3 divide-x divide-ink/15 border border-ink/15 bg-paper-deep/45">
          <div className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6">
            <dt className="eyebrow text-xs text-ink-soft sm:text-xs">{t("summary.lots")}</dt>
            <dd className="mt-1 whitespace-nowrap num text-xs tabular-nums sm:text-sm md:text-base">{beans.length}</dd>
          </div>
          <div className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6">
            <dt className="eyebrow text-xs text-ink-soft sm:text-xs">{t("summary.altitude")}</dt>
            <dd className="mt-1 whitespace-nowrap num text-xs tabular-nums sm:text-sm md:text-base">
              {(1350).toLocaleString(locale)} – {(2150).toLocaleString(locale)} m
            </dd>
          </div>
          <div className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6">
            <dt className="eyebrow text-xs text-ink-soft sm:text-xs">{t("summary.schedule")}</dt>
            <dd className="mt-1 whitespace-nowrap num text-xs sm:text-sm md:text-base">{t("summary.scheduleValue")}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3 border-b border-ink/15 pb-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div
            role="group"
            aria-label={t("filters.label")}
            className="-mx-[clamp(1.25rem,4vw,4rem)] flex flex-nowrap gap-x-5 overflow-x-auto px-[clamp(1.25rem,4vw,4rem)] [scrollbar-width:none] sm:mx-0 sm:-mb-3 sm:flex-wrap sm:gap-x-6 sm:overflow-visible sm:px-0"
          >
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f)}
                  className={`relative shrink-0 whitespace-nowrap pb-2.5 text-sm transition-opacity sm:pb-3 md:text-base ${active ? "opacity-100" : "opacity-55 hover:opacity-100"}`}
                >
                  {t(`filters.${f}`)}
                  {active && (
                    <motion.span layoutId="bean-filter" className="absolute inset-x-0 bottom-0 h-[2px] bg-copper" transition={spring.pill} />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4">
            <CustomSelect
              id={sortId}
              variant="pill"
              ariaLabel={t("sort.label")}
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={[
                { value: "featured", label: t("sort.featured") },
                { value: "altitudeDesc", label: t("sort.altitudeDesc") },
                { value: "roastAsc", label: t("sort.roastAsc") },
              ]}
            />
            <p className="eyebrow hidden text-ink-soft sm:block" aria-live="polite">
              {t("count", { count: visible.length })}
            </p>
          </div>
        </div>

        <motion.ul layout className="relative">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((bean, i) => (
              <motion.li
                key={bean.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ ...spring.soft, delay: i * 0.03 }}
                className="border-b border-ink/12"
              >
                <button
                  type="button"
                  onClick={() => openBean(bean)}
                  aria-haspopup="dialog"
                  className="group grid w-full grid-cols-12 items-center gap-x-4 gap-y-2 py-6 text-left md:py-8"
                >
                  <span className="eyebrow col-span-2 text-ink-soft md:col-span-1">
                    {String(beans.indexOf(bean) + 1).padStart(2, "0")}
                  </span>
                  <span className="col-span-10 flex items-center gap-4 md:col-span-5">
                    <span
                      data-swatch={bean.id}
                      className={`block size-9 shrink-0 md:size-11 ${hiddenId === bean.id ? "invisible" : ""}`}
                      aria-hidden="true"
                    >
                      <CoffeeBeanSwatch tone={bean.tone} className="size-full" />
                    </span>
                    <span className="font-display text-2xl leading-tight tracking-tight transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-2 md:text-[2.1rem]">
                      {bean.name}
                    </span>
                  </span>
                  <span className="col-span-6 col-start-3 text-sm md:col-span-2 md:col-start-auto">
                    {bean.origin[locale]}
                  </span>
                  <span className="col-span-4 whitespace-nowrap num text-xs tabular-nums text-ink-soft md:col-span-1">
                    {bean.altitude.toLocaleString(locale)} m
                  </span>
                  <span className="col-span-10 col-start-3 text-sm text-ink-soft md:col-span-2 md:col-start-auto">
                    {bean.process[locale]}
                  </span>
                  <span className="hidden justify-end md:col-span-1 md:flex" aria-hidden="true">
                    <span className="grid size-9 place-items-center rounded-full border border-ink/20 transition-colors duration-300 group-hover:bg-ink group-hover:text-paper">
                      +
                    </span>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </section>

      <BeanSheet bean={open} onClose={onClose} />

      {fly && <FlyingSwatch key={`${fly.id}-${fly.dir}`} fly={fly} onDone={onFlyDone} />}
    </LayoutGroup>
  );
}

/**
 * The swatch in flight, in its own fixed layer above the sheet. On mount it
 * measures its destination (opening: the sheet's swatch slot at rest; closing:
 * the row swatch) and springs there.
 */
function FlyingSwatch({ fly, onDone }: { fly: Fly; onDone: (fly: Fly) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let to = fly.to;
    if (fly.dir === "in") {
      const slot = document.querySelector<HTMLElement>("[data-sheet-swatch]");
      const aside = slot?.closest<HTMLElement>("[role=dialog]");
      if (slot && aside) {
        // The sheet is still sliding in from the right: undo its current offset.
        const shift = aside.getBoundingClientRect().left - aside.offsetLeft;
        const r = slot.getBoundingClientRect();
        to = { left: r.left - shift, top: r.top, width: r.width, height: r.height };
      }
    }
    if (!to) {
      doneRef.current(fly);
      return;
    }
    let cancelled = false;
    const controls = animate(el, { ...to }, FLY_SPRING);
    controls.then(() => {
      if (!cancelled) doneRef.current(fly);
    });
    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [fly]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed z-[70] block"
      style={{ left: fly.from.left, top: fly.from.top, width: fly.from.width, height: fly.from.height }}
    >
      <CoffeeBeanSwatch tone={fly.tone} className="size-full" />
    </span>
  );
}

function BeanSheet({ bean, onClose }: { bean: Bean | null; onClose: () => void }) {
  const t = useTranslations("beans");
  const locale = useLocale();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!bean) return;
    const trigger = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      trigger?.focus?.();
    };
  }, [bean, onClose]);

  return (
    <AnimatePresence>
      {bean && (
        <motion.div key="sheet" className="fixed inset-0 z-[65]" initial="closed" animate="open" exit="closed">
          <motion.div
            className="absolute inset-0 bg-ink/45"
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={`sheet-title-${bean.id}`}
            className="absolute inset-y-0 right-0 flex w-full max-w-[44rem] flex-col lg:max-w-[66rem] overflow-y-auto overscroll-contain bg-paper"
            variants={{ open: { x: "0%" }, closed: { x: "100%" } }}
            transition={{ duration: 0.48, ease: ease.drawer }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-paper/95 px-6 py-4 pointer-fine:backdrop-blur md:px-10">
              <span className="eyebrow text-copper">
                {bean.origin[locale]} · {t(`roastLevels.${bean.roast}`)}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="eyebrow rounded-full border border-ink/20 px-4 py-2 transition-colors hover:bg-ink hover:text-paper"
              >
                {t("labels.close")}
              </button>
            </div>

            <div className="grid gap-y-9 px-6 pb-16 pt-8 md:px-10 lg:flex-1 lg:grid-cols-2 lg:content-center lg:gap-x-14 lg:gap-y-0 lg:pb-10 lg:pt-8">
              {/* Left column: who it is */}
              <div className="space-y-8 lg:space-y-8">
              <div className="flex items-center gap-5">
                {/* Slot the flying swatch lands in; it is revealed imperatively once it arrives. */}
                <span data-sheet-swatch className="block size-16 shrink-0 md:size-20" aria-hidden="true">
                  <span data-sheet-swatch-inner className="block size-full" style={{ opacity: 0 }}>
                    <CoffeeBeanSwatch tone={bean.tone} className="size-full" />
                  </span>
                </span>
                <h2
                  id={`sheet-title-${bean.id}`}
                  className="font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] tracking-tight"
                >
                  {bean.name}
                </h2>
              </div>

              <p className="font-display text-xl italic leading-snug text-ink-soft lg:text-2xl">{bean.story[locale]}</p>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-ink/12 py-6 sm:grid-cols-3">
                <Spec
                  label={t("labels.farm")}
                  value={typeof bean.farm === "string" ? bean.farm : bean.farm[locale]}
                />
                <Spec label={t("labels.region")} value={bean.region} />
                <Spec label={t("labels.altitude")} value={`${bean.altitude.toLocaleString(locale)} m`} mono />
                <Spec label={t("labels.process")} value={bean.process[locale]} />
                <Spec label={t("labels.variety")} value={bean.variety} />
                <Spec label={t("labels.harvest")} value={bean.harvest} mono />
              </dl>

              <div>
                <p className="eyebrow mb-3">{t("labels.notes")}</p>
                <ul className="flex flex-wrap gap-2">
                  {bean.notes[locale].map((n) => (
                    <li key={n} className="rounded-full border border-ink/20 px-3 py-1 text-sm">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>

              </div>

              {/* Right column: how it tastes and how it was roasted */}
              <div className="space-y-8 lg:space-y-8 lg:self-center">
              <div className="space-y-2.5">
                <Meter label={t("labels.acidity")} value={bean.acidity} />
                <Meter label={t("labels.body")} value={bean.body} />
                <Meter label={t("labels.sweetness")} value={bean.sweetness} />
              </div>

              <RoastCurve profile={bean.profile} />

              <div className="brushed-steel flex items-center justify-between gap-4 p-5">
                <span className="eyebrow">{t("labels.brewWith")}</span>
                <span className="num text-sm">{bean.brew[locale]}</span>
              </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Spec({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="eyebrow text-ink-soft">{label}</dt>
      <dd className={`mt-1 text-sm ${mono ? "num tabular-nums" : ""}`}>{value}</dd>
    </div>
  );
}
