import { z } from "zod";

/**
 * Contact / reservation / wholesale form schema.
 * Shared by the client (instant inline feedback) and the server action
 * (the only validation that actually matters — never trust the client).
 *
 * Error messages are translation keys under `contact.form.errors.*`,
 * so the same schema serves both locales.
 */
export const INTENTS = ["reservation", "general", "wholesale"] as const;
export type Intent = (typeof INTENTS)[number];

export const errorKeys = [
  "nameShort",
  "nameLong",
  "email",
  "phone",
  "messageShort",
  "messageLong",
  "business",
  "volume",
  "guests",
  "date",
] as const;
export type ContactErrorKey = (typeof errorKeys)[number];

const str = (max: number) => z.string().trim().max(max);

export const contactSchema = z
  .object({
    intent: z.enum(INTENTS),
    name: z.string().trim().min(2, { error: "nameShort" }).max(80, { error: "nameLong" }),
    email: z.string().trim().max(254, { error: "email" }).pipe(z.email({ error: "email" })),
    phone: str(24).refine((v) => v === "" || /^\+?[\d\s()-]{7,22}$/.test(v), { error: "phone" }),
    message: z
      .string()
      .trim()
      .min(10, { error: "messageShort" })
      .max(2000, { error: "messageLong" }),
    business: str(120),
    volume: str(6),
    date: str(10),
    guests: str(2),
  })
  .superRefine((data, ctx) => {
    if (data.intent === "wholesale") {
      if (data.business.length < 2) ctx.addIssue({ code: "custom", path: ["business"], message: "business" });
      const kg = Number(data.volume);
      if (!Number.isFinite(kg) || kg < 1 || kg > 2000)
        ctx.addIssue({ code: "custom", path: ["volume"], message: "volume" });
    }
    if (data.intent === "reservation") {
      const guests = Number(data.guests);
      if (!Number.isInteger(guests) || guests < 1 || guests > 12)
        ctx.addIssue({ code: "custom", path: ["guests"], message: "guests" });
      if (!isValidFutureDate(data.date))
        ctx.addIssue({ code: "custom", path: ["date"], message: "date" });
    }
  });

export type ContactInput = z.input<typeof contactSchema>;
export type ContactField = keyof ContactInput;
export type FieldErrors = Partial<Record<ContactField, ContactErrorKey>>;

/** YYYY-MM-DD, today or later, at most a year ahead. */
function isValidFutureDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setUTCFullYear(max.getUTCFullYear() + 1);
  return d >= today && d <= max;
}

/** Flatten zod issues into one translated-key error per field. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as ContactField | undefined;
    const key = issue.message as ContactErrorKey;
    if (field && !out[field] && (errorKeys as readonly string[]).includes(key)) out[field] = key;
  }
  return out;
}

export const emptyContact: ContactInput = {
  intent: "reservation",
  name: "",
  email: "",
  phone: "",
  message: "",
  business: "",
  volume: "",
  date: "",
  guests: "2",
};
