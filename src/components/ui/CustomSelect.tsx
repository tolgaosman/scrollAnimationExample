"use client";

/**
 * CustomSelect — editorial architectural dropdown matching SURLARİÇİ's palette.
 * Keyboard accessible (ArrowUp/Down, Home/End, Enter/Space, Escape), works with
 * associated <label htmlFor={id}>, and animates smoothly via Motion.
 */
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ease } from "@/lib/motion";

export interface SelectOption {
  value: string;
  label: string;
  meta?: string;
}

interface CustomSelectProps {
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  describedBy?: string;
  invalid?: boolean;
  /** "underline" matches ContactForm fields; "pill" matches compact toolbar controls. */
  variant?: "underline" | "pill";
  ariaLabel?: string;
  className?: string;
}

export function CustomSelect({
  id,
  value,
  options,
  onChange,
  onBlur,
  placeholder = "—",
  describedBy,
  invalid = false,
  variant = "underline",
  ariaLabel,
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value)),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

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

  const openMenu = () => {
    setHighlight(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const commit = (val: string) => {
    onChange(val);
    setOpen(false);
    onBlur?.();
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openMenu();
      } else {
        setHighlight((h) => (e.key === "ArrowDown" ? (h + 1) % options.length : (h - 1 + options.length) % options.length));
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && options[highlight]) commit(options[highlight].value);
      else openMenu();
    } else if (e.key === "Home" && open) {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === "End" && open) {
      e.preventDefault();
      setHighlight(options.length - 1);
    }
  };

  const triggerClasses =
    variant === "pill"
      ? `flex h-9 items-center justify-between gap-3 rounded-full border px-4 text-xs tracking-wide transition-colors ${
          open ? "border-copper bg-paper text-ink" : "border-ink/20 bg-paper/70 text-ink hover:border-ink/50"
        }`
      : `flex w-full items-center justify-between gap-2 border-0 border-b bg-transparent px-0 py-2.5 text-left text-base outline-none transition-colors ${
          invalid ? "border-copper" : open ? "border-ink" : "border-ink/25 hover:border-ink/60"
        }`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? (setOpen(false), onBlur?.()) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={triggerClasses}
      >
        <span className={`truncate ${selected ? "text-ink" : "text-ink/40"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-ink-soft transition-transform duration-300 ${open ? "rotate-180 text-copper" : ""}`}
        >
          <path d="M2.25 4.25L6 8l3.75-3.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={`${id}-listbox`}
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: ease.outExpo }}
            className="absolute left-0 right-0 z-50 mt-2 max-h-60 min-w-[11rem] overflow-y-auto border border-ink/20 bg-paper p-1.5 shadow-[0_20px_44px_-16px_rgb(28_24_20/0.28)]"
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === highlight;
              return (
                <li key={opt.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(idx)}
                    onClick={() => commit(opt.value)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-ink text-paper"
                        : isHighlighted
                          ? "bg-stone-light/70 text-ink"
                          : "text-ink hover:bg-stone-light/50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`block size-1.5 rounded-full transition-opacity ${
                          isSelected ? "bg-copper-light opacity-100" : "bg-copper opacity-0"
                        }`}
                        aria-hidden="true"
                      />
                      <span>{opt.label}</span>
                    </span>
                    {opt.meta && (
                      <span className={`font-mono text-[0.68rem] ${isSelected ? "text-paper/65" : "text-ink-soft"}`}>
                        {opt.meta}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

