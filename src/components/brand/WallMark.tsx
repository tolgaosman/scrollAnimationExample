/**
 * WallMark — the brand glyph: Nicosia's Venetian walls (1567), a near-perfect
 * circle punctuated by eleven arrow-head bastions. Generated, not drawn, so
 * it stays geometrically honest at any size.
 */
import type { SVGProps } from "react";

const BASTIONS = 11;

/** Build the bastioned ring as an SVG path centred on (0,0). */
export function bastionPath(r = 40): string {
  const pts: string[] = [];
  const step = (Math.PI * 2) / BASTIONS;
  for (let i = 0; i < BASTIONS; i++) {
    const theta = i * step - Math.PI / 2;
    // curtain wall shoulder → bastion face → tip → face → shoulder
    const shape: Array<[number, number]> = [
      [r, theta - 0.17],
      [r * 1.12, theta - 0.13],
      [r * 1.27, theta],
      [r * 1.12, theta + 0.13],
      [r, theta + 0.17],
    ];
    for (const [rad, a] of shape) pts.push(`${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

const PATH = bastionPath(40);

export function WallMark({ strokeWidth = 1.4, ...props }: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg viewBox="-54 -54 108 108" fill="none" aria-hidden="true" {...props}>
      <path d={PATH} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <circle r="3" fill="currentColor" />
    </svg>
  );
}
