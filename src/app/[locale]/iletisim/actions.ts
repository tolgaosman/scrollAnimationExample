"use server";

/**
 * Contact form Server Action.
 * ------------------------------------------------------------------
 * Security posture (this endpoint is publicly reachable by POST):
 *  - Input is typed `unknown` and validated with the same zod schema the
 *    client uses; unknown keys are stripped, every string is length-capped.
 *  - A honeypot field silently swallows naive bots (they get a fake success).
 *  - A small in-memory sliding-window rate limit per client IP. It is
 *    per-instance only — on a multi-instance deployment, swap in a shared
 *    store (Redis/Upstash) at the marked spot.
 *  - Nothing user-supplied is ever rendered as HTML or echoed back.
 *  - No PII is logged.
 *
 * Delivery: this demo has no mail/CRM backend, so a valid submission is
 * acknowledged without being sent anywhere. Integrate delivery at the
 * marked spot below.
 */
import { headers } from "next/headers";
import { contactSchema, toFieldErrors, type FieldErrors } from "@/lib/contact-schema";

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; fieldErrors: FieldErrors }
  | { ok: false; reason: "rate" };

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_TRACKED_CLIENTS = 5_000;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  // Bound memory: drop the oldest clients if the map grows too large.
  if (!hits.has(key) && hits.size >= MAX_TRACKED_CLIENTS) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
  hits.set(key, recent);
  return false;
}

export async function submitContact(input: unknown): Promise<ContactResult> {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;

  // Honeypot: real users never see or fill this field.
  if (typeof record.website === "string" && record.website.length > 0) {
    return { ok: true };
  }

  // NOTE: x-forwarded-for is only trustworthy behind a proxy that sets it.
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "anonymous").trim().slice(0, 64);
  if (rateLimited(ip)) return { ok: false, reason: "rate" }; // ← swap for a shared store in production

  const parsed = contactSchema.safeParse(record);
  if (!parsed.success) {
    return { ok: false, reason: "invalid", fieldErrors: toFieldErrors(parsed.error) };
  }

  // ← Deliver parsed.data here (transactional email, CRM, queue…).
  return { ok: true };
}
