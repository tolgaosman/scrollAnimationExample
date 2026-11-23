"use client";

/**
 * ContactForm — reservation / general / wholesale enquiries.
 * Validates on blur and on submit with the shared zod schema, then calls
 * the Server Action (which re-validates; the client check is only UX).
 * States: idle → submitting → success | error | rate-limited, each with
 * its own motion.
 */
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState, type ReactNode } from "react";
import { submitContact } from "@/app/[locale]/iletisim/actions";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  contactSchema,
  emptyContact,
  toFieldErrors,
  type ContactField,
  type ContactInput,
  type FieldErrors,
} from "@/lib/contact-schema";
import { ease, spring } from "@/lib/motion";

type Status = "idle" | "submitting" | "success" | "error" | "rate";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [values, setValues] = useState<ContactInput>(emptyContact);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [honeypot, setHoneypot] = useState("");
  const wholesale = values.intent === "wholesale";

  const validate = (next: ContactInput) => {
    const res = contactSchema.safeParse(next);
    return res.success ? {} : toFieldErrors(res.error);
  };

  const update = (field: ContactField, value: string) => {
    const next = { ...values, [field]: value } as ContactInput;
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  };

  const blur = (field: ContactField) => {
    setTouched((s) => ({ ...s, [field]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const all = validate(values);
    setErrors(all);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (Object.keys(all).length > 0) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const res = await submitContact({ ...values, website: honeypot });
      if (res.ok) setStatus("success");
      else if (res.reason === "rate") setStatus("rate");
      else {
        setErrors(res.fieldErrors);
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setValues(emptyContact);
    setErrors({});
    setTouched({});
    setStatus("idle");
  };

  const err = (f: ContactField) => (touched[f] && errors[f] ? t(`errors.${errors[f]!}`) : undefined);
  const guestOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: t("guestCount", { count: i + 1 }),
        meta: String(i + 1).padStart(2, "0"),
      })),
    [t],
  );

  return (
    <div className="relative border border-ink/15 bg-paper-deep/35 p-6 md:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            role="status"
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: ease.outQuint }}
            className="flex min-h-[32rem] flex-col justify-center border border-ink/15 p-8 md:p-12"
          >
            <svg viewBox="0 0 52 52" className="size-14 text-copper" aria-hidden="true">
              <motion.circle
                cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="1.2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: ease.outQuint }}
              />
              <motion.path
                d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="1.6"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.55, ease: ease.outQuint }}
              />
            </svg>
            <h3 className="display mt-8 text-4xl md:text-5xl">{t("successTitle")}</h3>
            <p className="mt-4 max-w-[44ch] leading-relaxed text-ink-soft">{t("successBody")}</p>
            <button type="button" onClick={reset} className="link-underline eyebrow mt-10 self-start">
              {t("again")}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.3 } }}
            className="space-y-8"
            aria-describedby="form-privacy"
          >
            <h3 className="eyebrow">{t("title")}</h3>

            {/* Intent */}
            <LayoutGroup id="intent">
              <fieldset disabled={wholesale} className={wholesale ? "opacity-40" : ""}>
                <legend className="eyebrow mb-3 text-ink-soft">{t("intent")}</legend>
                <div className="inline-grid grid-cols-2 rounded-full border border-ink/20 p-1">
                  {(["reservation", "general"] as const).map((intent) => {
                    const active = values.intent === intent;
                    return (
                      <button
                        key={intent}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update("intent", intent)}
                        className={`relative z-0 h-9 rounded-full px-5 text-sm transition-colors ${active ? "text-paper" : "text-ink/70 hover:text-ink"}`}
                      >
                        {active && (
                          <motion.span layoutId="intent-pill" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={spring.pill} />
                        )}
                        {t(`intents.${intent}`)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </LayoutGroup>

            {/* Wholesale toggle */}
            <div className="flex items-start gap-4 border-y border-ink/12 py-5">
              <button
                type="button"
                role="switch"
                aria-checked={wholesale}
                aria-labelledby="wholesale-label"
                onClick={() => update("intent", wholesale ? "general" : "wholesale")}
                className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${wholesale ? "bg-copper" : "bg-ink/15"}`}
              >
                <motion.span
                  className="absolute top-1 block size-5 rounded-full bg-paper shadow"
                  animate={{ left: wholesale ? 24 : 4 }}
                  transition={spring.pill}
                />
              </button>
              <div>
                <p id="wholesale-label" className="text-sm font-medium">{t("wholesaleToggle")}</p>
                <p className="mt-1 text-xs text-ink-soft">{t("wholesaleHint")}</p>
              </div>
            </div>

            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
              <Field label={t("name")} error={err("name")}>
                {(id, describedBy) => (
                  <input id={id} aria-describedby={describedBy} aria-invalid={!!err("name")} autoComplete="name" maxLength={80}
                    value={values.name} onChange={(e) => update("name", e.target.value)} onBlur={() => blur("name")} className={inputCls} />
                )}
              </Field>
              <Field label={t("email")} error={err("email")}>
                {(id, describedBy) => (
                  <input id={id} type="email" inputMode="email" aria-describedby={describedBy} aria-invalid={!!err("email")} autoComplete="email" maxLength={254}
                    value={values.email} onChange={(e) => update("email", e.target.value)} onBlur={() => blur("email")} className={inputCls} />
                )}
              </Field>
              <Field label={t("phone")} error={err("phone")}>
                {(id, describedBy) => (
                  <input id={id} type="tel" inputMode="tel" aria-describedby={describedBy} aria-invalid={!!err("phone")} autoComplete="tel" maxLength={24}
                    value={values.phone} onChange={(e) => update("phone", e.target.value)} onBlur={() => blur("phone")} className={inputCls} />
                )}
              </Field>

              <AnimatePresence mode="popLayout" initial={false}>
                {values.intent === "reservation" && (
                  <Reveal key="reservation">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Field label={t("date")} error={err("date")}>
                        {(id, describedBy) => (
                          <CustomDatePicker
                            id={id}
                            value={values.date}
                            onChange={(v) => update("date", v)}
                            onBlur={() => blur("date")}
                            describedBy={describedBy}
                            invalid={!!err("date")}
                          />
                        )}
                      </Field>
                      <Field label={t("guests")} error={err("guests")}>
                        {(id, describedBy) => (
                          <CustomSelect
                            id={id}
                            value={values.guests}
                            options={guestOptions}
                            onChange={(v) => update("guests", v)}
                            onBlur={() => blur("guests")}
                            describedBy={describedBy}
                            invalid={!!err("guests")}
                          />
                        )}
                      </Field>
                    </div>
                  </Reveal>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {wholesale && (
                <Reveal key="wholesale">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label={t("business")} error={err("business")}>
                      {(id, describedBy) => (
                        <input id={id} aria-describedby={describedBy} aria-invalid={!!err("business")} autoComplete="organization" maxLength={120}
                          value={values.business} onChange={(e) => update("business", e.target.value)} onBlur={() => blur("business")} className={inputCls} />
                      )}
                    </Field>
                    <Field label={t("volume")} error={err("volume")}>
                      {(id, describedBy) => (
                        <input id={id} type="number" inputMode="numeric" min={1} max={2000} aria-describedby={describedBy} aria-invalid={!!err("volume")}
                          value={values.volume} onChange={(e) => update("volume", e.target.value)} onBlur={() => blur("volume")} className={inputCls} />
                      )}
                    </Field>
                  </div>
                </Reveal>
              )}
            </AnimatePresence>

            <Field label={t("message")} error={err("message")} counter={`${values.message.length}/2000`}>
              {(id, describedBy) => (
                <textarea id={id} rows={5} aria-describedby={describedBy} aria-invalid={!!err("message")} maxLength={2000}
                  value={values.message} onChange={(e) => update("message", e.target.value)} onBlur={() => blur("message")}
                  className={`${inputCls} resize-y`} />
              )}
            </Field>

            {/* Honeypot — hidden from humans and assistive tech. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />
              </label>
            </div>

            <AnimatePresence>
              {(status === "error" || status === "rate") && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="border-l-2 border-copper bg-copper/8 px-4 py-3 text-sm"
                >
                  {status === "rate" ? (
                    t("rateLimited")
                  ) : (
                    <>
                      <strong className="font-medium">{t("errorTitle")}</strong> {t("errorBody")}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-6">
              <p id="form-privacy" className="max-w-[40ch] text-xs text-ink-soft">{t("privacy")}</p>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full bg-ink px-7 text-sm text-paper transition-[background-color,transform] duration-300 hover:bg-copper active:scale-[0.98] disabled:cursor-wait"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={status === "submitting" ? "sending" : "send"}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-3"
                  >
                    {status === "submitting" && (
                      <motion.span
                        className="block size-3.5 rounded-full border border-paper/40 border-t-paper"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        aria-hidden="true"
                      />
                    )}
                    {status === "submitting" ? t("submitting") : t("submit")}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  "peer w-full border-0 border-b border-ink/25 bg-transparent px-0 py-2.5 text-base outline-none transition-colors placeholder:text-ink/30 focus:border-ink aria-[invalid=true]:border-copper";

function Field({
  label,
  error,
  counter,
  children,
}: {
  label: string;
  error?: string;
  counter?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}) {
  const id = useId();
  const errId = `${id}-error`;
  return (
    <div className="relative">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="eyebrow text-ink-soft">
          {label}
        </label>
        {counter && <span className="num text-[0.65rem] text-ink/40">{counter}</span>}
      </div>
      {children(id, error ? errId : undefined)}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-1.5 text-xs text-copper"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="sm:col-span-2"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: ease.outQuint }}
    >
      <div className="pt-1">{children}</div>
    </motion.div>
  );
}
