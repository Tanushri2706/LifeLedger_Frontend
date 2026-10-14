"use client";

import { use, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Languages,
  Loader2,
  Lock,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Wallet,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Reveal } from "@/components/landing/reveal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  useBookAppointmentMutation,
  useDoctorPublicDetailQuery,
  useDoctorSlotsQuery,
  formatTimeSlot,
} from "@/features/doctors";
import type { DoctorSlotDto } from "@/features/doctors";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ doctorId: string }>;
}

/**
 * Format a Date object to YYYY-MM-DD string safely in local/IST time without timezone shift
 */
function formatLocalYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Generate 14 selectable future days starting from today
 */
function getFutureDays(count = 14) {
  const days = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dateStr = formatLocalYMD(d);
    const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayOfMonth = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const isToday = i === 0;
    const isTomorrow = i === 1;

    days.push({
      dateStr,
      dayOfWeek,
      dayOfMonth,
      month,
      isToday,
      isTomorrow,
      label: isToday ? "Today" : isTomorrow ? "Tomorrow" : dayOfWeek,
    });
  }

  return days;
}

export default function DoctorBookingPage({ params }: PageProps) {
  const { doctorId } = use(params);
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();

  const futureDays = useMemo(() => getFutureDays(14), []);
  const [selectedDate, setSelectedDate] = useState<string>(futureDays[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState<DoctorSlotDto | null>(null);
  const [reason, setReason] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<{
    doctorName: string;
    specialization: string;
    hospital: string;
    date: string;
    timeSlot: string;
    fee: number;
  } | null>(null);

  // Queries
  const {
    data: doctor,
    isLoading: isDoctorLoading,
    isError: isDoctorError,
    refetch: refetchDoctor,
  } = useDoctorPublicDetailQuery(doctorId);

  const {
    data: slotsData,
    isLoading: isSlotsLoading,
    isError: isSlotsError,
    refetch: refetchSlots,
  } = useDoctorSlotsQuery(doctorId, selectedDate);

  const bookMutation = useBookAppointmentMutation();

  const doctorName =
    doctor?.name ||
    (doctor?.firstName ? `Dr. ${doctor.firstName} ${doctor.lastName || ""}`.trim() : "Doctor");

  const initials = doctorName
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DR";

  const languages = Array.isArray(doctor?.languages) && doctor.languages.length > 0
    ? doctor.languages
    : ["English", "Hindi"];

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
  };

  // Initial Date UX: If today has no configured availability, select the first upcoming available weekday
  const [hasAutoSelectedDate, setHasAutoSelectedDate] = useState(false);
  useEffect(() => {
    if (!doctor?.availability || !Array.isArray(doctor.availability) || doctor.availability.length === 0) return;
    if (hasAutoSelectedDate) return;

    const activeDaysSet = new Set(
      doctor.availability
        .filter((d) => d && ((d.slots && d.slots.length > 0) || d.isAvailable))
        .map((d) => (d.day || "").toLowerCase().trim())
        .filter(Boolean)
    );

    if (activeDaysSet.size === 0) return;

    const today = new Date();
    const todayDayName = today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

    if (!activeDaysSet.has(todayDayName)) {
      const firstAvailableDay = futureDays.find((d) => {
        const dateObj = new Date(`${d.dateStr}T00:00:00Z`);
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }).toLowerCase();
        return activeDaysSet.has(dayName);
      });

      if (firstAvailableDay) {
        setSelectedDate(firstAvailableDay.dateStr);
      }
    }
    setHasAutoSelectedDate(true);
  }, [doctor?.availability, futureDays, hasAutoSelectedDate]);

  const handleSlotSelect = (slot: DoctorSlotDto) => {
    const isAvailable = Boolean(slot.available ?? slot.isAvailable ?? false);
    if (!isAvailable) return;
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info("Please sign in to complete your appointment booking.");
      router.push("/signin");
      return;
    }

    if (role === "doctor") {
      toast.error("Doctor accounts cannot book patient appointments. Please use a patient account.");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please choose an available appointment time slot.");
      return;
    }

    const slotFormatted = selectedSlot.formatted || `${selectedSlot.start} - ${selectedSlot.end}`;
    const timeSlotObj = {
      start: selectedSlot.start,
      end: selectedSlot.end,
    };

    bookMutation.mutate(
      {
        doctorId,
        appointmentDate: selectedDate,
        date: selectedDate,
        timeSlot: timeSlotObj,
        consultationType: "in_person",
        hospital: doctor?.hospital,
        reason: reason.trim() || "Clinical consultation",
      },
      {
        onSuccess: () => {
          setBookedDetails({
            doctorName,
            specialization: doctor?.specialization || "General Medicine",
            hospital: doctor?.hospital || "Clinic Visit",
            date: selectedDate,
            timeSlot: slotFormatted,
            fee: doctor?.consultationFee || 0,
          });
          setIsSuccess(true);
        },
      }
    );
  };

  // Success Confirmation Screen
  if (isSuccess && bookedDetails) {
    return (
      <DashboardShell>
        <div className="mx-auto w-full max-w-xl py-10">
          <Reveal>
            <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm text-center space-y-6">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-8" aria-hidden="true" />
              </div>

              <div className="space-y-1">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Appointment Request Placed
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your appointment booking has been scheduled and transmitted to the clinic.
                </p>
              </div>

              <dl className="space-y-3 rounded-2xl border border-border/70 bg-surface/50 p-5 text-left text-xs sm:text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Doctor</dt>
                  <dd className="font-semibold text-foreground text-right">{bookedDetails.doctorName}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Specialization</dt>
                  <dd className="font-medium text-foreground text-right">{bookedDetails.specialization}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Date & Time</dt>
                  <dd className="font-semibold text-primary text-right">
                    {bookedDetails.date} · {formatTimeSlot(bookedDetails.timeSlot)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Hospital / Clinic</dt>
                  <dd className="font-medium text-foreground text-right">{bookedDetails.hospital}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-3">
                  <dt className="text-muted-foreground">Consultation Fee</dt>
                  <dd className="font-semibold text-foreground text-right">
                    ₹{bookedDetails.fee} (Pay at clinic)
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild className="flex-1 font-semibold text-xs h-10">
                  <Link href="/appointments">View My Appointments</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 text-xs h-10">
                  <Link href="/doctors">Find More Doctors</Link>
                </Button>
              </div>
            </section>
          </Reveal>
        </div>
      </DashboardShell>
    );
  }

  // Doctor Error / Not Found State
  if (isDoctorError) {
    return (
      <DashboardShell>
        <div className="mx-auto w-full max-w-4xl py-12 text-center space-y-4">
          <AlertCircle className="size-10 text-destructive mx-auto" />
          <h2 className="font-display text-xl font-bold">Doctor Not Found</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            The requested doctor profile could not be loaded or is no longer available.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href="/doctors">All Doctors</Link>
            </Button>
            <Button onClick={() => refetchDoctor()} size="sm" className="text-xs gap-1.5">
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-6xl py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-xs -ml-2 gap-1 text-muted-foreground hover:text-foreground">
            <Link href="/doctors">
              <ArrowLeft className="size-4" />
              Back to Doctors
            </Link>
          </Button>
        </div>

        {isDoctorLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 rounded-3xl lg:col-span-1" />
            <Skeleton className="h-96 rounded-3xl lg:col-span-2" />
          </div>
        ) : doctor ? (
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* Left Column: Doctor Profile & Clinical Details */}
            <Reveal className="space-y-6 lg:col-span-1">
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-5">
                {/* Doctor Avatar & Identity */}
                <div className="space-y-4">
                  <Avatar className="size-20 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 font-display text-2xl font-bold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
                      {doctorName}
                    </h1>
                    <p className="text-xs font-semibold text-primary">
                      {doctor.specialization}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.qualification}
                      {typeof doctor.experience === "number" && doctor.experience > 0
                        ? ` · ${doctor.experience} yrs experience`
                        : ""}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary text-[11px] font-medium gap-1"
                  >
                    <ShieldCheck className="size-3 text-primary" />
                    Medical Practitioner
                  </Badge>
                </div>

                {/* Practice details list */}
                <div className="border-t border-border/60 pt-4 space-y-3 text-xs text-muted-foreground">
                  {doctor.hospital && (
                    <div className="flex items-start gap-2.5">
                      <Building2 className="size-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground block">Hospital / Clinic</span>
                        <span>{doctor.hospital}</span>
                      </div>
                    </div>
                  )}

                  {(doctor.address || doctor.city || doctor.state) && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground block">Practice Address</span>
                        <span>{[doctor.address, doctor.city, doctor.state].filter(Boolean).join(", ")}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5">
                    <Languages className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground block">Languages Spoken</span>
                      <span>{languages.join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Wallet className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground block">Consultation Fee</span>
                      <span className="font-semibold text-foreground text-sm">
                        {typeof doctor.consultationFee === "number"
                          ? `₹${doctor.consultationFee}`
                          : "Pay at clinic"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient Confidentiality Banner */}
                <div className="rounded-2xl border border-border/60 bg-surface/50 p-4 space-y-1 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <Lock className="size-3.5 text-primary" />
                    Private & Confidential
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Booking an appointment schedules your consultation. Your medical history and report vault remain private unless you explicitly share them.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Right 2 Columns: Date Picker, Real Slots & Booking Form */}
            <Reveal delay={0.06} className="space-y-6 lg:col-span-2">
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
                {/* Step 1: Date Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                      <CalendarCheck className="size-4 text-primary" />
                      1. Select Consultation Date
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      Asia/Kolkata (IST)
                    </span>
                  </div>

                  {/* Horizontal Scrollable Date Strip */}
                  <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
                    {futureDays.map((d) => {
                      const isSelected = selectedDate === d.dateStr;
                      return (
                        <button
                          key={d.dateStr}
                          type="button"
                          onClick={() => handleDateChange(d.dateStr)}
                          className={`flex flex-col items-center justify-center min-w-[72px] sm:min-w-[80px] p-3 rounded-2xl border transition-all ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border/70 bg-surface/50 hover:border-primary/40 hover:bg-surface text-foreground"
                          }`}
                        >
                          <span className={`text-[11px] font-medium ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                            {d.label}
                          </span>
                          <span className="text-lg font-bold mt-0.5">
                            {d.dayOfMonth}
                          </span>
                          <span className={`text-[10px] uppercase font-semibold ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {d.month}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Real Slots from Backend */}
                <div className="space-y-3 pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                      <Clock className="size-4 text-primary" />
                      2. Choose Available Time Slot
                    </h2>
                    {slotsData && (
                      <span className="text-xs text-muted-foreground">
                        {slotsData.availableSlotsCount} of {slotsData.totalSlots} slots available
                      </span>
                    )}
                  </div>

                  {isSlotsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-xl" />
                      ))}
                    </div>
                  ) : isSlotsError ? (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-center space-y-2">
                      <p className="text-xs text-destructive font-medium">
                        Unable to load available slots for {selectedDate}.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => refetchSlots()}
                        className="text-xs gap-1.5 h-8"
                      >
                        <RotateCcw className="size-3" />
                        Retry Slots
                      </Button>
                    </div>
                  ) : !slotsData?.slots || slotsData.slots.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-surface/40 p-6 text-center space-y-1">
                      <Clock className="size-6 text-muted-foreground mx-auto" />
                      <p className="text-xs font-semibold text-foreground">
                        No appointment slots available on {selectedDate}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        The doctor is not taking consultations or all slots are fully booked on this date. Please pick another date above.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                      {slotsData.slots.map((s) => {
                        const isSelected = selectedSlot?.start === s.start;
                        const isAvailable = Boolean(s.available ?? s.isAvailable ?? false);
                        const formattedLabel = s.formatted || `${s.start} - ${s.end}`;

                        return (
                          <button
                            key={s.start}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleSlotSelect(s)}
                            className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : isAvailable
                                ? "border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 text-foreground cursor-pointer"
                                : "border-border/40 bg-muted/30 text-muted-foreground/50 cursor-not-allowed line-through"
                            }`}
                          >
                            <span>{formattedLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Step 3: Booking Confirmation Form */}
                {selectedSlot && (
                  <form onSubmit={handleBookAppointment} className="space-y-4 pt-4 border-t border-border/60">
                    <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                      <Stethoscope className="size-4 text-primary" />
                      3. Confirm Consultation
                    </h2>

                    {/* Summary Box */}
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Doctor:</span>
                        <span className="font-semibold text-foreground">{doctorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date & Slot:</span>
                        <span className="font-semibold text-primary">
                          {selectedDate} · {selectedSlot.formatted || `${selectedSlot.start} - ${selectedSlot.end}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mode:</span>
                        <span className="font-semibold text-foreground">In-Person Consultation</span>
                      </div>
                      <div className="flex justify-between border-t border-primary/10 pt-2">
                        <span className="text-muted-foreground">Payable at clinic:</span>
                        <span className="font-bold text-foreground text-sm">
                          {typeof doctor.consultationFee === "number" ? `₹${doctor.consultationFee}` : "Pay at clinic"}
                        </span>
                      </div>
                    </div>

                    {/* Optional Reason / Notes */}
                    <div className="space-y-1.5">
                      <Label htmlFor="reason" className="text-xs font-semibold text-foreground">
                        Reason for Visit / Symptoms (Optional)
                      </Label>
                      <Textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Briefly describe your symptoms or reason for visit (e.g. routine checkup, follow-up, knee pain)..."
                        rows={3}
                        className="text-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={bookMutation.isPending}
                      className="w-full h-11 text-xs font-semibold gap-2"
                    >
                      {bookMutation.isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Submitting Booking Request...
                        </>
                      ) : (
                        <>
                          <Check className="size-4" />
                          Confirm Appointment Booking
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
