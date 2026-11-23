"use client";

/**
 * BrewCalculator — pick a method, dial in the dose and strength; the
 * instrument panel springs to the new water weight, ratio, temperature and
 * time. Segmented controls share sliding `layoutId` pills.
 */
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { BrewIcons } from "@/components/home/BrewIcons";
import { ease, spring } from "@/lib/motion";
import { calculateBrew, METHODS, type Method, type Strength } from "./brew-math";

const METHOD_KEYS: Method[] = ["pourover", "espresso", "coldbrew"];
const STRENGTH_KEYS: Strength[] = ["light", "balanced", "strong"];

export function BrewCalculator() {
  const t = useTranslations("menu.calc");
  const sliderId = useId();
  const [method, setMethod] = useState<Method>("pourover");
  const [dose, setDose] = useState(METHODS.pourover.dose.default);
  const [strength, setStrength] = useState<Strength>("balanced");

  const spec = METHODS[method];
  const result = calculateBrew(method, dose, strength);

  const changeMethod = (m: Method) => {
    setMethod(m);
    setDose(METHODS[m].dose.default);
  };
  const nudge = (dir: 1 | -1) =>
    setDose((d) => Math.min(spec.dose.max, Math.max(spec.dose.min, +(d + dir * spec.dose.step).toFixed(1))));

  const fmtTime = (s: number) => {
    if (method === "coldbrew") return `${Math.round(s / 3600)}`;
    if (method === "espresso") return `${Math.round(s)}`;
    const r = Math.round(s);
    return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
  };
  const timeUnit = method === "coldbrew" ? t("hours") : method === "espresso" ? t("seconds") : t("minutes");
  const Icon = BrewIcons[method];
  const fill = ((dose - spec.dose.min) / (spec.dose.max - spec.dose.min)) * 100;

  return (
    <section id="calculator" className="bg-ink text-paper" aria-labelledby="calc-title">
      <div className="shell grid-arch gap-y-10 py-16 md:py-22">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow text-copper-light">{t("eyebrow")}</p>
          <h2 id="calc-title" className="display mt-4 text-headline">
            {t("title")}
          </h2>

          <LayoutGroup id="calc">
            <fieldset className="mt-12">
              <legend className="eyebrow mb-3 text-paper/55">{t("method")}</legend>
              <div className="grid grid-cols-3 rounded-full border border-paper/20 p-1">
                {METHOD_KEYS.map((m) => (
                  <Segment key={m} active={m === method} onClick={() => changeMethod(m)} pillId="calc-method">
                    {t(`methods.${m}`)}
                  </Segment>
                ))}
              </div>
            </fieldset>

            <div className="mt-10">
              <div className="mb-3 flex items-baseline justify-between">
                <label htmlFor={sliderId} className="eyebrow text-paper/55">
                  {t("coffee")}
                </label>
                <span className="font-mono text-sm tabular-nums">
                  {dose} g
                </span>
              </div>
              <div className="flex items-center gap-4">
                <StepButton label="−" onClick={() => nudge(-1)} />
                <input
                  id={sliderId}
                  type="range"
                  min={spec.dose.min}
                  max={spec.dose.max}
                  step={spec.dose.step}
                  value={dose}
                  onChange={(e) => setDose(Number(e.target.value))}
                  className="brew-range h-6 flex-1 cursor-pointer appearance-none bg-transparent"
                  style={{ ["--fill" as string]: `${fill}%` }}
                  aria-valuetext={`${dose} g`}
                />
                <StepButton label="+" onClick={() => nudge(1)} />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[0.65rem] text-paper/40">
                <span>{spec.dose.min} g</span>
                <span>{spec.dose.max} g</span>
              </div>
            </div>

            <fieldset className="mt-10">
              <legend className="eyebrow mb-3 text-paper/55">{t("strength")}</legend>
              <div className="grid grid-cols-3 rounded-full border border-paper/20 p-1">
                {STRENGTH_KEYS.map((s) => (
                  <Segment key={s} active={s === strength} onClick={() => setStrength(s)} pillId="calc-strength">
                    {t(`strengths.${s}`)}
                  </Segment>
                ))}
              </div>
            </fieldset>
          </LayoutGroup>
        </div>

        {/* Instrument panel */}
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <div className="brushed-steel relative p-6 text-ink md:p-10" aria-live="polite">
            <div className="flex items-start justify-between">
              <p className="eyebrow">{method === "espresso" ? t("yield") : t("water")}</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={method}
                  initial={{ opacity: 0, rotate: -12, scale: 0.85 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 12, scale: 0.85 }}
                  transition={{ duration: 0.4, ease: ease.outQuint }}
                >
                  <Icon className="size-14 md:size-16" />
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="display mt-2 text-[clamp(4.5rem,12vw,9.5rem)] leading-[0.85]">
              <AnimatedNumber value={result.water} decimals={method === "espresso" ? 1 : 0} />
              <span className="ml-2 font-sans text-2xl font-normal tracking-normal md:text-3xl">g</span>
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-px bg-ink/15 sm:grid-cols-4">
              <Readout label={t("ratio")}>
                1:<AnimatedNumber value={result.ratio} decimals={method === "espresso" ? 1 : 0} />
              </Readout>
              <Readout label={t("temperature")}>
                {result.temperature === null ? (
                  <span className="text-base">{t("cold")}</span>
                ) : (
                  <>
                    <AnimatedNumber value={result.temperature} /> °C
                  </>
                )}
              </Readout>
              <Readout label={t("time")}>
                <AnimatedNumber value={result.seconds} format={fmtTime} /> {timeUnit}
              </Readout>
              <Readout label={method === "espresso" ? t("coffee") : t("yield")}>
                <AnimatedNumber value={method === "espresso" ? dose : result.yield} decimals={method === "espresso" ? 1 : 0} /> g
              </Readout>
            </dl>

            <div className="mt-8 grid gap-6 border-t border-ink/20 pt-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow text-ink/60">{t("grind")}</p>
                <p className="mt-1 text-sm">{t(`grinds.${method}`)}</p>
              </div>
              <div>
                <p className="eyebrow text-ink/60">{t("tip")}</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={method}
                    className="mt-1 text-sm leading-relaxed"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    {t(`tips.${method}`)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Segment({
  active,
  onClick,
  pillId,
  children,
}: {
  active: boolean;
  onClick: () => void;
  pillId: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`relative z-0 h-10 whitespace-nowrap rounded-full px-2 text-[clamp(0.7rem,2.6vw,0.85rem)] transition-colors duration-300 md:text-sm ${
        active ? "text-ink" : "text-paper/70 hover:text-paper"
      }`}
    >
      {active && (
        <motion.span layoutId={pillId} className="absolute inset-0 -z-10 rounded-full bg-paper" transition={spring.pill} />
      )}
      {children}
    </button>
  );
}

function StepButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label === "+" ? "+1" : "−1"}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-paper/25 font-mono text-lg transition-[background-color,color,transform] duration-200 hover:bg-paper hover:text-ink active:scale-90"
    >
      {label}
    </button>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-steel-light/80 px-3.5 py-3.5 sm:px-4 sm:py-4">
      <dt className="eyebrow text-ink/60">{label}</dt>
      <dd className="mt-2 whitespace-nowrap font-mono text-base tabular-nums sm:text-lg md:text-xl">{children}</dd>
    </div>
  );
}
