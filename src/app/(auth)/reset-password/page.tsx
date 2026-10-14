"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { AuthShell, TrustRowMobile } from "@/components/auth/auth-shell";
import { Field, FormAlert, PasswordField } from "@/components/auth/form-bits";
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
import { cn } from "@/lib/utils";

const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One letter", test: (v: string) => /[a-zA-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
];

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();

  const queryEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(queryEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [queryEmail]);

  const mismatch = password && confirm && password !== confirm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setState("idle");
    setErrorMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setState("error");
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    if (otp.length !== 6) {
      setState("error");
      setErrorMessage("Please enter the 6-digit reset code sent to your email.");
      return;
    }

    const ok = rules.every((r) => r.test(password));
    if (!ok) {
      setState("error");
      setErrorMessage("Please ensure your new password meets all security requirements.");
      return;
    }

    if (password !== confirm) {
      setState("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        await resetPassword({
          email: cleanEmail,
          otp: otp.trim(),
          newPassword: password,
        });

        setState("success");
        toast.success("Password reset successfully! Please sign in.");
        setTimeout(() => {
          router.push(`/signin?email=${encodeURIComponent(cleanEmail)}`);
        }, 1500);
      } catch (err: unknown) {
        setState("error");
        if (err instanceof ApiError) {
          setErrorMessage(err.message || "Failed to reset password. Check your reset code.");
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Failed to reset password. Please try again.");
        }
      }
    });
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password. You'll use it every time you open your health vault."
      footer={
        <div className="space-y-5">
          <TrustRowMobile />
          <p className="text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href="/signin" className="font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {state === "success" ? (
          <FormAlert tone="success" title="Password updated">
            Your password has been changed. Redirecting to sign in...
          </FormAlert>
        ) : null}

        {state === "error" ? (
          <FormAlert tone="error" title="Password reset failed">
            {errorMessage || "Please check your reset code and password requirements."}
          </FormAlert>
        ) : null}

        {!queryEmail ? (
          <Field
            id="rp-email"
            label="Email address"
            type="email"
            placeholder="ananya.sharma@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        ) : null}

        <div className="space-y-3">
          <Label htmlFor="rp-otp" className="text-sm font-medium">
            6-digit reset code
          </Label>
          <InputOTP
            id="rp-otp"
            maxLength={6}
            value={otp}
            onChange={setOtp}
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
        </div>

        <PasswordField
          id="rp-password"
          label="New password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <ul className="grid gap-2 sm:grid-cols-3">
          {rules.map((rule) => {
            const passed = rule.test(password);
            return (
              <li
                key={rule.label}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-xs",
                  passed ? "bg-success/10 text-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Check
                  className={cn("size-3.5", passed ? "text-success" : "opacity-40")}
                  aria-hidden="true"
                />
                {rule.label}
              </li>
            );
          })}
        </ul>

        <PasswordField
          id="rp-confirm"
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={mismatch ? "Passwords don't match." : undefined}
          required
        />

        <Button
          type="submit"
          disabled={isPending || state === "success"}
          className="h-12 w-full text-base shadow-[var(--shadow-glow)]"
        >
          {isPending ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
