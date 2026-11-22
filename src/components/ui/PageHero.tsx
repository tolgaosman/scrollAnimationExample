import type { ReactNode } from "react";
import { MaskedLines, Reveal } from "./Reveal";

/** Shared opening spread for inner pages: index number, eyebrow, display title, lede. */
export function PageHero({
  index,
  eyebrow,
  title,
  lede,
  aside,
}: {
  index: string;
  eyebrow: string;
  title: string;
  lede: string;
  aside?: ReactNode;
}) {
  return (
    <header className="shell grid-arch gap-y-10 pb-16 pt-32 md:pb-24 md:pt-44">
      <div className="col-span-12 flex items-baseline justify-between border-b border-ink/15 pb-4">
        <Reveal y={10}>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <Reveal y={10} delay={0.1}>
          <p className="eyebrow text-ink-soft">{index}</p>
        </Reveal>
      </div>
      <MaskedLines
        as="h1"
        lines={[title]}
        className="display col-span-12 text-display lg:col-span-9"
      />
      <div className="col-span-12 md:col-span-6 md:col-start-7 lg:col-span-4 lg:col-start-9">
        <Reveal delay={0.25}>
          <p className="text-base leading-relaxed text-ink-soft md:text-lg">{lede}</p>
        </Reveal>
        {aside}
      </div>
    </header>
  );
}
