import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

/**
 * SOURCE OF TRUTH KEYWORDS: getSession, requireUser, session check, signed in, protected page, current user
 * WHAT:  Reads the current session on the server; requireUser() redirects to sign-in when there is none.
 * WHY:   The one security checkpoint for pages and server actions. proxy.ts only does a fast cookie
 *        check for redirects; this function is what actually verifies the session.
 * WHERE: src/app/app/*, src/app/(auth)/*, src/server/summaries.ts callers.
 */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session.user;
}
