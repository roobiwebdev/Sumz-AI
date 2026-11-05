import "server-only";
import { z } from "zod";

/**
 * SOURCE OF TRUTH KEYWORDS: env, serverEnv, environment variables, config, secrets, DATABASE_URL, RAPIDAPI_KEY
 * WHAT:  Parses and validates every server environment variable once.
 * WHY:   Env is read in exactly one place so a missing or malformed value fails loudly at startup,
 *        and optional integrations (Google, Resend, RapidAPI) can report themselves as unconfigured.
 * WHERE: src/server/*, src/db/index.ts. Never read process.env anywhere else (drizzle.config.ts excepted).
 */
const optional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const schema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: optional,
  GOOGLE_CLIENT_SECRET: optional,
  RESEND_API_KEY: optional,
  EMAIL_FROM: z.string().default("Sumz AI <onboarding@resend.dev>"),
  RAPIDAPI_KEY: optional,
  SUMMARY_DAILY_LIMIT: z.coerce.number().int().positive().default(25),
});

export const serverEnv = schema.parse(process.env);

export const integrations = {
  google: Boolean(serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET),
  email: Boolean(serverEnv.RESEND_API_KEY),
  summarizer: Boolean(serverEnv.RAPIDAPI_KEY),
} as const;
