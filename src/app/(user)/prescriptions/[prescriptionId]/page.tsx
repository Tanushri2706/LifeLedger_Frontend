"use client";

import { use } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
  FileText,
  Pill,
  RotateCcw,
  Stethoscope,
  User,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicalDisclaimer } from "@/components/vault/vault-bits";
import { usePatientPrescriptionQuery } from "@/features/doctors";

interface PageProps {
  params: Promise<{ prescriptionId: string }>;
}

export default function PatientPrescriptionPage({ params }: PageProps) {
  const { prescriptionId } = use(params);
  const { data: rx, isLoading, isError, refetch } = usePatientPrescriptionQuery(prescriptionId);

  const issuedDate = rx?.createdAt
    ? new Date(rx.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Clinical Visit";

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-3xl py-6 space-y-6">
        <Button asChild variant="ghost" size="sm" className="text-xs -ml-2 gap-1 text-muted-foreground hover:text-foreground">
          <Link href="/appointments">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Appointments
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : isError || !rx ? (
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <div className="space-y-1">
              <h2 className="font-semibold text-foreground text-base">Prescription Not Found</h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                The requested digital prescription could not be retrieved from your health records.
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="text-xs gap-1.5">
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          <Reveal>
            <article className="surface-calm rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <header className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Digital Prescription
                  </h1>
                  <p className="text-xs text-muted-foreground">Issued on {issuedDate}</p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Pill className="size-5" aria-hidden="true" />
                </span>
              </header>

              <Separator />

              {/* Doctor & Patient Info */}
              <div className="grid gap-6 sm:grid-cols-2 text-xs">
                <div className="space-y-1.5">
                  <h2 className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Stethoscope className="size-3.5 text-primary" aria-hidden="true" />
                    Doctor Details
                  </h2>
                  <p className="font-bold text-foreground text-sm">{rx.doctorName || "Treating Doctor"}</p>
                  {rx.appointmentId && (
                    <p className="text-muted-foreground font-mono text-[11px]">
                      Appointment ID: {rx.appointmentId}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h2 className="flex items-center gap-1.5 font-semibold text-foreground">
                    <User className="size-3.5 text-primary" aria-hidden="true" />
                    Patient Details
                  </h2>
                  <p className="font-bold text-foreground text-sm">{rx.patientName || "Patient"}</p>
                </div>
              </div>

              {/* Diagnosis if present */}
              {rx.instructions && (
                <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 space-y-1 text-xs">
                  <h2 className="font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-primary" />
                    Clinical Instructions & Notes
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">{rx.instructions}</p>
                </div>
              )}

              {/* Medicines List */}
              <div className="space-y-3">
                <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Pill className="size-4 text-primary" />
                  Prescribed Medications ({rx.medicines?.length || 0})
                </h2>

                {!rx.medicines || rx.medicines.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No specific medications listed.</p>
                ) : (
                  <ul className="space-y-3">
                    {rx.medicines.map((m, idx) => (
                      <li
                        key={idx}
                        className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-foreground">{m.name}</p>
                          <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                            {m.dosage}
                          </span>
                        </div>

                        <dl className="grid gap-2 text-xs sm:grid-cols-2 pt-1 border-t border-border/60">
                          <div>
                            <dt className="text-[11px] text-muted-foreground">Frequency / Timing</dt>
                            <dd className="font-medium text-foreground">{m.frequency}</dd>
                          </div>
                          <div>
                            <dt className="text-[11px] text-muted-foreground">Duration</dt>
                            <dd className="font-medium text-foreground">{m.duration}</dd>
                          </div>
                          {m.instructions && (
                            <div className="sm:col-span-2">
                              <dt className="text-[11px] text-muted-foreground">Instructions</dt>
                              <dd className="text-muted-foreground italic">{m.instructions}</dd>
                            </div>
                          )}
                        </dl>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Next Visit / Follow-up */}
              {rx.nextVisit && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-1 text-xs">
                  <h2 className="font-semibold text-foreground flex items-center gap-1.5">
                    <CalendarCheck className="size-3.5 text-primary" />
                    Recommended Follow-up
                  </h2>
                  <p className="text-muted-foreground">{rx.nextVisit}</p>
                </div>
              )}

              <MedicalDisclaimer className="mt-4" />
            </article>
          </Reveal>
        )}
      </div>
    </DashboardShell>
  );
}
