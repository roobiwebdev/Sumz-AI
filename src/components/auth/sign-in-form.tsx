"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { FormAlert, OrDivider } from "./auth-card";
import { GoogleButton } from "./google-button";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export function SignInForm({ googleEnabled, next, initialError }: { googleEnabled: boolean; next: string; initialError?: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setNotice(null);
    const parsed = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      const nextErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "email" || key === "password") nextErrors[key] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setPending(true);
    const { error } = await authClient.signIn.email({ ...parsed.data, callbackURL: next });
    if (error) {
      setPending(false);
      if (error.status === 403) {
        setNotice("Confirm your email first. We've sent you a new link, so check your inbox.");
      } else if (error.status === 429) {
        setFormError("Too many attempts. Wait a minute and try again.");
      } else {
        setFormError("That email and password don't match. Try again or reset your password.");
      }
      return;
    }
    router.push(next as "/app");
    router.refresh();
  }

  return (
    <>
      {googleEnabled ? (
        <>
          <GoogleButton callbackURL={next} />
          <OrDivider />
        </>
      ) : null}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        {notice ? <FormAlert tone="success">{notice}</FormAlert> : null}
        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email} />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password}
          hint={
            <Link href="/forgot-password" className="text-xs text-muted hover:text-brand">
              Forgot password?
            </Link>
          }
        />
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
          {pending ? <Spinner className="size-4 border-background border-r-transparent" /> : null}
          Sign in
        </Button>
      </form>
    </>
  );
}

export function SignInFooter() {
  return (
    <>
      New to Sumz AI?{" "}
      <Link href="/sign-up" className="font-medium text-foreground hover:text-brand">
        Create an account
      </Link>
    </>
  );
}
