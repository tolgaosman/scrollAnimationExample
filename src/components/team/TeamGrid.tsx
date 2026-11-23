"use client";

/**
 * TeamGrid — compact 4-column architectural portrait wall.
 * All four team members read cleanly together on desktop with tactile
 * tilt, craft emblems, and a slide-up hover/tap philosophy panel.
 */
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { team, type TeamMember } from "@/content/team";
import { LimestoneTexture } from "@/components/ui/LimestoneTexture";
import { ease, spring } from "@/lib/motion";

export function TeamGrid() {
  return (
    <section className="shell pb-18 md:pb-24">
      <ul className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {team.map((member, i) => (
          <li key={member.id} className={i % 2 === 1 ? "lg:mt-6" : ""}>
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

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, spring.magnetic);
  const sy = useSpring(py, spring.magnetic);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-6, 6]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const glare = useTransform(
    sx,
    (x) => `radial-gradient(circle at ${Math.round((x + 0.5) * 80 + 10)}% 20%, rgb(255 255 255 / 0.5), transparent 55%)`,
  );
  const initialsX = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const initialsY = useTransform(sy, [-0.5, 0.5], [-8, 8]);

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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.85, ease: ease.outQuint, delay: index * 0.06 }}
      aria-labelledby={`member-${member.id}`}
      className="flex flex-col"
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
          className="@container relative aspect-[4/4.4] cursor-default overflow-hidden border border-ink/15 outline-offset-4"
          aria-describedby={`member-detail-${member.id}`}
        >
          <div className="absolute inset-0" style={{ backgroundColor: ground }}>
            <LimestoneTexture className="absolute inset-0 h-full w-full opacity-55 mix-blend-multiply" courses={false} tint={ground} />
          </div>

          {/* Architectural inner hairline frame */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 border"
            style={{ borderColor: ink, opacity: 0.18 }}
          />

          <motion.span
            aria-hidden="true"
            style={{ x: initialsX, y: initialsY, color: ink }}
            className="display absolute inset-0 grid place-items-center text-[32cqw] italic"
          >
            {member.initials}
          </motion.span>

          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{ opacity: active ? 0.45 : 0, background: glare }}
          />

          <div className="absolute inset-x-4 top-4 flex items-center justify-between" style={{ color: ink }}>
            <p className="eyebrow text-[0.6rem]">
              {String(index + 1).padStart(2, "0")} · {member.since}
            </p>
            <span className="size-1.5 rounded-full bg-current opacity-60" aria-hidden="true" />
          </div>

          <p
            className="eyebrow absolute bottom-4 left-4 right-4 truncate text-[0.58rem] opacity-75"
            style={{ color: ink }}
          >
            {member.favorite[locale]}
          </p>

          {/* Hover / tap reveal panel */}
          <motion.div
            id={`member-detail-${member.id}`}
            className="absolute inset-x-0 bottom-0 bg-ink/94 p-4 text-paper pointer-fine:backdrop-blur-sm"
            initial={false}
            animate={{ y: active ? "0%" : "101%" }}
            transition={{ duration: 0.55, ease: ease.outQuint }}
          >
            <p className="eyebrow text-[0.58rem] text-copper-light">{t("favorite")}</p>
            <p className="mt-0.5 font-mono text-xs">{member.favorite[locale]}</p>
            <p className="eyebrow mt-3 text-[0.58rem] text-copper-light">{t("philosophy")}</p>
            <p className="mt-1 font-display text-sm italic leading-snug">“{member.philosophy[locale]}”</p>
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-3.5 border-b border-ink/15 pb-2.5">
        <h2 id={`member-${member.id}`} className="font-display text-xl tracking-tight md:text-2xl">
          {member.name}
        </h2>
        <p className="eyebrow mt-1 text-[0.6rem] text-copper">{member.role[locale]}</p>
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-ink-soft md:text-[0.82rem]">{member.bio[locale]}</p>
    </motion.article>
  );
}
