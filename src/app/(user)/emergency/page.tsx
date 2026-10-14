"use client";

import Link from "next/link";
import {
  Ambulance,
  ArrowRight,
  Building2,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EmergencyCallingBanner,
  SOSTriggerCard,
  EmergencyProfileCard,
  EmergencyContactsManager,
  EmergencyQrCard,
  EmergencyFacilitiesSection,
} from "@/features/emergency";

export default function EmergencyHubPage() {

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-6xl py-6 space-y-6">
        {/* Header */}
        <Reveal>
          <header className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Emergency Response & Safety Hub
                </h1>
                <Badge variant="outline" className="bg-emergency/15 text-emergency border-emergency/30 font-semibold text-xs">
                  24×7 Active
                </Badge>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                Rapid emergency calling, First-Responder QR card, SOS safety audit, and emergency medical contacts
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs flex-1 sm:flex-initial">
                <Link href="/ambulance">
                  <Ambulance className="size-3.5" />
                  Ambulance (108) Info
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="gap-1.5 text-xs flex-1 sm:flex-initial">
                <Link href="/hospitals">
                  <Building2 className="size-3.5" />
                  Nearby Hospitals
                </Link>
              </Button>
            </div>
          </header>
        </Reveal>

        {/* 1. Direct Emergency Helpline Calling Actions (112 & 108) */}
        <Reveal delay={0.04}>
          <EmergencyCallingBanner />
        </Reveal>

        {/* 2. Intentional SOS Distress Safety Audit */}
        <Reveal delay={0.06}>
          <SOSTriggerCard />
        </Reveal>

        {/* 3. Emergency QR & Public Medical Summary */}
        <div id="emergency-qr">
          <Reveal delay={0.08}>
            <EmergencyQrCard />
          </Reveal>
        </div>

        {/* 4. Emergency Profile & Contacts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal delay={0.1}>
            <EmergencyProfileCard />
          </Reveal>
          <Reveal delay={0.12}>
            <EmergencyContactsManager />
          </Reveal>
        </div>

        {/* 5. Nearby Emergency Healthcare Facilities */}
        <Reveal delay={0.14}>
          <EmergencyFacilitiesSection />
        </Reveal>

        {/* 6. Ambulance Limited-Mode Advisory Card */}
        <Reveal delay={0.16}>
          <section className="rounded-2xl border border-border/80 bg-surface/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary shrink-0">
                <Ambulance className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h4 className="font-semibold text-sm text-foreground">
                  Ambulance Dispatch & Fleet Specifications
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Understand Basic (BLS), Advanced (ALS), and Neonatal ambulance capabilities and dispatch protocols.
                </p>
              </div>
            </div>

            <Button asChild size="sm" variant="outline" className="gap-1.5 shrink-0 text-xs">
              <Link href="/ambulance">
                View Ambulance Specifications
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </section>
        </Reveal>
      </div>
    </DashboardShell>
  );
}
