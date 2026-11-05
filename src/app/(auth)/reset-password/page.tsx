import type { Metadata } from "next";
import { AuthCard, FormAlert } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { token, error } = await searchParams;
  if (!token || error) {
    return (
      <AuthCard title="Link expired">
        <FormAlert>This reset link is invalid or has expired.</FormAlert>
        <ButtonLink href="/forgot-password" size="lg" className="mt-5 w-full">
          Request a new link
        </ButtonLink>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Choose a new password" description="You'll be signed out of other devices.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
