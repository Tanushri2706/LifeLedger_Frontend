"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AuthShell, TrustRowMobile } from "@/components/auth/auth-shell";
import { Field, FormAlert, PasswordField } from "@/components/auth/form-bits";
import { OrDivider, SocialAuth } from "@/components/auth/social-auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your LifeLedger account to continue where you left off."
      footer={
        <div className="space-y-5">
          <TrustRowMobile />
          <p className="text-sm text-muted-foreground">
            New to LifeLedger?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      }
    >
      <Tabs defaultValue="user">
        <TabsList className="grid h-11 w-full grid-cols-2">
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="doctor">Doctor</TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="mt-6">
          <SignInForm role="user" />
        </TabsContent>
        <TabsContent value="doctor" className="mt-6">
          <SignInForm role="doctor" />
        </TabsContent>
      </Tabs>
    </AuthShell>
  );
}

function SignInForm({ role }: { role: "user" | "doctor" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    startTransition(async () => {
      try {
        const authData = await login({
          email: cleanEmail,
          password,
          portal: role === "doctor" ? "doctor" : "patient",
        });

        const userRole = authData.user?.role;
        const userFirstName = authData.user?.firstName || "there";
        toast.success(`Welcome back, ${userFirstName}!`);

        const from = searchParams.get("from");
        if (from && from.startsWith("/")) {
          router.push(from);
        } else if (userRole === "doctor") {
          router.push("/doctor");
        } else {
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          const errMsg = err.message || "";
          if (
            errMsg.toLowerCase().includes("verify your email") ||
            (err.statusCode === 403 && errMsg.toLowerCase().includes("verify"))
          ) {
            setUnverifiedEmail(cleanEmail);
            setError("Please verify your email address before logging in.");
          } else {
            setError(errMsg || "Invalid email or password.");
          }
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      }
    });
  };

  return (
    <div>
      <SocialAuth role={role} />
      <OrDivider />

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <FormAlert tone="error" title={unverifiedEmail ? "Email not verified" : "Sign in failed"}>
            {error}
            {unverifiedEmail ? (
              <span className="mt-2 block">
                <Link
                  href={`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`}
                  className="font-semibold underline hover:text-foreground"
                >
                  Click here to enter your verification code →
                </Link>
              </span>
            ) : null}
          </FormAlert>
        ) : null}

        <Field
          id={`${role}-email`}
          label={role === "doctor" ? "Registered email" : "Email address"}
          type="email"
          autoComplete="username"
          placeholder={
            role === "doctor" ? "dr.ananya@apollohospitals.in" : "ananya.sharma@gmail.com"
          }
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordField
          id={`${role}-password`}
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${role}-remember`}
              checked={remember}
              onCheckedChange={(checked) => setRemember(Boolean(checked))}
            />
            <Label htmlFor={`${role}-remember`} className="text-sm text-muted-foreground cursor-pointer">
              Keep me signed in
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full text-base shadow-[var(--shadow-glow)]"
        >
          {isPending
            ? "Signing in..."
            : role === "doctor"
              ? "Sign in to doctor console"
              : "Sign in to my health vault"}
        </Button>

        {role === "doctor" ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Doctor accounts are verified against your Medical Council registration before you can
            view any patient record.
          </p>
        ) : null}
      </form>
    </div>
  );
}
