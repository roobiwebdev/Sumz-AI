"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
      <path fill="#34A853" d="M3.5 7.5l3.2 2.3C7.6 7.9 9.6 6.3 12 6.3c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 8.3 2.4 5.1 4.5 3.5 7.5z" opacity=".001" />
      <path fill="#4285F4" d="M21.2 12.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.3-1 2.3-2.1 3l3.3 2.5c1.9-1.8 2.5-4.5 2.5-7.8z" />
      <path fill="#FBBC05" d="M6.1 14.3c-.2-.7-.4-1.4-.4-2.3s.1-1.6.4-2.3L2.9 7.3C2.2 8.7 1.8 10.3 1.8 12s.4 3.3 1.1 4.7l3.2-2.4z" />
      <path fill="#34A853" d="M12 21.6c2.6 0 4.8-.9 6.4-2.4l-3.3-2.5c-.9.6-2 1-3.1 1-2.4 0-4.4-1.6-5.2-3.8l-3.2 2.4c1.6 3.1 4.8 5.3 8.4 5.3z" />
    </svg>
  );
}

export function GoogleButton({ callbackURL, label = "Continue with Google" }: { callbackURL: string; label?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const { error: err } = await authClient.signIn.social({ provider: "google", callbackURL, errorCallbackURL: "/sign-in" });
          if (err) {
            setError(err.message ?? "Google sign-in failed. Try again.");
            setPending(false);
          }
        }}
      >
        {pending ? <Spinner className="size-4" /> : <GoogleIcon />}
        {label}
      </Button>
      {error ? <p className="text-center text-xs text-danger">{error}</p> : null}
    </div>
  );
}
