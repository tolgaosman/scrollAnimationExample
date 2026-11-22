"use client";

/**
 * TeamGrid — asymmetric editorial portrait wall.
 * Each portrait is a typographic duotone "plate" (monogram on limestone /
 * steel tones). On hover or keyboard focus the plate tilts toward the
 * pointer on a loose spring, and a panel rises with the person's favourite
 * brew method and philosophy.
 */
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { team, type TeamMember } from "@/content/team";
import { LimestoneTexture } from "@/components/ui/LimestoneTexture";
import { ease, spring } from "@/lib/motion";

// Column placement per portrait → deliberate asymmetry, not a uniform grid.
const PLACEMENT = [
  "md:col-span-5",
  "md:col-span-4 md:col-start-8 md:mt-40",
  "md:col-span-4 md:col-start-2 md:mt-20",
  "md:col-span-5 md:col-start-7 md:mt-48",
];

export function TeamGrid() {
  return (
    <section className="shell pb-28 md:pb-40">
      <ul className="grid-arch gap-y-16 md:gap-y-0">
        {team.map((member, i) => (
          <li key={member.id} className={`col-span-12 ${PLACEMENT[i]}`}>
            <Portrait member={member} index={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Portrait({ member, index }: { member: TeamMember; index: number }) {
  const t = useTranslations("team");
  const locale = useLocale() as "tr" | "en";
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Pointer position within the plate, −0.5…0.5, smoothed by a spring.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, spring.magnetic);
  const sy = useSpring(py, spring.magnetic);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-7, 7]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const glare = useTransform(
    sx,
    (x) => `radial-gradient(circle at ${Math.round((x + 0.5) * 80 + 10)}% 20%, rgb(255 255 255 / 0.55), transparent 55%)`,
  );
  const initialsX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const initialsY = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  // Tilt + hover reveal are mouse-only. On touch, a finger "leaves" the plate
  // the moment it lifts, which would snap the panel shut; instead a tap toggles.
  const isMouse = (e: React.PointerEvent) => e.pointerType === "mouse";
  const onMove = (e: React.PointerEvent) => {
    if (!isMouse(e)) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
    setActive(false);
  };
  // Snapshot before focus fires (focus would already set it to true).
  const wasActive = useRef(false);
  const lastPointer = useRef<string>("mouse");
  const onPointerDown = (e: React.PointerEvent) => {
    lastPointer.current = e.pointerType;
    wasActive.current = active;
  };
  const onTap = () => {
    if (lastPointer.current !== "mouse") setActive(!wasActive.current);
  };

  const [ground, ink] = member.plate;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, ease: ease.outQuint, delay: (index % 2) * 0.1 }}
      aria-labelledby={`member-${member.id}`}
    >
      <div style={{ perspective: 900 }}>
        <motion.div
          ref={ref}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerEnter={(e) => isMouse(e) && setActive(true)}
          onPointerLeave={(e) => isMouse(e) && reset()}
          onPointerDown={onPointerDown}
          onClick={onTap}
          onFocus={() => setActive(true)}
          onBlur={reset}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="@container relative aspect-[3/4] cursor-default overflow-hidden outline-offset-4"
          aria-describedby={`member-detail-${member.id}`}
        >
          <div className="absolute inset-0" style={{ backgroundColor: ground }}>
            <LimestoneTexture className="absolute inset-0 h-full w-full opacity-60 mix-blend-multiply" courses={false} tint={ground} />
          </div>

          <motion.span
            aria-hidden="true"
            style={{ x: initialsX, y: initialsY, color: ink }}
            // cqw = % of the plate's own width, so monograms always fit their plate.
            className="display absolute inset-0 grid place-items-center text-[46cqw] italic"
          >
            {member.initials}
          </motion.span>

          {/* moving glare */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{ opacity: active ? 0.45 : 0, background: glare }}
          />

          <p className="eyebrow absolute left-4 top-4" style={{ color: ink }}>
            {String(index + 1).padStart(2, "0")} · {t("since")} {member.since}
          </p>

          {/* reveal panel */}
          <motion.div
            id={`member-detail-${member.id}`}
            className="absolute inset-x-0 bottom-0 bg-ink/92 p-5 text-paper pointer-fine:backdrop-blur-sm md:p-6"
            initial={false}
            animate={{ y: active ? "0%" : "101%" }}
            transition={{ duration: 0.6, ease: ease.outQuint }}
          >
            <p className="eyebrow text-copper-light">{t("favorite")}</p>
            <p className="mt-1 font-mono text-sm">{member.favorite[locale]}</p>
            <p className="eyebrow mt-4 text-copper-light">{t("philosophy")}</p>
            <p className="mt-1 font-display text-lg italic leading-snug md:text-xl">“{member.philosophy[locale]}”</p>
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
        <h2 id={`member-${member.id}`} className="font-display text-2xl tracking-tight md:text-3xl">
          {member.name}
        </h2>
        <p className="eyebrow shrink-0 text-ink-soft">{member.role[locale]}</p>
      </div>
      <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ink-soft">{member.bio[locale]}</p>
    </motion.article>
  );
}
