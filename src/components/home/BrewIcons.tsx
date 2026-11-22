/** Hairline brew-device drawings, one stroke weight, drawn on a 64×64 grid. */
import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const BrewIcons = {
  espresso: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}>
      <path d="M14 30h30v6a13 13 0 0 1-13 13h-4a13 13 0 0 1-13-13v-6Z" />
      <path d="M44 33h4a5 5 0 0 1 0 10h-6" />
      <path d="M10 53h40" />
      <path d="M24 16c-2 3 2 5 0 8M31 14c-2 3 2 5 0 8" />
    </svg>
  ),
  pourover: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}>
      <path d="M14 14h36L36 38h-8L14 14Z" />
      <path d="M24 38v4h16v-4" />
      <path d="M18 44h28v10H18z" />
      <path d="M22 20h20M32 6v5" />
    </svg>
  ),
  coldbrew: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}>
      <path d="M20 10h24v6l3 6v32a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2V22l3-6v-6Z" />
      <path d="M17 30h30" />
      <rect x="23" y="36" width="8" height="8" rx="1" />
      <rect x="33" y="40" width="7" height="7" rx="1" />
    </svg>
  ),
  cezve: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}>
      <path d="M18 26h22l-2 22a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4l-2-22Z" />
      <path d="M18 26l-3-3M40 30l16-8" />
      <path d="M8 56h48" />
      <path d="M10 56c4-4 8-4 12 0s8 4 12 0 8-4 12 0 6 3 8 1" />
    </svg>
  ),
};

export type BrewKey = keyof typeof BrewIcons;
