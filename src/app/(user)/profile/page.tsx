"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RotateCcw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  useProfileQuery,
  ProfileHeader,
  PersonalInfoCard,
  AccountSecurityCard,
} from "@/features/profile";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: profile, isLoading, isError, error, refetch } = useProfileQuery();

  // Redirect to signin if unauthenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || (isLoading && !profile)) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-4xl space-y-6 pt-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8">
            <div className="flex items-center gap-6">
              <Skeleton className="size-24 sm:size-28 rounded-full" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded-lg" />
                <Skeleton className="h-4 w-36 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (isError || !profile) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-4xl pt-12">
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
            <div className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground font-display">
                Failed to load profile
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {error instanceof Error ? error.message : "An unexpected error occurred while fetching your account details."}
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
            >
              <RotateCcw className="size-3.5" />
              Retry Loading
            </Button>
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
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            View and update your personal health identity, credentials, and verification status.
          </p>
        </div>

        {/* Profile Card / Header with Avatar */}
        <ProfileHeader profile={profile} />

        {/* Personal Details Form Card */}
        <PersonalInfoCard profile={profile} />

        {/* Account & Security Card */}
        <AccountSecurityCard profile={profile} />
      </div>
    </DashboardShell>
  );
}
