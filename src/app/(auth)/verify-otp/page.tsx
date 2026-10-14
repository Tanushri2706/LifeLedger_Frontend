"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { AuthShell, TrustRowMobile } from "@/components/auth/auth-shell";
import { Field, FormAlert } from "@/components/auth/form-bits";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail, resendOtp } = useAuth();

  const queryEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(queryEmail);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Keep email in sync if query param changes
  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [queryEmail]);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setStatus("error");
      setErrorMessage("Please enter the email address you registered with.");
      return;
    }
    if (code.length !== 6) {
      setStatus("error");
      setErrorMessage("Please enter the full 6-digit verification code.");
      return;
    }

    startTransition(async () => {
      try {
        await verifyEmail({
          email: cleanEmail,
          otp: code,
        });

        setStatus("success");
        toast.success("Email verified successfully! Please sign in.");
        setTimeout(() => {
          router.push(`/signin?email=${encodeURIComponent(cleanEmail)}`);
        }, 1200);
      } catch (err: unknown) {
        setStatus("error");
        if (err instanceof ApiError) {
          setErrorMessage(err.message || "Invalid or expired verification code.");
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Failed to verify code. Please try again.");
        }
      }
    });
  };

  const handleResend = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast.error("Please enter your email address first.");
      return;
    }
    if (resendCooldown > 0) return;

    try {
      await resendOtp({
        email: cleanEmail,
        purpose: "signup_verification",
      });
      toast.success("A new verification code has been dispatched to your email.");
      setResendCooldown(30);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Failed to resend verification code.");
      } else {
        toast.error("Failed to resend code. Please try again.");
      }
    }
  };

  return (
    <AuthShell
      title="Verify it's you"
      subtitle={
        email
          ? `We've sent a 6-digit verification code to ${email}.`
          : "We've sent a 6-digit verification code to your email address."
      }
      footer={
        <div className="space-y-5">
          <TrustRowMobile />
          <p className="text-sm text-muted-foreground">
            Wrong email?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Go back and edit
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {status === "error" ? (
          <FormAlert tone="error" title="Verification failed">
            {errorMessage || "Double-check the 6 digits, or request a new code below."}
          </FormAlert>
        ) : null}
        {status === "success" ? (
          <FormAlert tone="success" title="Verified successfully">
            Your email has been verified. Redirecting to sign in...
          </FormAlert>
        ) : null}

        {!queryEmail ? (
          <Field
            id="otp-email"
            label="Registered email address"
            type="email"
            placeholder="ananya.sharma@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        ) : null}

        <div className="space-y-3">
          <Label htmlFor="otp" className="text-sm font-medium">
            Verification code
          </Label>
          <InputOTP
            id="otp"
            maxLength={6}
            value={code}
            onChange={setCode}
            containerClassName="gap-2"
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="size-12 rounded-[var(--radius-md)] text-lg" />
              <InputOTPSlot index={1} className="size-12 rounded-[var(--radius-md)] text-lg" />
              <InputOTPSlot index={2} className="size-12 rounded-[var(--radius-md)] text-lg" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={3} className="size-12 rounded-[var(--radius-md)] text-lg" />
              <InputOTPSlot index={4} className="size-12 rounded-[var(--radius-md)] text-lg" />
              <InputOTPSlot index={5} className="size-12 rounded-[var(--radius-md)] text-lg" />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-xs text-muted-foreground">
            The code expires in 10 minutes. Never share it with anyone, including LifeLedger
            support.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isPending || status === "success"}
          className="h-12 w-full text-base shadow-[var(--shadow-glow)]"
        >
          {isPending ? "Verifying..." : "Verify and continue"}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="font-medium text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
          </button>
          <Link href="/reset-password" className="text-muted-foreground hover:text-foreground">
            Resetting your password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
