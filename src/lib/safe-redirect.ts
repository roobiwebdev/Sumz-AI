/**
 * SOURCE OF TRUTH KEYWORDS: safeRedirect, next param, callbackURL, open redirect
 * WHAT:  Returns a same-site path from an untrusted ?next= value, or the fallback.
 * WHY:   Prevents open redirects (e.g. ?next=//evil.com) after sign-in.
 * WHERE: src/app/(auth)/sign-in, src/components/auth/*.
 */
export function safeRedirect(value: string | null | undefined, fallback = "/app"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
