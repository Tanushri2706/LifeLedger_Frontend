"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AuthShell, TrustRowMobile } from "@/components/auth/auth-shell";
import { Field, FormAlert } from "@/components/auth/form-bits";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    startTransition(async () => {
      try {
        await forgotPassword({ email: cleanEmail });
        setSent(true);
        toast.success("Verification code sent if the account exists.");
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setError(err.message || "Failed to process request. Please try again.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      }
    });
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email address linked to your vault and we'll send you a 6-digit verification code."
      footer={
        <div className="space-y-5">
          <TrustRowMobile />
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <FormAlert tone="error" title="Unable to send code">
            {error}
          </FormAlert>
        ) : null}

        {sent ? (
          <FormAlert tone="success" title="Verification code sent">
            Check your inbox for a 6-digit reset code. The code is valid for 10 minutes.
          </FormAlert>
        ) : null}

        <Field
          id="fp-identifier"
          label="Email address"
          type="email"
          placeholder="ananya.sharma@gmail.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full text-base shadow-[var(--shadow-glow)]"
        >
          {isPending ? "Sending code..." : "Send verification code"}
        </Button>

        {sent ? (
          <Button asChild variant="outline" className="h-12 w-full text-base">
            <Link href={`/reset-password?email=${encodeURIComponent(email.trim())}`}>
              Enter the reset code
            </Link>
          </Button>
        ) : null}
      </form>
    </AuthShell>
  );
}
