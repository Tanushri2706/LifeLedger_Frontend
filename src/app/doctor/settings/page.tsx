"use client";

import Link from "next/link";
import { DoctorShell } from "@/components/doctor/doctor-shell";
import { AppearanceCard } from "@/features/settings/components/AppearanceCard";
import { SessionSignOutCard } from "@/features/settings/components/SessionSignOutCard";
import { UserCheck, ShieldCheck, ChevronRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

function DoctorAccountShortcuts() {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-1">
        <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          Credentials & Profile
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your medical council registration, clinic details, and practice credentials.
        </p>
      </div>

      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0 mt-0.5">
              <GraduationCap className="size-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-foreground">Practice & Clinic Details</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Update consultation fees, affiliated hospitals, languages, and qualifications.
              </p>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="text-xs font-semibold h-9 shrink-0 gap-1.5 sm:self-center">
            <Link href="/doctor/profile">
              Manage Profile
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0 mt-0.5">
              <UserCheck className="size-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-foreground">Slot Availability</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Configure your weekly working schedule and consultation time slots.
              </p>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="text-xs font-semibold h-9 shrink-0 gap-1.5 sm:self-center">
            <Link href="/doctor/availability">
              Manage Slots
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorSettingsPage() {
  return (
    <DoctorShell>
      <div className="mx-auto max-w-4xl space-y-6 pt-4 sm:pt-6">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Doctor Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your workspace theme, practice shortcuts, and portal security.
          </p>
        </div>

        {/* Appearance Settings */}
        <AppearanceCard />

        {/* Doctor Account & Credentials */}
        <DoctorAccountShortcuts />

        {/* Session Sign Out */}
        <SessionSignOutCard />
      </div>
    </DoctorShell>
  );
}
