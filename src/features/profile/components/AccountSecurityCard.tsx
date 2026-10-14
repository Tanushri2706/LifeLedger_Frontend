"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserProfileDto } from "../profile-types";
import { ChangeEmailDialog } from "./ChangeEmailDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

interface AccountSecurityCardProps {
  profile: UserProfileDto;
}

export function AccountSecurityCard({ profile }: AccountSecurityCardProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const formattedJoinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-1">
        <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          Account & Security
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your login credentials, email authentication, and security preferences.
        </p>
      </div>

      <div className="space-y-4">
        {/* Email Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0 mt-0.5">
              <Mail className="size-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Email Address</span>
                {profile.isVerified ? (
                  <Badge
                    variant="outline"
                    className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px] font-semibold py-0"
                  >
                    <CheckCircle2 className="size-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30 text-[11px] font-semibold py-0"
                  >
                    <AlertCircle className="size-3" />
                    Unverified
                  </Badge>
                )}
              </div>
              <p className="text-xs font-mono text-muted-foreground break-all">{profile.email}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEmailDialogOpen(true)}
            className="text-xs font-semibold h-9 shrink-0 sm:self-center"
          >
            Change Email
          </Button>
        </div>

        {/* Password Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0 mt-0.5">
              <KeyRound className="size-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-sm font-semibold text-foreground">Account Password</span>
              <p className="text-xs text-muted-foreground font-mono tracking-wider">
                ••••••••••••••••
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPasswordDialogOpen(true)}
            className="text-xs font-semibold h-9 shrink-0 sm:self-center"
          >
            Change Password
          </Button>
        </div>

        {/* Account Details / Read-only Meta */}
        <div className="pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary" />
              <span>Multi-session revocation active on password/email updates</span>
            </div>
            {formattedJoinDate ? (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>Account created {formattedJoinDate}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ChangeEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        currentEmail={profile.email}
      />

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
}
