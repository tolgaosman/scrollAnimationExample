import { getTranslations } from "next-intl/server";

/**
 * AtelierStrip — crisp architectural specification band separating the
 * scroll-scrubbed espresso machine hero from the Manifesto section.
 */
export async function AtelierStrip() {
  const t = await getTranslations("home.strip");
  const items = [
    [t("locLabel"), t("locValue")],
    [t("batchLabel"), t("batchValue")],
    [t("roastLabel"), t("roastValue")],
    [t("waterLabel"), t("waterValue")],
  ] as const;

  return (
    <div className="border-y border-ink/15 bg-ink text-paper">
      <div className="shell grid grid-cols-2 divide-y divide-paper/10 md:grid-cols-4 md:divide-x md:divide-y-0">
        {items.map(([label, value], i) => (
          <div key={label} className={`flex flex-col gap-0.5 py-3.5 md:py-4 ${i > 0 ? "md:pl-6" : ""} ${i % 2 === 1 ? "pl-4 md:pl-6" : ""}`}>
            <span className="eyebrow text-xs text-copper-light">{label}</span>
            <span className="num text-xs tracking-wide text-paper/90 md:text-[0.8rem]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

