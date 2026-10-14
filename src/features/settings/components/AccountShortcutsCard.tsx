"use client";

import Link from "next/link";
import { User, ShieldCheck, ChevronRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccountShortcutsCard() {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-1">
        <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          Account & Security
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your personal health identity, sign-in credentials, and verification status.
        </p>
      </div>

      <div className="space-y-3.5">
        {/* Profile & Personal Info Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0 mt-0.5">
              <User className="size-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-foreground">Profile & Personal Details</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Update full name, phone number, date of birth, gender, blood group, and photo.
              </p>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="text-xs font-semibold h-9 shrink-0 gap-1.5 sm:self-center">
            <Link href="/profile">
              Manage Profile
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Security & Credentials Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0 mt-0.5">
              <KeyRound className="size-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-foreground">Password & Email Credentials</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Change your sign-in password and update verified primary email address.
              </p>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="text-xs font-semibold h-9 shrink-0 gap-1.5 sm:self-center">
            <Link href="/profile">
              Manage in Profile
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
