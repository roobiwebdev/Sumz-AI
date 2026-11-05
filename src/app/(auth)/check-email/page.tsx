import { MailCheck } from "lucide-react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Check your email" };

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { email } = await searchParams;
  return (
    <AuthCard title="Check your email">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brand/15">
          <MailCheck className="size-7 text-brand" />
        </span>
        <p className="mt-5 text-muted">
          We sent a confirmation link to {email ? <span className="font-medium text-foreground">{email}</span> : "your inbox"}. Click it to
          activate your account. It may take a minute to arrive.
        </p>
        <ButtonLink href="/sign-in" variant="outline" size="lg" className="mt-7 w-full">
          Back to sign in
        </ButtonLink>
      </div>
    </AuthCard>
  );
}
