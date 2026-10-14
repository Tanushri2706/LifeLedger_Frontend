"use client";

import { useState } from "react";
import { Mail, ShieldCheck, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useRequestEmailChangeMutation,
  useVerifyEmailChangeMutation,
} from "../profile-hooks";

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
}

export function ChangeEmailDialog({
  open,
  onOpenChange,
  currentEmail,
}: ChangeEmailDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const requestMutation = useRequestEmailChangeMutation();
  const verifyMutation = useVerifyEmailChangeMutation();

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setStep(1);
      setNewEmail("");
      setOtp("");
      setClientError(null);
    }
    onOpenChange(isOpen);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    const emailTrimmed = newEmail.trim().toLowerCase();
    if (!emailTrimmed) {
      setClientError("Please enter a new email address.");
      return;
    }

    if (emailTrimmed === currentEmail.trim().toLowerCase()) {
      setClientError("New email address must be different from your current email.");
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setClientError("Please enter a valid email address.");
      return;
    }

    try {
      await requestMutation.mutateAsync({ newEmail: emailTrimmed });
      setStep(2);
    } catch {
      // Error handled by hook toast
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    const otpTrimmed = otp.trim();
    if (!otpTrimmed || otpTrimmed.length < 4) {
      setClientError("Please enter the verification code sent to your email.");
      return;
    }

    try {
      await verifyMutation.mutateAsync({
        newEmail: newEmail.trim().toLowerCase(),
        otp: otpTrimmed,
      });
      handleClose(false);
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg sm:text-xl">
            <Mail className="size-5 text-primary" />
            Change Email Address
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-xs sm:text-sm text-muted-foreground pt-1 space-y-1">
              <span>Securely update the primary email address linked to your account.</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Current Email</Label>
              <div className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground select-all font-mono">
                {currentEmail}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail" className="text-xs font-semibold text-foreground">
                New Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="newEmail"
                name="newEmail"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setClientError(null);
                }}
                disabled={requestMutation.isPending}
                className="h-10 text-sm"
              />
            </div>

            {clientError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{clientError}</span>
              </div>
            )}

            <div className="rounded-xl border border-border/80 bg-surface p-3 text-xs text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                <span>Verification Required</span>
              </div>
              <p>
                Your current email will remain active until you verify the security code sent to your
                new email address.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={requestMutation.isPending}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={requestMutation.isPending || !newEmail.trim()}
                className="gap-2 text-xs font-semibold h-9"
              >
                {requestMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 py-2">
            <div className="space-y-1 text-center">
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-1">
                <Mail className="size-5" />
              </div>
              <p className="text-xs text-muted-foreground">
                We sent a 6-digit verification code to
              </p>
              <p className="font-semibold text-sm text-foreground">{newEmail}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs font-semibold text-foreground">
                Enter Verification Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setClientError(null);
                }}
                disabled={verifyMutation.isPending}
                className="h-11 text-center font-mono text-lg tracking-widest"
              />
            </div>

            {clientError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{clientError}</span>
              </div>
            )}

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <span className="font-semibold">Security Note:</span>
              <p>
                Completing this verification will revoke all existing login sessions. You will be signed
                out and must sign in with your new email.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setClientError(null);
                }}
                disabled={verifyMutation.isPending}
                className="gap-1.5 text-xs h-9"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={verifyMutation.isPending || !otp.trim()}
                className="gap-2 text-xs font-semibold h-9"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Update Email"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
