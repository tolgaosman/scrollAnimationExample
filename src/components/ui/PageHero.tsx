import type { ReactNode } from "react";
import { MaskedLines, Reveal } from "./Reveal";

/** Shared compact architectural opening spread for inner pages. */
export function PageHero({
  eyebrow,
  title,
  lede,
  aside,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  aside?: ReactNode;
}) {
  return (
    <header className="shell grid-arch gap-y-5 pb-10 pt-24 md:pb-8 md:pt-26">
      <div className="col-span-12 flex items-baseline border-b border-ink/15 pb-3.5">
        <Reveal y={8}>
          <p className="eyebrow flex items-center gap-2.5">
            <span className="block size-1.5 rounded-full bg-copper" aria-hidden="true" />
            {eyebrow}
          </p>
        </Reveal>
      </div>
      <MaskedLines
        as="h1"
        lines={[title]}
        className="display col-span-12 text-display lg:col-span-8"
      />
      <div className="col-span-12 flex flex-col justify-end md:col-span-7 lg:col-span-4 lg:col-start-9">
        <Reveal delay={0.18}>
          <p className="text-sm leading-relaxed text-ink-soft md:text-base">{lede}</p>
        </Reveal>
        {aside}
      </div>
    </header>
  );
}
