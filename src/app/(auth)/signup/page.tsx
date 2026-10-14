"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your health vault"
      subtitle="It takes under a minute. Your reports stay encrypted and visible only to you."
      footer={
        <div className="space-y-5">
          <TrustRowMobile />
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-primary hover:underline">
              Sign in
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
          <UserSignUpForm />
        </TabsContent>
        <TabsContent value="doctor" className="mt-6">
          <DoctorSignUpForm />
        </TabsContent>
      </Tabs>
    </AuthShell>
  );
}

function Consent({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(Boolean(c))}
        className="mt-0.5"
      />
      <Label htmlFor={id} className="text-xs leading-relaxed font-normal text-muted-foreground cursor-pointer">
        I agree to the Terms of Use and Privacy Policy, and consent to LifeLedger storing my health
        records securely.
      </Label>
    </div>
  );
}

function UserSignUpForm() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!consent) {
      setError("Please accept the terms and privacy policy to continue.");
      return;
    }

    const parts = cleanName.split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || parts[0] || "User";

    startTransition(async () => {
      try {
        await signup({
          firstName,
          lastName,
          email: cleanEmail,
          phone: phone.trim() || undefined,
          password,
        });

        toast.success("Account created! A 6-digit verification code was sent to your email.");
        router.push(`/verify-otp?email=${encodeURIComponent(cleanEmail)}`);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setError(err.message || "Failed to create account. Please try again.");
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
      <SocialAuth />
      <OrDivider label="or sign up with email" />

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <FormAlert tone="error" title="Sign up failed">
            {error}
          </FormAlert>
        ) : null}

        <Field
          id="su-name"
          label="Full name"
          placeholder="Ananya Sharma"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Field
          id="su-email"
          label="Email address"
          type="email"
          placeholder="ananya.sharma@gmail.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          id="su-phone"
          label="Mobile number"
          type="tel"
          placeholder="+91 98765 43210"
          hint="Used for emergency access alerts and SMS verification."
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <PasswordField
          id="su-password"
          label="Create password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use 8+ characters with letters and numbers."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Consent id="su-consent" checked={consent} onChange={setConsent} />

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full text-base shadow-[var(--shadow-glow)]"
        >
          {isPending ? "Creating your vault..." : "Create my health vault"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Already got a code?{" "}
          <Link href="/verify-otp" className="font-medium text-primary hover:underline">
            Verify now
          </Link>
        </p>
      </form>
    </div>
  );
}

function DoctorSignUpForm() {
  const router = useRouter();
  const { signupDoctor } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialityAndHospital, setSpecialityAndHospital] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanName = name.trim();
    const cleanLicense = licenseNumber.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }
    if (!cleanEmail) {
      setError("Please enter your work email.");
      return;
    }
    if (!cleanLicense) {
      setError("Please enter your Medical Council registration number.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!consent) {
      setError("Please accept the terms and privacy policy to continue.");
      return;
    }

    const parts = cleanName.split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || parts[0] || "Doctor";

    // Split speciality and hospital
    const splitSpec = specialityAndHospital.split(/[·,]/).map((s) => s.trim());
    const specialization = splitSpec[0] || "General Medicine";
    const hospital = splitSpec[1] || "Independent Practice";

    startTransition(async () => {
      try {
        await signupDoctor({
          firstName,
          lastName,
          email: cleanEmail,
          password,
          licenseNumber: cleanLicense,
          specialization,
          hospital,
          experience: 5,
          qualification: "MBBS",
          consultationFee: 500,
        });

        toast.success("Doctor registration submitted! A 6-digit verification code was sent to your email.");
        router.push(`/verify-otp?email=${encodeURIComponent(cleanEmail)}`);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setError(err.message || "Failed to register doctor account.");
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
      <SocialAuth role="doctor" />
      <OrDivider label="or register with email" />

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <FormAlert tone="error" title="Doctor registration failed">
            {error}
          </FormAlert>
        ) : null}

        <Field
          id="dr-name"
          label="Full name"
          placeholder="Dr. Rohit Menon"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Field
          id="dr-email"
          label="Work email"
          type="email"
          placeholder="dr.rohit@apollohospitals.in"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          id="dr-reg"
          label="Medical Council registration number"
          placeholder="MCI/2014/58231"
          hint="Verified with the State Medical Council before approval."
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          required
        />
        <Field
          id="dr-speciality"
          label="Speciality & hospital"
          placeholder="Cardiology · Apollo Hospitals, Chennai"
          value={specialityAndHospital}
          onChange={(e) => setSpecialityAndHospital(e.target.value)}
        />
        <PasswordField
          id="dr-password"
          label="Create password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Consent id="dr-consent" checked={consent} onChange={setConsent} />

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full text-base shadow-[var(--shadow-glow)]"
        >
          {isPending ? "Submitting request..." : "Request doctor access"}
        </Button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Doctor dashboards are rolling out gradually. You&apos;ll be notified by email once your
          verification is complete.
        </p>
      </form>
    </div>
  );
}
