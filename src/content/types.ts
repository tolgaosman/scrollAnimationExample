import type { Locale } from "@/i18n/routing";

/** A value authored once per locale, side by side, so translations never drift apart. */
export type Localized<T = string> = Record<Locale, T>;

/** Pick the active locale's value. */
export const pick = <T,>(value: Localized<T>, locale: Locale): T => value[locale];
