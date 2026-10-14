"use client";

import Link from "next/link";
import {
  CalendarHeart,
  Clock,
  User,
  ChevronRight,
  Video,
  MapPin,
  PhoneCall,
  CalendarX2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DoctorAppointmentItemDto } from "../doctor-types";
import { formatTimeSlot, getPatientDisplayName } from "@/lib/utils";

interface DoctorAppointmentsPreviewProps {
  appointments: DoctorAppointmentItemDto[];
  isLoading?: boolean;
}

function formatConsultationType(type: string) {
  const normalized = type?.toLowerCase() || "";
  if (normalized.includes("video")) {
    return { label: "Video Consult", icon: Video, color: "text-primary bg-primary/10" };
  }
  if (normalized.includes("audio") || normalized.includes("phone")) {
    return { label: "Audio Consult", icon: PhoneCall, color: "text-amber-600 bg-amber-500/10" };
  }
  return { label: "In-Clinic Visit", icon: MapPin, color: "text-emerald-600 bg-emerald-500/10" };
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "pending";
  if (s === "confirmed") {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px] font-semibold"
      >
        Confirmed
      </Badge>
    );
  }
  if (s === "completed") {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground text-[11px]">
        Completed
      </Badge>
    );
  }
  if (s === "cancelled") {
    return (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/30 text-[11px]"
      >
        Cancelled
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[11px] font-semibold"
    >
      Pending
    </Badge>
  );
}

export function DoctorAppointmentsPreview({
  appointments,
  isLoading,
}: DoctorAppointmentsPreviewProps) {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="space-y-1">
          <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarHeart className="size-5 text-primary" />
            Today&apos;s Appointments
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Scheduled consultations and patient sessions for today.
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="text-xs font-semibold h-9 gap-1.5">
          <Link href="/doctor/appointments">
            View All
            <ChevronRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-surface/50 gap-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-36 rounded-lg" />
                  <Skeleton className="h-3 w-48 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-12 px-4 text-center space-y-3">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto">
            <CalendarX2 className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">No Consultations Scheduled Today</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You have no patient appointments scheduled for today. Update your slot availability to receive bookings.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs font-semibold h-8 mt-2">
            <Link href="/doctor/availability">Manage Slot Availability</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const consultType = formatConsultationType(appt.consultationType);
            const TypeIcon = consultType.icon;
            const patientName = getPatientDisplayName(appt.patientName || appt.patient, "Patient");
            const patientAge = appt.patientAge || (typeof appt.patient === "object" ? appt.patient?.age : undefined);
            const timeDisplay = formatTimeSlot(appt.timeSlot || appt.time, appt.date || "Scheduled Slot");

            return (
              <div
                key={appt.id || appt.appointmentId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-surface/50 hover:bg-surface transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0">
                    <User className="size-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {patientName}
                      </span>
                      {patientAge ? (
                        <span className="text-xs text-muted-foreground">({patientAge} yrs)</span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="size-3.5 text-primary" />
                        {timeDisplay}
                      </span>
                      <span className="flex items-center gap-1">
                        <TypeIcon className="size-3.5" />
                        {consultType.label}
                      </span>
                      {appt.reason ? (
                        <span className="truncate max-w-[200px]">· {appt.reason}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
