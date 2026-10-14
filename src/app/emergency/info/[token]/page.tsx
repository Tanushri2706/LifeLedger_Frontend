"use client";

import { use } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Droplet,
  Heart,
  Phone,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  Siren,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicEmergencyInfoQuery } from "@/features/emergency/emergency-hooks";
import { INDIA_EMERGENCY_NUMBERS } from "@/features/emergency/emergency-types";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function PublicEmergencyInfoPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const { data: info, isLoading, isError, error, refetch } = usePublicEmergencyInfoQuery(token);

  const { NATIONAL_EMERGENCY, AMBULANCE } = INDIA_EMERGENCY_NUMBERS;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl space-y-6">
        {/* Top First-Responder Banner */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-emergency text-emergency-foreground shadow-lg shadow-emergency/30">
              <Siren className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold text-white sm:text-xl tracking-tight">
                Emergency Medical Card
              </h1>
              <p className="text-xs text-slate-400">
                Official LifeLedger First-Responder Summary
              </p>
            </div>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-semibold" variant="outline">
            Verified Token
          </Badge>
        </header>

        {/* Immediate Emergency Action Calling Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            asChild
            size="lg"
            className="w-full gap-2 bg-emergency text-emergency-foreground hover:bg-emergency/90 font-bold text-sm shadow-md"
          >
            <a href={NATIONAL_EMERGENCY.actionUrl} aria-label="Call 112 National Emergency">
              <PhoneCall className="size-4" />
              Call 112 (National)
            </a>
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-md"
          >
            <a href={AMBULANCE.actionUrl} aria-label="Call 108 Ambulance">
              <Phone className="size-4" />
              Call 108 (Ambulance)
            </a>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full bg-slate-800" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-1/2 bg-slate-800" />
                <Skeleton className="h-4 w-1/3 bg-slate-800" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-xl bg-slate-800" />
              <Skeleton className="h-24 rounded-xl bg-slate-800" />
            </div>
            <Skeleton className="h-24 rounded-xl bg-slate-800" />
          </div>
        ) : isError || !info ? (
          /* Invalid / Expired Token Error State */
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 sm:p-8 text-center space-y-4">
            <div className="grid size-12 place-items-center rounded-full bg-rose-500/20 text-rose-400 mx-auto">
              <AlertTriangle className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Emergency Medical Card Inactive or Expired
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                {error?.message ||
                  "This Emergency QR code has been rotated or revoked by the patient and is no longer active."}
              </p>
            </div>

            <div className="rounded-xl bg-slate-900/80 p-4 text-xs text-slate-400 border border-slate-800 max-w-md mx-auto">
              <strong className="text-slate-200 block mb-1">First-Responder Advisory:</strong>
              If the patient requires urgent medical attention, dial <strong>112</strong> or <strong>108</strong> directly from your phone.
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              <RefreshCw className="size-3.5" />
              Retry Lookup
            </Button>
          </div>
        ) : (
          /* Active Emergency Information Display */
          <article className="rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
            {/* Patient Header & Blood Group */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <User className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {info.userName || "Patient Medical Record"}
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Clock className="size-3 text-slate-500" />
                    Verified emergency profile
                  </p>
                </div>
              </div>

              {/* Blood Group Display */}
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 px-4 py-2.5 shrink-0">
                <Droplet className="size-5 text-rose-500 fill-rose-500" aria-hidden="true" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
                    Blood Group
                  </span>
                  <span className="font-mono text-xl font-black text-rose-400">
                    {info.bloodGroup && info.bloodGroup !== "UNKNOWN" ? info.bloodGroup : "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Emergency Notes (High Priority Callout) */}
            {info.criticalNotes ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-400">
                  <AlertCircle className="size-4" aria-hidden="true" />
                  <span>Critical First-Responder Instructions:</span>
                </div>
                <p className="text-sm text-slate-100 font-medium leading-relaxed pt-0.5">
                  {info.criticalNotes}
                </p>
              </div>
            ) : null}

            {/* Clinical Parameters Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Known Allergies */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <AlertCircle className="size-3.5" />
                  Known Allergies ({info.allergies?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {info.allergies && info.allergies.length > 0 ? (
                    info.allergies.map((allergy, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 text-xs font-semibold text-rose-200"
                      >
                        {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No drug/food allergies recorded</span>
                  )}
                </div>
              </div>

              {/* Pre-existing Medical Conditions */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                  <Heart className="size-3.5" />
                  Medical Conditions ({info.medicalConditions?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {info.medicalConditions && info.medicalConditions.length > 0 ? (
                    info.medicalConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md bg-sky-500/20 border border-sky-500/30 px-2.5 py-1 text-xs font-semibold text-sky-200"
                      >
                        {cond}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No medical conditions recorded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contacts with Click-to-Call */}
            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Phone className="size-3.5 text-primary" />
                Emergency Contacts
              </h3>

              <div className="space-y-2">
                {info.emergencyContacts && info.emergencyContacts.length > 0 ? (
                  info.emergencyContacts.map((contact, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">
                            {contact.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({contact.relationship})
                          </span>
                          {contact.isPrimary ? (
                            <Badge className="bg-primary/20 text-primary border-primary/40 text-[10px]">
                              Primary Contact
                            </Badge>
                          ) : null}
                        </div>
                        <span className="font-mono text-xs text-slate-300 block mt-0.5">
                          {contact.phone}
                        </span>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 font-bold shrink-0 shadow-sm"
                      >
                        <a href={`tel:${contact.phone.replace(/[\s\-()]/g, "")}`}>
                          <Phone className="size-3.5" />
                          Call {contact.name.split(" ")[0]}
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic rounded-lg bg-slate-950/50 p-3 border border-slate-800">
                    No emergency contacts listed by patient.
                  </p>
                )}
              </div>
            </div>

            {/* Medical Disclaimer & Privacy Boundaries */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>Clinical & Privacy Disclosure</span>
              </div>
              <p className="leading-relaxed">
                {info.disclaimer ||
                  "This emergency summary is provided directly by the patient for first responders. Clinical verification is recommended before administering medical treatment."}
              </p>
              <p className="text-slate-500 text-[10px]">
                No uploaded medical reports, OCR extractions, prescription records, or home addresses are exposed through this emergency interface.
              </p>
            </div>
          </article>
        )}

        {/* Footer */}
        <footer className="text-center pt-2 pb-6 text-xs text-slate-500">
          LifeLedger Emergency System &bull; India Helplines 112 / 108 &bull; End-to-End Encrypted Platform
        </footer>
      </div>
    </main>
  );
}
