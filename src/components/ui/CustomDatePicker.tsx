"use client";

/**
 * CustomDatePicker — bespoke SURLARİÇİ architectural calendar selector.
 * Replaces native OS date inputs with a warm paper/ink/copper calendar grid,
 * locale-aware Turkish/English formatting, past-date disabling, and smooth Motion popover.
 */
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { ease } from "@/lib/motion";

interface CustomDatePickerProps {
  id: string;
  value: string; // YYYY-MM-DD or ""
  onChange: (value: string) => void;
  onBlur?: () => void;
  describedBy?: string;
  invalid?: boolean;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIso(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function CustomDatePicker({
  id,
  value,
  onChange,
  onBlur,
  describedBy,
  invalid = false,
}: CustomDatePickerProps) {
  const locale = useLocale();
  const t = useTranslations("ui.calendar");
  const intlLocale = locale === "tr" ? "tr-TR" : "en-GB";

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const todayIso = toIso(today);

  const selectedDate = parseIso(value);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => (selectedDate ?? today).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selectedDate ?? today).getMonth());

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onBlur]);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(intlLocale, { weekday: "short" });
    // Monday (Jan 6 2025) → Sunday
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2025, 0, 6 + i)).slice(0, 2));
  }, [intlLocale]);

  const monthTitle = useMemo(() => {
    const label = new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" }).format(
      new Date(viewYear, viewMonth, 1),
    );
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [intlLocale, viewYear, viewMonth]);

  const formattedValue = useMemo(() => {
    if (!selectedDate) return "";
    return new Intl.DateTimeFormat(intlLocale, { day: "2-digit", month: "short", year: "numeric" }).format(selectedDate);
  }, [intlLocale, selectedDate]);

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Monday-first offset (0 = Mon .. 6 = Sun)
    const startOffset = (first.getDay() + 6) % 7;
    const list: Array<{ iso: string; day: number; disabled: boolean } | null> = [];
    for (let i = 0; i < startOffset; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const iso = toIso(date);
      list.push({ iso, day: d, disabled: iso < todayIso });
    }
    return list;
  }, [viewYear, viewMonth, todayIso]);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const selectDay = (iso: string) => {
    onChange(iso);
    setOpen(false);
    onBlur?.();
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={describedBy}
        data-invalid={invalid || undefined}
        onClick={() => {
          if (!open) {
            const base = selectedDate ?? today;
            setViewYear(base.getFullYear());
            setViewMonth(base.getMonth());
          } else {
            onBlur?.();
          }
          setOpen((o) => !o);
        }}
        className={`flex w-full items-center justify-between gap-2 border-0 border-b bg-transparent px-0 py-2.5 text-left text-base outline-none transition-colors ${
          invalid ? "border-copper" : open ? "border-ink" : "border-ink/25 hover:border-ink/60"
        }`}
      >
        <span className={formattedValue ? "num text-sm tabular-nums text-ink" : "text-sm text-ink/40"}>
          {formattedValue || t("placeholder")}
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 transition-colors ${open ? "text-copper" : "text-ink-soft"}`}
        >
          <rect x="2" y="3.25" width="12" height="10.75" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 6.5h12M5.25 1.75v2.5M10.75 1.75v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t("dialogLabel")}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: ease.outExpo }}
            className="absolute left-0 z-50 mt-2 w-[min(18.5rem,calc(100vw-2.5rem))] border border-ink/20 bg-paper p-3.5 shadow-[0_24px_48px_-16px_rgb(28_24_20/0.32)] sm:p-4"
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between border-b border-ink/12 pb-2.5">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label={t("prevMonth")}
                className="grid size-7 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="font-display text-lg tracking-tight text-ink">{monthTitle}</span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label={t("nextMonth")}
                className="grid size-7 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M3.5 2L6.5 5l-3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Weekdays */}
            <div className="mb-1.5 grid grid-cols-7 text-center">
              {weekdays.map((wd) => (
                <span key={wd} className="eyebrow py-1 text-xs text-ink-soft">
                  {wd}
                </span>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, i) =>
                cell ? (
                  <button
                    key={cell.iso}
                    type="button"
                    disabled={cell.disabled}
                    onClick={() => selectDay(cell.iso)}
                    className={`grid h-8 place-items-center num text-xs tabular-nums transition-colors ${
                      cell.iso === value
                        ? "bg-copper text-paper"
                        : cell.iso === todayIso
                          ? "border border-ink/35 bg-stone-light/60 text-ink hover:bg-ink hover:text-paper"
                          : cell.disabled
                            ? "cursor-not-allowed text-ink/25"
                            : "text-ink hover:bg-stone-light"
                    }`}
                  >
                    {cell.day}
                  </button>
                ) : (
                  <span key={`empty-${i}`} aria-hidden="true" />
                ),
              )}
            </div>

            {/* Footer actions */}
            <div className="mt-3 flex items-center justify-between border-t border-ink/12 pt-2.5">
              <button
                type="button"
                onClick={() => selectDay(todayIso)}
                className="eyebrow text-xs text-copper transition-opacity hover:opacity-75"
              >
                {t("today")}
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                    onBlur?.();
                  }}
                  className="eyebrow text-xs text-ink-soft transition-colors hover:text-ink"
                >
                  {t("clear")}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

