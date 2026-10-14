"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  Languages,
  MapPin,
  RotateCcw,
  Search,
  Stethoscope,
  AlertCircle,
  Clock,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/widgets";
import { Reveal } from "@/components/landing/reveal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorsQuery, useDoctorSpecializationsQuery } from "@/features/doctors";
import type { PublicDoctorDto } from "@/features/doctors";

const FEE_OPTIONS = [
  { id: "all", label: "Any fee" },
  { id: "500", label: "Under ₹500" },
  { id: "800", label: "Under ₹800" },
  { id: "1200", label: "Under ₹1,200" },
  { id: "2000", label: "Under ₹2,000" },
];

function DoctorCard({ doctor }: { doctor: PublicDoctorDto }) {
  const doctorName =
    doctor.name ||
    (doctor.firstName ? `Dr. ${doctor.firstName} ${doctor.lastName || ""}`.trim() : "Doctor");

  const initials = doctorName
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DR";

  const languages = Array.isArray(doctor.languages) && doctor.languages.length > 0
    ? doctor.languages
    : ["English", "Hindi"];

  return (
    <article className="surface-calm lift flex h-full flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs transition-all hover:border-primary/40 hover:shadow-md">
      <div className="space-y-4">
        {/* Top Header: Avatar & Core Details */}
        <div className="flex items-start gap-4">
          <Avatar className="size-13 shrink-0 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 font-display text-base font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold leading-tight text-foreground truncate">
              {doctorName}
            </h3>
            <p className="text-xs font-medium text-primary mt-0.5">
              {doctor.specialization || "General Medicine"}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {doctor.qualification || "Medical Practitioner"}
              {typeof doctor.experience === "number" && doctor.experience > 0
                ? ` · ${doctor.experience} yrs exp`
                : ""}
            </p>
          </div>
        </div>

        {/* Practice Meta info */}
        <ul className="space-y-2 text-xs text-muted-foreground pt-1">
          {doctor.hospital && (
            <li className="flex items-center gap-2">
              <Building2 className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">{doctor.hospital}</span>
            </li>
          )}
          {(doctor.city || doctor.state || doctor.address) && (
            <li className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">
                {[doctor.city, doctor.state].filter(Boolean).join(", ") || doctor.address}
              </span>
            </li>
          )}
          <li className="flex items-center gap-2">
            <Languages className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{languages.join(", ")}</span>
          </li>
        </ul>

        {/* Pricing / Consult Mode */}
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-surface/50 p-3 text-xs">
          <div>
            <span className="text-[11px] text-muted-foreground block">Consultation fee</span>
            <span className="font-semibold text-foreground text-sm">
              {typeof doctor.consultationFee === "number"
                ? `₹${doctor.consultationFee}`
                : "Transparent fee"}
            </span>
          </div>
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[11px] font-medium gap-1">
            <Clock className="size-3" />
            In-Clinic Visit
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center gap-2 pt-2 border-t border-border/60">
        <Button asChild variant="outline" size="sm" className="flex-1 text-xs font-semibold h-9">
          <Link href={`/doctors/${doctor.id}`}>View Details</Link>
        </Button>
        <Button asChild size="sm" className="flex-1 text-xs font-semibold h-9 gap-1">
          <Link href={`/doctors/${doctor.id}`}>
            <CalendarCheck className="size-3.5" />
            Book Slot
          </Link>
        </Button>
      </div>
    </article>
  );
}

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [fee, setFee] = useState("all");

  const filterParams = useMemo(() => {
    return {
      search: search.trim() || undefined,
      specialization: specialization !== "all" ? specialization : undefined,
      maxFee: fee !== "all" ? Number(fee) : undefined,
    };
  }, [search, specialization, fee]);

  const { data: doctors = [], isLoading, isError, refetch } = useDoctorsQuery(filterParams);
  const { data: specializations = [] } = useDoctorSpecializationsQuery();

  const handleResetFilters = () => {
    setSearch("");
    setSpecialization("all");
    setFee("all");
  };

  const hasActiveFilters = Boolean(search.trim() || specialization !== "all" || fee !== "all");

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-6xl py-6 space-y-6">
        {/* Page Header */}
        <Reveal>
          <header className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-medium text-xs">
              <Stethoscope className="size-4" />
              <span>Care & Consultations</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Find Doctors
            </h1>
            <p className="text-sm text-muted-foreground">
              Search registered clinical practitioners, view upfront consultation fees, and select real available clinic appointment slots.
            </p>
          </header>
        </Reveal>

        {/* Search & Filter Panel */}
        <Reveal delay={0.05}>
          <section
            className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4"
            aria-label="Search and filters"
          >
            {/* Search Input */}
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by doctor name, specialization, or clinic..."
                className="h-11 pl-10 text-sm"
                aria-label="Search doctors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Specialization</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec} className="text-xs">
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Maximum Fee</Label>
                <Select value={fee} onValueChange={setFee}>
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Any fee" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-10 w-full text-xs gap-1.5"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </section>
        </Reveal>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            {isLoading
              ? "Searching doctors..."
              : `${doctors.length} ${doctors.length === 1 ? "doctor" : "doctors"} available`}
          </span>
        </div>

        {/* Doctor Grid / States */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-3xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-base">
                Failed to load doctors
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                We encountered an error connecting to the medical directory. Please check your connection and try again.
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="text-xs gap-1.5">
              <RotateCcw className="size-3.5" />
              Retry Search
            </Button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 shadow-sm text-center">
            <EmptyState
              icon={Stethoscope}
              title="No doctors found"
              body={
                hasActiveFilters
                  ? "No healthcare professionals matched your active search filters. Try resetting the filters or broadening your search criteria."
                  : "There are currently no doctors listed in the directory."
              }
              cta={hasActiveFilters ? "Reset Filters" : undefined}
              onCtaClick={hasActiveFilters ? handleResetFilters : undefined}
            />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doc, idx) => (
              <Reveal key={doc.id} delay={Math.min(idx * 0.04, 0.3)}>
                <DoctorCard doctor={doc} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
