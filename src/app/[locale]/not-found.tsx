import { getTranslations } from "next-intl/server";
import { WallMark } from "@/components/brand/WallMark";
import { ArrowLink } from "@/components/ui/ArrowLink";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <section className="shell flex min-h-[80svh] flex-col justify-center gap-8 pb-20 pt-36">
      <WallMark className="size-16 text-copper" />
      <p className="eyebrow">404</p>
      <h1 className="display text-display">{t("title")}</h1>
      <p className="max-w-[48ch] text-lg text-ink-soft">{t("body")}</p>
      <div>
        <ArrowLink href="/">{t("back")}</ArrowLink>
      </div>
    </section>
  );
}
