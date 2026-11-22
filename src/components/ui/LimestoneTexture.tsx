/**
 * LimestoneTexture — procedural "sarı taş" ashlar masonry.
 * Fractal noise lit by a low raking light gives the porous limestone
 * surface; a second, coarser noise mottles the colour; a pattern of
 * staggered courses draws the mortar joints. No image files involved.
 */
import { useId } from "react";

export function LimestoneTexture({
  className = "",
  courses = true,
  tint = "#d6c29a",
}: {
  className?: string;
  courses?: boolean;
  tint?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} aria-hidden="true" preserveAspectRatio="none" width="100%" height="100%">
      <defs>
        <filter id={`stone-${id}`} x="0" y="0" width="100%" height="100%">
          {/* 2 octaves: at 0.85 base frequency, octaves 3–4 are finer than a pixel
              (pure aliasing) but each doubles the filter's raster cost. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="grain" />
          <feDiffuseLighting in="grain" lightingColor="#fff6e4" surfaceScale="1.6" result="lit">
            <feDistantLight azimuth="225" elevation="52" />
          </feDiffuseLighting>
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3" result="mottle" />
          <feColorMatrix
            in="mottle"
            type="matrix"
            values="0 0 0 0 0.62  0 0 0 0 0.5  0 0 0 0 0.32  0 0 0 0.55 0"
            result="mottleTint"
          />
          <feComposite in="lit" in2="SourceGraphic" operator="arithmetic" k1="0.9" k2="0" k3="0" k4="0" result="stone" />
          <feBlend in="mottleTint" in2="stone" mode="multiply" />
        </filter>
        <pattern id={`ashlar-${id}`} width="240" height="96" patternUnits="userSpaceOnUse">
          <path
            d="M0 0.5H240 M0 48.5H240 M0.5 0V48 M120.5 0V48 M60.5 48V96 M180.5 48V96"
            stroke="#6b5532"
            strokeOpacity="0.28"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={tint} filter={`url(#stone-${id})`} />
      {courses && <rect width="100%" height="100%" fill={`url(#ashlar-${id})`} />}
    </svg>
  );
}
