/**
 * CafeStops — the café's essentials, scrolling past the machine as it comes apart.
 * ------------------------------------------------------------------
 * Ordinary flowing content: three paper cards (where / when / what) that
 * alternate sides on wide screens so the machine stays visible between them.
 * Deliberately no backdrop-blur: the canvas behind repaints on every scroll
 * tick and re-blurring it each frame is a known source of mobile jank.
 */
import { getTranslations } from "next-intl/server";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/ui/Reveal";

const BAR_ITEMS = ["espresso", "pourover", "coldbrew", "cezve"] as const;

function Stop({
  side,
  index,
  title,
  body,
  cta,
  href,
  children,
}: {
  side: "left" | "right";
  index: string;
  title: string;
  body: string;
  cta: string;
  href: "/iletisim" | "/cekirdekler" | "/menu";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`shell flex min-h-[62svh] items-center py-[5svh] md:min-h-[72svh] ${
        side === "right" ? "md:justify-end lg:pr-24" : "md:justify-start"
      }`}
    >
      <Reveal className="w-full border border-ink/15 bg-paper/95 p-5 shadow-[0_30px_60px_-34px_rgb(28_24_20/0.55)] md:w-[min(27rem,38vw)] md:p-7">
        <p className="eyebrow text-copper">{index}</p>
        <h2 className="mt-2 font-display text-[1.6rem] leading-[1.08] tracking-tight md:text-[1.95rem]">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>
        <div className="mt-4 border-t border-ink/15 pt-3">{children}</div>
        <ArrowLink href={href} className="mt-5">
          {cta}
        </ArrowLink>
      </Reveal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <dt className="eyebrow text-[0.62rem] text-ink-soft">{label}</dt>
      <dd className="font-mono text-xs tracking-wide md:text-[0.8rem]">{value}</dd>
    </div>
  );
}

export async function CafeStops() {
  const t = await getTranslations("home.stops");
  const tc = await getTranslations("contact");
  const tm = await getTranslations("home.manifesto");
  const tb = await getTranslations("home.brewbar.items");

  return (
    <div className="relative z-20 pb-[12svh]">
      <Stop side="left" index={t("location.index")} title={t("location.title")} body={t("location.body")} cta={t("location.cta")} href="/iletisim">
        <p className="mb-2 text-sm">
          {tc("address.line1")}
          <span className="text-ink-soft"> · {tc("address.line2")}</span>
        </p>
        <dl>
          <Row label={tc("hours.weekdays")} value={tc("hours.weekdaysTime")} />
          <Row label={tc("hours.saturday")} value={tc("hours.saturdayTime")} />
          <Row label={tc("hours.sunday")} value={tc("hours.sundayTime")} />
        </dl>
      </Stop>

      <Stop side="right" index={t("roast.index")} title={t("roast.title")} body={t("roast.body")} cta={t("roast.cta")} href="/cekirdekler">
        <dl>
          <Row label={tc("hours.roastDay")} value="07:30" />
          <Row label={tm("stat1Label")} value={tm("stat1")} />
          <Row label={tm("stat2Label")} value={tm("stat2")} />
        </dl>
      </Stop>

      <Stop side="left" index={t("bar.index")} title={t("bar.title")} body={t("bar.body")} cta={t("bar.cta")} href="/menu">
        <dl>
          {BAR_ITEMS.map((k) => (
            <Row key={k} label={tb(`${k}.name`)} value={tb(`${k}.tag`)} />
          ))}
        </dl>
      </Stop>
    </div>
  );
}
