"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { FormAlert } from "./auth-card";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = z.string().trim().email().safeParse(new FormData(event.currentTarget).get("email"));
    if (!parsed.success) {
      setError("Enter a valid email address");
      return;
    }
    setError(null);
    setPending(true);
    const { error: err } = await authClient.requestPasswordReset({ email: parsed.data, redirectTo: "/reset-password" });
    setPending(false);
    if (err?.status === 429) {
      setError("Too many requests. Wait a few minutes and try again.");
      return;
    }
    // Same message whether or not the account exists, so emails can't be probed.
    setSent(true);
  }

  if (sent) {
    return <FormAlert tone="success">If an account exists for that email, a reset link is on its way. It expires in 30 minutes.</FormAlert>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={error ?? undefined} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Spinner className="size-4 border-background border-r-transparent" /> : null}
        Send reset link
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (password.length < 8) return setError("Use at least 8 characters");
    if (password !== String(data.get("confirm") ?? "")) return setError("The passwords don't match");
    setError(null);
    setPending(true);
    const { error: err } = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (err) return setError("This reset link is invalid or has expired. Request a new one.");
    router.push("/sign-in?reset=1");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field label="New password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" />
      <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" placeholder="Type it again" />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Spinner className="size-4 border-background border-r-transparent" /> : null}
        Set new password
      </Button>
      <p className="text-center text-sm text-muted">
        <Link href="/forgot-password" className="hover:text-brand">
          Need a new link?
        </Link>
      </p>
    </form>
  );
}
