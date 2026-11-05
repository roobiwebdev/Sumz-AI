import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db, schema } from "@/db";
import { sendActionEmail } from "./email";
import { integrations, serverEnv } from "./env";

/**
 * SOURCE OF TRUTH KEYWORDS: auth, betterAuth, session, sign in, sign up, google oauth, email verification, password reset
 * WHAT:  The Better Auth server instance: email + password, Google, verification and reset emails.
 * WHY:   All authentication rules (providers, session length, rate limits, email flows) live here once.
 * WHERE: src/app/api/auth/[...all]/route.ts, src/server/session.ts.
 */
export const auth = betterAuth({
  appName: "Sumz AI",
  database: drizzleAdapter(db, { provider: "pg", schema, transaction: true }),
  user: {
    additionalFields: {
      plan: { type: "string", defaultValue: "free", input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 30,
    sendResetPassword: async ({ user, url }) => {
      await sendActionEmail({
        to: user.email,
        subject: "Reset your Sumz AI password",
        heading: "Reset your password",
        body: "Click the button below to choose a new password. The link expires in 30 minutes.",
        actionLabel: "Reset password",
        actionUrl: url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendActionEmail({
        to: user.email,
        subject: "Confirm your email for Sumz AI",
        heading: `Welcome, ${user.name}`,
        body: "Confirm your email address to start summarizing articles.",
        actionLabel: "Confirm email",
        actionUrl: url,
      });
    },
  },
  socialProviders:
    integrations.google && serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: serverEnv.GOOGLE_CLIENT_ID,
            clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
            prompt: "select_account",
          },
        }
      : {},
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
      "/send-verification-email": { window: 300, max: 3 },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];
