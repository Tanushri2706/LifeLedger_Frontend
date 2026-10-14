"use client";

import Link from "next/link";
import { Lock, FileCheck2, QrCode, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrivacyCard() {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-1">
        <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Lock className="size-5 text-primary" />
          Privacy & Vault Governance
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Clear, factual overview of how your health records and sharing permissions work.
        </p>
      </div>

      <div className="space-y-3.5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {/* Vault Isolation */}
          <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <FileCheck2 className="size-4 text-primary shrink-0" />
              <span>Vault Isolation</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your uploaded medical records, prescriptions, and health timeline remain private to your
              authenticated account by default.
            </p>
          </div>

          {/* Selective Medical Share */}
          <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <QrCode className="size-4 text-primary shrink-0" />
              <span>Selective Medical Share</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Medical Share links require explicit record selection and have time-limited validity. You
              choose exactly what a doctor sees.
            </p>
          </div>

          {/* Emergency Separation */}
          <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <Lock className="size-4 text-primary shrink-0" />
              <span>Emergency Profile Separation</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Emergency QR contains only essential critical parameters (blood group, allergies, emergency
              contacts) without exposing full medical records.
            </p>
          </div>

          {/* Active Share Management */}
          <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <Users className="size-4 text-primary shrink-0" />
              <span>Revocation Controls</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Active medical share links and family member profiles can be reviewed or revoked anytime
              from the Family Vault management interface.
            </p>
          </div>
        </div>

        {/* Action Link to Family Vault */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary-soft/30 p-4 sm:p-5 mt-2">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">Manage Shared Access & Family Profiles</h3>
            <p className="text-xs text-muted-foreground">
              Review active shares, manage family members, and audit access permissions.
            </p>
          </div>
          <Button asChild size="sm" className="text-xs font-semibold h-9 shrink-0 gap-1.5 sm:self-center">
            <Link href="/family">
              Open Family Vault
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
