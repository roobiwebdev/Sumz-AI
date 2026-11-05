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
  name: z.string().trim().min(1, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "email" || key === "password") next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setPending(true);
    const { error } = await authClient.signUp.email({ ...parsed.data, callbackURL: "/app" });
    setPending(false);
    if (error) {
      setFormError(error.code === "USER_ALREADY_EXISTS" || error.status === 422 ? "An account with this email already exists. Try signing in." : (error.message ?? "Sign-up failed. Try again."));
      return;
    }
    router.push(`/check-email?email=${encodeURIComponent(parsed.data.email)}`);
  }

  return (
    <>
      {googleEnabled ? (
        <>
          <GoogleButton callbackURL="/app" label="Sign up with Google" />
          <OrDivider />
        </>
      ) : null}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        <Field label="Name" name="name" autoComplete="name" placeholder="Ada Lovelace" error={errors.name} />
        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email} />
        <Field label="Password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password} />
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
          {pending ? <Spinner className="size-4 border-background border-r-transparent" /> : null}
          Create account
        </Button>
        <p className="text-center text-xs text-subtle">
          We&apos;ll email you a link to confirm your address.
        </p>
      </form>
    </>
  );
}

export function SignUpFooter() {
  return (
    <>
      Already have an account?{" "}
      <Link href="/sign-in" className="font-medium text-foreground hover:text-brand">
        Sign in
      </Link>
    </>
  );
}
