import type { ReactNode } from "react";
import "./globals.css";

/**
 * The real <html> shell lives in app/[locale]/layout.tsx so it can set
 * `lang`. This pass-through exists so app/not-found.tsx has a parent.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
