import { getTranslations } from "next-intl/server";
import { WallMark } from "@/components/brand/WallMark";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { LimestoneTexture } from "@/components/ui/LimestoneTexture";
import { MaskedLines, Reveal } from "@/components/ui/Reveal";

export async function ClosingCta() {
  const t = await getTranslations("home.cta");
  const tc = await getTranslations("contact");
  return (
    <section className="relative isolate overflow-hidden border-t border-ink/15">
      <LimestoneTexture className="absolute inset-0 -z-10 h-full w-full" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-paper/35 via-paper/15 to-stone-deep/35" />
      <div className="shell py-16 md:py-24">
        <div className="grid-arch items-end gap-y-8 border border-ink/18 bg-paper/72 p-6 backdrop-blur-[2px] md:p-10">
          <div className="col-span-12 flex items-center justify-between border-b border-ink/12 pb-4">
            <div className="flex items-center gap-3">
              <WallMark className="size-9 text-copper" />
              <span className="eyebrow text-ink-soft">{tc("hours.roastDay")}</span>
            </div>
            <span className="eyebrow hidden text-ink-soft sm:inline">{tc("address.line2")}</span>
          </div>
          <MaskedLines
            lines={[t("title")]}
            className="display col-span-12 text-[clamp(2rem,4.2vw,3.9rem)] md:col-span-8"
          />
          <Reveal className="col-span-12 flex flex-wrap gap-3 md:col-span-4 md:justify-end">
            <ArrowLink href="/iletisim">{t("button")}</ArrowLink>
            <ArrowLink href="/menu" variant="ghost">
              {t("secondary")}
            </ArrowLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
