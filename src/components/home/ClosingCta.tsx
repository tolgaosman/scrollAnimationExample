import { getTranslations } from "next-intl/server";
import { WallMark } from "@/components/brand/WallMark";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { LimestoneTexture } from "@/components/ui/LimestoneTexture";
import { MaskedLines, Reveal } from "@/components/ui/Reveal";

export async function ClosingCta() {
  const t = await getTranslations("home.cta");
  return (
    <section className="relative isolate overflow-hidden">
      <LimestoneTexture className="absolute inset-0 -z-10 h-full w-full" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-paper/30 to-stone-deep/30" />
      <div className="shell grid-arch items-end gap-y-10 py-28 md:py-40">
        <WallMark className="col-span-12 size-14 text-ink/80 md:col-span-1" />
        <MaskedLines
          lines={[t("title")]}
          className="display col-span-12 text-[clamp(2.4rem,5.6vw,5.4rem)] md:col-span-9"
        />
        <Reveal className="col-span-12 flex flex-wrap gap-3 md:col-span-9 md:col-start-2">
          <ArrowLink href="/iletisim">{t("button")}</ArrowLink>
          <ArrowLink href="/menu" variant="ghost">
            {t("secondary")}
          </ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
