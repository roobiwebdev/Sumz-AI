import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpFooter, SignUpForm } from "@/components/auth/sign-up-form";
import { integrations } from "@/server/env";
import { getSession } from "@/server/session";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage() {
  if (await getSession()) redirect("/app");
  return (
    <AuthCard title="Create your account" description="Free to start. 25 summaries a day." footer={<SignUpFooter />}>
      <SignUpForm googleEnabled={integrations.google} />
    </AuthCard>
  );
}
