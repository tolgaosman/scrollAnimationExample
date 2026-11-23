import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "solid" | "ghost" | "light";

const styles: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:bg-copper",
  ghost: "border border-ink/25 text-ink hover:border-copper hover:bg-copper hover:text-paper",
  light: "bg-paper text-ink hover:bg-copper hover:text-paper",
};

/** Pill CTA whose arrow slides out and is replaced by a twin sliding in. */
export function ArrowLink({
  variant = "solid",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link
      {...props}
      className={`group inline-flex h-12 items-center gap-4 rounded-full pl-6 pr-2 text-sm tracking-wide transition-colors duration-300 active:scale-[0.98] ${styles[variant]} ${className}`}
    >
      <span>{children}</span>
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-full bg-current/10" aria-hidden="true">
        <Arrow className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-6" />
        <Arrow className="absolute -translate-x-6 transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-0" />
      </span>
    </Link>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className={className} aria-hidden="true">
      <path d="M0 5h12.5M8.5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
