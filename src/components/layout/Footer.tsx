import { getTranslations } from "next-intl/server";
import { WallMark } from "@/components/brand/WallMark";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "./nav-items";

export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("contact");
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="shell grid-arch gap-y-12 pb-10 pt-20 md:pt-28">
        <div className="col-span-12 md:col-span-5">
          <WallMark className="size-12 text-copper-light" />
          <p className="mt-6 max-w-[28ch] font-display text-2xl font-light leading-snug md:text-3xl">
            {t("tagline")}
          </p>
          <p className="eyebrow mt-6 text-paper/50">{t("coords")}</p>
        </div>

        <div className="col-span-6 md:col-span-2 md:col-start-7">
          <p className="eyebrow mb-4 text-paper/45">{t("explore")}</p>
          <ul className="space-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline text-paper/80 hover:text-paper">
                  {tn(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-6 md:col-span-2">
          <p className="eyebrow mb-4 text-paper/45">{t("visit")}</p>
          <address className="space-y-1 text-sm not-italic text-paper/80">
            <p>{tc("address.line1")}</p>
            <p>{tc("address.line2")}</p>
            <p>{tc("address.line3")}</p>
            <p className="pt-3">{tc("hours.weekdaysTime")}</p>
            <p className="text-copper-light">{tc("hours.roastDay")}</p>
          </address>
        </div>

        <div className="col-span-12 md:col-span-2">
          <p className="eyebrow mb-4 text-paper/45">{t("follow")}</p>
          <ul className="space-y-2 text-sm text-paper/80">
            <li>Instagram · @surlarici</li>
            <li>
              <a className="link-underline" href={`mailto:${tc("reach.email")}`}>
                {tc("reach.email")}
              </a>
            </li>
            <li>{tc("reach.phone")}</li>
          </ul>
        </div>
      </div>

      <div className="shell" aria-hidden="true">
        <p className="display select-none whitespace-nowrap text-[18.5vw] leading-[0.78] text-paper/[0.07]">
          SURLARİÇİ
        </p>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-paper/10 py-6 text-xs text-paper/45 md:flex-row md:justify-between">
        <p>
          © {year} SURLARİÇİ // Lefkon Roasters & Atelier. {t("rights")}
        </p>
        <p>{t("credits")}</p>
      </div>
    </footer>
  );
}
