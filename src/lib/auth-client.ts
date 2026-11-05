import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/server/auth";

/**
 * SOURCE OF TRUTH KEYWORDS: authClient, signIn, signUp, signOut, useSession, requestPasswordReset, resetPassword
 * WHAT:  The browser-side Better Auth client.
 * WHY:   One client so every form calls auth the same way and gets typed results.
 * WHERE: src/components/auth/*, src/components/app/*.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
