"use client";

import Link from "next/link";
import {
  GraduationCap,
  Building2,
  Clock,
  Wallet,
  Languages,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import type { DoctorProfile } from "@/types/auth";
import type { DoctorProfileDto } from "../doctor-types";

interface DoctorProfessionalSummaryProps {
  doctorProfile?: DoctorProfileDto | null;
}

export function DoctorProfessionalSummary({ doctorProfile }: DoctorProfessionalSummaryProps) {
  const { user } = useAuth();
  const doctorUser = user as DoctorProfile | null;

  const doctorName =
    doctorProfile?.fullName ||
    (doctorProfile?.firstName ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName || ""}`.trim() : null) ||
    (doctorUser?.firstName ? `Dr. ${doctorUser.firstName} ${doctorUser.lastName || ""}`.trim() : null) ||
    "Dr. Doctor";

  const specialization =
    doctorProfile?.specialization ||
    doctorUser?.specialization ||
    doctorUser?.doctor?.specialization ||
    "General Medicine";

  const qualification =
    doctorProfile?.qualification ||
    doctorUser?.qualification ||
    doctorUser?.doctor?.qualification ||
    "Medical Practitioner";

  const hospital =
    doctorProfile?.hospital ||
    doctorUser?.hospital ||
    doctorUser?.doctor?.hospital ||
    "Associated Clinic";

  const experience =
    doctorProfile?.experience ??
    doctorUser?.doctor?.experience ??
    doctorUser?.experienceYears;

  const fee =
    doctorProfile?.consultationFee ??
    doctorUser?.consultationFee ??
    doctorUser?.doctor?.consultationFee;

  const languages =
    doctorProfile?.languages ||
    doctorUser?.languages ||
    doctorUser?.doctor?.languages ||
    ["English", "Hindi"];

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            Practice Profile
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your registered credentials displayed to patients.
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="text-xs font-semibold h-9 gap-1.5">
          <Link href="/doctor/profile">
            Edit Profile
            <ChevronRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/70 bg-surface/50">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-base sm:text-lg text-foreground">
              {doctorName}
            </span>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-[11px] font-medium gap-1">
              <ShieldCheck className="size-3 text-primary" />
              Medical Practitioner
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            {qualification} · {specialization}
          </p>
        </div>

        {fee !== undefined ? (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-xl self-start sm:self-center">
            <Wallet className="size-4" />
            <span>₹{fee} / consult</span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface/40 border border-border/60">
          <Building2 className="size-4 text-primary shrink-0" />
          <span className="truncate">
            <strong className="text-foreground font-medium">Clinic:</strong> {hospital}
          </span>
        </div>

        {experience ? (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface/40 border border-border/60">
            <Clock className="size-4 text-primary shrink-0" />
            <span>
              <strong className="text-foreground font-medium">Experience:</strong> {experience} Years
            </span>
          </div>
        ) : null}

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface/40 border border-border/60 sm:col-span-2">
          <Languages className="size-4 text-primary shrink-0" />
          <span className="truncate">
            <strong className="text-foreground font-medium">Languages:</strong>{" "}
            {Array.isArray(languages) ? languages.join(", ") : languages}
          </span>
        </div>
      </div>
    </div>
  );
}
