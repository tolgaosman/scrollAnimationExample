"use client";

import { useId } from "react";

interface CoffeeBeanSwatchProps {
  tone: string;
  className?: string;
}

/**
 * Stylized roasted coffee bean tinted with a bean's signature tone.
 * Uses a radial surface gradient, soft rim sheen, and recessed S-curve
 * center crease so even deep espresso roasts read clearly at small sizes.
 */
export function CoffeeBeanSwatch({ tone, className = "size-9" }: CoffeeBeanSwatchProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `bean-grad-${uid}`;
  const highlight = `color-mix(in oklab, ${tone} 60%, white)`;
  const shadow = `color-mix(in oklab, ${tone} 56%, black)`;
  const crease = `color-mix(in oklab, ${tone} 28%, black)`;
  const rim = `color-mix(in oklab, ${tone} 72%, white)`;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradId} cx="34%" cy="28%" r="74%" fx="30%" fy="24%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="52%" stopColor={tone} />
          <stop offset="100%" stopColor={shadow} />
        </radialGradient>
      </defs>

      <g transform="rotate(-28 24 24)">
        {/* Subtle grounding shadow */}
        <ellipse cx="25.2" cy="25.4" rx="14.2" ry="19.8" fill="rgb(28 24 20 / 0.16)" />

        {/* Bean body */}
        <ellipse cx="24" cy="24" rx="14.4" ry="20.2" fill={`url(#${gradId})`} />

        {/* Soft rim outline so light & dark roasts both separate cleanly from paper */}
        <ellipse
          cx="24"
          cy="24"
          rx="14"
          ry="19.8"
          stroke={rim}
          strokeOpacity="0.28"
          strokeWidth="0.9"
        />

        {/* Highlight ridge alongside the center cut */}
        <path
          d="M25.1 5.1 C 21.1 15.2, 29.1 32.8, 25.1 42.9"
          stroke={rim}
          strokeOpacity="0.4"
          strokeWidth="1.15"
          strokeLinecap="round"
        />

        {/* Iconic roasted coffee bean S-curve center crease */}
        <path
          d="M24 4.4 C 19.6 15, 28.4 33, 24 43.6"
          stroke={crease}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

