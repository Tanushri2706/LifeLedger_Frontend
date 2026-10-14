"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
import {
  AmbulanceLimitedModeBanner,
  AmbulanceTypesOverview,
  AmbulanceDevInspection,
} from "@/features/ambulance";
import { EmergencyFacilitiesSection } from "@/features/emergency";

export default function AmbulancePage() {
  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-6xl py-6 space-y-6">
        {/* Header */}
        <Reveal>
          <header className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs -ml-2 text-muted-foreground">
                  <Link href="/emergency">
                    <ArrowLeft className="size-3.5 mr-1" />
                    Emergency Hub
                  </Link>
                </Button>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
                Ambulance & Emergency Medical Transport
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Official emergency medical dispatch guidelines and vehicle capabilities
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs flex-1 sm:flex-initial">
                <Link href="/hospitals">
                  <Building2 className="size-3.5" />
                  Nearby Hospitals
                </Link>
              </Button>
            </div>
          </header>
        </Reveal>

        {/* 1. Ambulance Limited Mode Direct Calling Banner */}
        <Reveal delay={0.04}>
          <AmbulanceLimitedModeBanner />
        </Reveal>

        {/* 2. Educational Ambulance Types & Specifications Overview */}
        <Reveal delay={0.08}>
          <AmbulanceTypesOverview />
        </Reveal>

        {/* 3. Nearby Emergency Facilities */}
        <Reveal delay={0.12}>
          <EmergencyFacilitiesSection />
        </Reveal>

        {/* 4. Developer Inspection Collapsible (Simulated DTOs) */}
        <Reveal delay={0.16}>
          <AmbulanceDevInspection />
        </Reveal>
      </div>
    </DashboardShell>
  );
}
