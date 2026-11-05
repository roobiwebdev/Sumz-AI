import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard, FormAlert } from "@/components/auth/auth-card";
import { SignInFooter, SignInForm } from "@/components/auth/sign-in-form";
import { safeRedirect } from "@/lib/safe-redirect";
import { integrations } from "@/server/env";
import { getSession } from "@/server/session";

export const metadata: Metadata = { title: "Sign in" };

const errorMessages: Record<string, string> = {
  account_not_linked: "That Google account uses an email already registered with a password. Sign in with your password.",
  access_denied: "Google sign-in was cancelled.",
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const next = safeRedirect(params.next);
  if (await getSession()) redirect(next as "/app");
  const error = params.error ? (errorMessages[params.error] ?? "Sign-in failed. Try again.") : undefined;

  return (
    <AuthCard title="Welcome back" description="Sign in to see your summaries." footer={<SignInFooter />}>
      {params.reset ? (
        <div className="mb-4">
          <FormAlert tone="success">Your password was changed. Sign in with the new one.</FormAlert>
        </div>
      ) : null}
      <SignInForm googleEnabled={integrations.google} next={next} initialError={error} />
    </AuthCard>
  );
}
