"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  AppearanceCard,
  AccountShortcutsCard,
  PrivacyCard,
  SessionSignOutCard,
} from "@/features/settings";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to signin if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-4xl space-y-6 pt-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6 pt-4 sm:pt-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your workspace theme, account shortcuts, and data privacy governance.
          </p>
        </div>

        {/* Appearance Settings */}
        <AppearanceCard />

        {/* Account & Security Shortcuts */}
        <AccountShortcutsCard />

        {/* Privacy & Vault Governance */}
        <PrivacyCard />

        {/* Session Sign Out */}
        <SessionSignOutCard />
      </div>
    </DashboardShell>
  );
}
