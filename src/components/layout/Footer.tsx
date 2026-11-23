import { getTranslations } from "next-intl/server";
import { WallMark } from "@/components/brand/WallMark";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "./nav-items";

export async function Footer() {
  const t = await getTranslations("footer");
  const tb = await getTranslations("brand");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("contact");
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="shell grid-arch gap-y-10 pb-8 pt-16 md:pt-22">
        <div className="col-span-12 md:col-span-4">
          <WallMark className="size-11 text-copper-light" />
          <p className="mt-5 max-w-[28ch] font-display text-xl font-light leading-snug md:text-2xl">
            {t("tagline")}
          </p>
        </div>

        <div className="col-span-6 md:col-span-2 md:col-start-6">
          <p className="eyebrow mb-3.5 text-paper/45">{t("explore")}</p>
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
          <p className="eyebrow mb-3.5 text-paper/45">{t("visit")}</p>
          <address className="space-y-1 text-sm not-italic text-paper/80">
            <p>{tc("address.line1")}</p>
            <p>{tc("address.line2")}</p>
            <p>{tc("address.line3")}</p>
            <p className="pt-2.5 num text-xs">{tc("hours.weekdaysTime")}</p>
            <p className="text-xs text-copper-light">{tc("hours.roastDay")}</p>
          </address>
        </div>

        <div className="col-span-12 md:col-span-3">
          <p className="eyebrow mb-3.5 text-paper/45">{t("follow")}</p>
          <SocialLinks tone="dark" className="mb-4" />
          <ul className="space-y-1.5 text-sm text-paper/75">
            <li>
              <a className="link-underline" href={`mailto:${tc("reach.email")}`}>
                {tc("reach.email")}
              </a>
            </li>
            <li className="whitespace-nowrap num text-xs">{tc("reach.phone")}</li>
          </ul>
        </div>
      </div>

      <div className="shell" aria-hidden="true">
        <div className="flex items-center justify-center pb-6 pt-2">
          <div className="h-px w-full bg-paper/15" />
          <span className="mx-4 block size-1.5 shrink-0 rotate-45 bg-copper-light" />
          <div className="h-px w-full bg-paper/15" />
        </div>
      </div>

      <div className="shell" aria-hidden="true">
        <p className="display select-none whitespace-nowrap pt-[2vw] text-[9vw] leading-[0.86] md:text-[10.4vw] text-paper/[0.06]">
          CYPRUS ROASTERS
        </p>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-paper/10 pb-24 pt-5 text-xs text-paper/45 md:flex-row md:justify-between md:pb-5">
        <p>
          © {year} Cyprus Roasters — {tb("footerSub")}. {t("rights")}
        </p>
        <p>{t("credits")}</p>
      </div>
    </footer>
  );
}
