"use client";

/**
 * RoastCurve — bean temperature over time for one roast profile.
 * Single series, so no legend: the title names it. Key events (turning
 * point, first crack, drop) carry ≥8px markers + direct labels; the
 * development window is a faint band. Hover/touch shows a crosshair with
 * the interpolated reading. A visually hidden table mirrors the key points.
 */
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useId, useMemo, useRef, useState } from "react";
import type { RoastProfile } from "@/content/beans";
import { ease } from "@/lib/motion";

const W = 560;
const H = 300;
const PAD = { l: 44, r: 18, t: 20, b: 34 };
const T_MAX = 12; // minutes
const TEMP_MIN = 80;
const TEMP_MAX = 230;

const sx = (t: number) => PAD.l + (t / T_MAX) * (W - PAD.l - PAD.r);
const sy = (temp: number) => PAD.t + (1 - (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * (H - PAD.t - PAD.b);

/**
 * Model the bean-probe curve: an eased dip from charge to the turning point,
 * then a concave rise f(u) = 1 − (1 − u)^k whose exponent k is solved so the
 * curve passes exactly through first crack on its way to the drop.
 */
export function tempAt(p: RoastProfile, t: number): number {
  const { turningPoint: tp, firstCrack: fc, drop } = p;
  if (t <= tp.t) {
    const u = t / tp.t;
    return p.charge - (p.charge - tp.temp) * (1 - (1 - u) ** 2);
  }
  const span = drop.t - tp.t;
  const uFc = (fc.t - tp.t) / span;
  const target = (fc.temp - tp.temp) / (drop.temp - tp.temp);
  const k = Math.log(1 - target) / Math.log(1 - uFc);
  const u = Math.min(1, (t - tp.t) / span);
  return tp.temp + (drop.temp - tp.temp) * (1 - (1 - u) ** k);
}

export function RoastCurve({ profile }: { profile: RoastProfile }) {
  const t = useTranslations("beans.labels");
  const clipId = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const path = useMemo(() => {
    const steps = 120;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const time = (i / steps) * profile.drop.t;
      pts.push(`${sx(time).toFixed(1)},${sy(tempAt(profile, time)).toFixed(1)}`);
    }
    return `M${pts.join("L")}`;
  }, [profile]);

  const events = [
    { key: "turningPoint", ...profile.turningPoint, dy: 18 },
    { key: "firstCrack", ...profile.firstCrack, dy: -14 },
    { key: "drop", ...profile.drop, dy: -14 },
  ] as const;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const time = ((x - PAD.l) / (W - PAD.l - PAD.r)) * T_MAX;
    setHover(time >= 0 && time <= profile.drop.t ? time : null);
  };

  const hoverTemp = hover !== null ? tempAt(profile, hover) : null;
  const fmtTime = (m: number) => {
    const s = Math.round(m * 60);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <figure>
      <figcaption className="mb-3 flex items-baseline justify-between gap-4">
        <span className="eyebrow">{t("roastCurve")}</span>
        <span className="text-xs text-ink-soft">{t("curveCaption")}</span>
      </figcaption>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label={`${t("roastCurve")}: ${events.map((e) => `${t(e.key)} ${fmtTime(e.t)} · ${e.temp} °C`).join("; ")}`}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <clipPath id={`plot-${clipId}`}>
            <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} />
          </clipPath>
        </defs>

        {/* Recessive grid */}
        {[100, 150, 200].map((temp) => (
          <g key={temp}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(temp)} y2={sy(temp)} stroke="currentColor" strokeOpacity={0.1} />
            <text x={PAD.l - 8} y={sy(temp) + 4} textAnchor="end" className="fill-ink-soft font-mono text-[10px]">
              {temp}°
            </text>
          </g>
        ))}
        {[0, 2, 4, 6, 8, 10, 12].map((m) => (
          <text key={m} x={sx(m)} y={H - PAD.b + 18} textAnchor="middle" className="fill-ink-soft font-mono text-[10px]">
            {m}
          </text>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.3} />

        {/* Development window: first crack → drop */}
        <rect
          x={sx(profile.firstCrack.t)}
          y={PAD.t}
          width={sx(profile.drop.t) - sx(profile.firstCrack.t)}
          height={H - PAD.t - PAD.b}
          className="fill-copper/10"
        />
        <text x={sx(profile.firstCrack.t) + 4} y={PAD.t + 12} className="fill-ink-soft font-mono text-[9px] uppercase tracking-wider">
          {t("development")}
        </text>

        <motion.path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          clipPath={`url(#plot-${clipId})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: ease.outQuint, delay: 0.2 }}
        />

        {events.map((e, i) => (
          <motion.g
            key={e.key}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: ease.outQuint, delay: 0.6 + i * 0.35 }}
            style={{ originX: `${sx(e.t)}px`, originY: `${sy(e.temp)}px` }}
          >
            <circle cx={sx(e.t)} cy={sy(e.temp)} r={4.5} className="fill-copper stroke-paper" strokeWidth={2} />
            <text
              x={sx(e.t)}
              y={sy(e.temp) + e.dy}
              textAnchor={e.key === "drop" ? "end" : "middle"}
              className="fill-ink font-mono text-[10px]"
            >
              {t(e.key)} · {e.temp}°
            </text>
          </motion.g>
        ))}

        {hover !== null && hoverTemp !== null && (
          <g pointerEvents="none">
            <line x1={sx(hover)} x2={sx(hover)} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" strokeOpacity={0.35} strokeDasharray="2 3" />
            <circle cx={sx(hover)} cy={sy(hoverTemp)} r={4} className="fill-ink stroke-paper" strokeWidth={2} />
            <g transform={`translate(${Math.min(sx(hover) + 10, W - PAD.r - 92)}, ${Math.max(sy(hoverTemp) - 36, PAD.t)})`}>
              <rect width={88} height={28} rx={3} className="fill-ink" />
              <text x={8} y={18} className="fill-paper font-mono text-[11px]">
                {fmtTime(hover)} · {Math.round(hoverTemp)}°C
              </text>
            </g>
          </g>
        )}

        {/* Generous invisible hit area for pointer tracking. */}
        <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} fill="transparent" />
      </svg>

      <table className="sr-only">
        <caption>{t("roastCurve")}</caption>
        <tbody>
          {events.map((e) => (
            <tr key={e.key}>
              <th scope="row">{t(e.key)}</th>
              <td>{fmtTime(e.t)}</td>
              <td>{e.temp} °C</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
