"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CalendarCheck,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  RotateCcw,
  X,
  XCircle,
  CheckCircle2,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/widgets";
import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCancelPatientAppointmentMutation,
  useDoctorSlotsQuery,
  usePatientAppointmentsQuery,
  useReschedulePatientAppointmentMutation,
  formatTimeSlot,
} from "@/features/doctors";
import type { PatientAppointmentDto, DoctorSlotDto } from "@/features/doctors";
import { getDoctorDisplayName } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Format a Date object to YYYY-MM-DD string safely in local time
 */
function formatLocalYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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

    days.push({
      dateStr,
      dayOfWeek,
      dayOfMonth,
      month,
      isToday,
      label: isToday ? "Today" : dayOfWeek,
    });
  }

  return days;
}

function StatusBadge({ status }: { status: PatientAppointmentDto["status"] }) {
  switch (status) {
    case "confirmed":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold gap-1">
          <CheckCircle2 className="size-3" />
          Confirmed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-semibold gap-1">
          <Clock className="size-3" />
          Pending Confirmation
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="secondary" className="text-xs font-medium gap-1">
          <CalendarCheck className="size-3 text-primary" />
          Completed
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5 text-xs font-medium gap-1">
          <XCircle className="size-3" />
          Declined
        </Badge>
      );
    case "cancelled":
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground border-border/80 text-xs font-medium gap-1">
          <X className="size-3" />
          Cancelled
        </Badge>
      );
  }
}

function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
}: {
  appointment: PatientAppointmentDto;
  onCancel: (appointment: PatientAppointmentDto) => void;
  onReschedule: (appointment: PatientAppointmentDto) => void;
}) {
  const doctorObj = typeof appointment.doctorId === "object" ? appointment.doctorId : null;
  const doctorName =
    appointment.doctorName ||
    getDoctorDisplayName(doctorObj, "Doctor");

  const specialization = appointment.specialization || doctorObj?.specialization || "Clinical Practice";
  const hospital = appointment.hospital || doctorObj?.hospital || "Clinic Visit";
  const dateStr = appointment.appointmentDate || appointment.date || "Scheduled Date";
  const fee = doctorObj?.consultationFee;
  const referenceId = appointment.referenceNumber || appointment.reference;

  const isActionable = appointment.status === "pending" || appointment.status === "confirmed";
  const consultTypeLabel =
    appointment.consultationType === "video"
      ? "Video Consultation"
      : appointment.consultationType === "audio"
        ? "Audio Consultation"
        : "In-Person Visit";

  return (
    <article className="surface-calm lift rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold text-foreground">{doctorName}</h3>
            <StatusBadge status={appointment.status} />
            {referenceId && (
              <span className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border/60">
                Ref: #{referenceId}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-primary">{specialization}</p>
        </div>

        {fee !== undefined && (
          <div className="text-xs text-muted-foreground self-start sm:self-center">
            Fee: <span className="font-semibold text-foreground">₹{fee}</span>
          </div>
        )}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
        <li className="flex items-center gap-2">
          <CalendarCheck className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span>{dateStr}</span>
        </li>
        <li className="flex items-center gap-2">
          <Clock className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span>{formatTimeSlot(appointment.timeSlot)}</span>
        </li>
        <li className="flex items-center gap-2 sm:col-span-2">
          <Building2 className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{hospital} · {consultTypeLabel}</span>
        </li>
        {appointment.reason && (
          <li className="text-[11px] text-muted-foreground italic sm:col-span-2 pt-0.5">
            Note: {appointment.reason}
          </li>
        )}
      </ul>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
        {isActionable ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onReschedule(appointment)}
              className="flex-1 sm:flex-none text-xs h-8 font-medium"
            >
              Reschedule
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCancel(appointment)}
              className="flex-1 sm:flex-none text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
            >
              Cancel
            </Button>
          </>
        ) : appointment.prescriptionId ? (
          <Button asChild variant="outline" size="sm" className="text-xs h-8 gap-1.5 font-medium">
            <Link href={`/prescriptions/${appointment.prescriptionId}`}>
              <FileText className="size-3.5" />
              View Prescription
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="text-xs h-8 font-medium">
            <Link href="/doctors">Book Again</Link>
          </Button>
        )}
      </div>
    </article>
  );
}

export default function PatientAppointmentsPage() {
  const { data: appointments = [], isLoading, isError, refetch } = usePatientAppointmentsQuery();

  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const [cancelTarget, setCancelTarget] = useState<PatientAppointmentDto | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [rescheduleTarget, setRescheduleTarget] = useState<PatientAppointmentDto | null>(null);
  const futureDays = useMemo(() => getFutureDays(14), []);
  const [rescheduleDate, setRescheduleDate] = useState<string>(futureDays[0].dateStr);
  const [rescheduleSlot, setRescheduleSlot] = useState<DoctorSlotDto | null>(null);

  const dateStripRef = useRef<HTMLDivElement>(null);
  const selectedDateBtnRef = useRef<HTMLButtonElement>(null);

  const scrollDateStrip = (direction: "left" | "right") => {
    if (dateStripRef.current) {
      const scrollAmount = 200;
      dateStripRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Scroll active date button into view within the date strip container (without moving window/page)
  useEffect(() => {
    if (rescheduleTarget && dateStripRef.current && selectedDateBtnRef.current) {
      const container = dateStripRef.current;
      const button = selectedDateBtnRef.current;

      const containerWidth = container.clientWidth;
      const buttonLeft = button.offsetLeft - container.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const targetScroll = buttonLeft - containerWidth / 2 + buttonWidth / 2;

      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    }
  }, [rescheduleDate, rescheduleTarget]);

  const cancelMutation = useCancelPatientAppointmentMutation();
  const rescheduleMutation = useReschedulePatientAppointmentMutation();

  // Extract doctor ID for slots query in reschedule modal
  const rescheduleDoctorId = useMemo(() => {
    if (!rescheduleTarget) return "";
    if (typeof rescheduleTarget.doctorId === "object" && rescheduleTarget.doctorId !== null) {
      return rescheduleTarget.doctorId.id || rescheduleTarget.doctorId._id || "";
    }
    return String(rescheduleTarget.doctorId || "");
  }, [rescheduleTarget]);

  const {
    data: rescheduleSlotsData,
    isLoading: isRescheduleSlotsLoading,
  } = useDoctorSlotsQuery(rescheduleDoctorId, rescheduleDate);

  // Group appointments into upcoming vs history
  const { upcoming, history } = useMemo(() => {
    const up: PatientAppointmentDto[] = [];
    const hist: PatientAppointmentDto[] = [];

    for (const apt of appointments) {
      if (apt.status === "pending" || apt.status === "confirmed") {
        up.push(apt);
      } else {
        hist.push(apt);
      }
    }

    return { upcoming: up, history: hist };
  }, [appointments]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    cancelMutation.mutate(
      {
        appointmentId: cancelTarget.id,
        reason: cancelReason.trim() || "Cancelled by patient",
      },
      {
        onSuccess: () => {
          setCancelTarget(null);
          setCancelReason("");
        },
      }
    );
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget || !rescheduleSlot) {
      toast.error("Please pick a new available time slot.");
      return;
    }

    const timeSlotObj = {
      start: rescheduleSlot.start,
      end: rescheduleSlot.end,
    };

    rescheduleMutation.mutate(
      {
        appointmentId: rescheduleTarget.id,
        date: rescheduleDate,
        timeSlot: timeSlotObj,
      },
      {
        onSuccess: () => {
          setRescheduleTarget(null);
          setRescheduleSlot(null);
        },
      }
    );
  };

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-4xl py-6 space-y-6">
        {/* Header */}
        <Reveal>
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                My Appointments
              </h1>
              <p className="text-sm text-muted-foreground">
                Track your active clinic consultations, view prescription history, or manage upcoming visits.
              </p>
            </div>
            <Button asChild size="sm" className="h-10 text-xs font-semibold gap-1.5 shrink-0 self-start sm:self-center">
              <Link href="/doctors">
                <CalendarPlus className="size-4" />
                Book Consultation
              </Link>
            </Button>
          </header>
        </Reveal>

        {/* Content Tabs */}
        <Reveal delay={0.05}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "history")}>
            <TabsList className="h-11 w-full sm:w-auto p-1 bg-surface border border-border/70 rounded-2xl">
              <TabsTrigger value="upcoming" className="flex-1 sm:flex-none text-xs rounded-xl px-4 py-2 font-medium">
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 sm:flex-none text-xs rounded-xl px-4 py-2 font-medium">
                History ({history.length})
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Tab */}
            <TabsContent value="upcoming" className="mt-5 space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-36 w-full rounded-3xl" />
                  <Skeleton className="h-36 w-full rounded-3xl" />
                </div>
              ) : isError ? (
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
                  <AlertCircle className="size-8 text-destructive mx-auto" />
                  <p className="text-xs text-muted-foreground">Failed to load appointments from server.</p>
                  <Button onClick={() => refetch()} variant="outline" size="sm" className="text-xs gap-1.5">
                    <RotateCcw className="size-3.5" />
                    Retry
                  </Button>
                </div>
              ) : upcoming.length === 0 ? (
                <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-sm">
                  <EmptyState
                    icon={CalendarCheck}
                    title="No upcoming appointments"
                    body="You do not have any scheduled consultations at the moment. Explore our directory to find a doctor and book a slot."
                    cta="Find a Doctor"
                    ctaHref="/doctors"
                  />
                </div>
              ) : (
                upcoming.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onCancel={(target) => setCancelTarget(target)}
                    onReschedule={(target) => {
                      setRescheduleTarget(target);
                      setRescheduleSlot(null);
                    }}
                  />
                ))
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-5 space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-36 w-full rounded-3xl" />
                </div>
              ) : history.length === 0 ? (
                <div className="rounded-3xl border border-border/80 bg-card p-8 text-center shadow-sm">
                  <EmptyState
                    icon={Clock}
                    title="No past appointments"
                    body="Completed or past appointment history will be documented here."
                  />
                </div>
              ) : (
                history.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onCancel={(target) => setCancelTarget(target)}
                    onReschedule={(target) => {
                      setRescheduleTarget(target);
                      setRescheduleSlot(null);
                    }}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </Reveal>

        {/* Cancellation Confirmation Dialog */}
        <Dialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)}>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto min-w-0 p-5 sm:p-6 rounded-2xl sm:rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
                <XCircle className="size-5 text-destructive" />
                Cancel Appointment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to cancel this appointment? The reserved clinic slot will be released back to the schedule.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="cancel-reason" className="text-xs font-semibold">
                  Reason for Cancellation (Optional)
                </Label>
                <Textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Schedule conflict, feeling better..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCancelTarget(null)}
                disabled={cancelMutation.isPending}
                className="text-xs"
              >
                Keep Appointment
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isPending}
                className="text-xs gap-1.5 font-semibold"
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog with Real Slots */}
        <Dialog
          open={Boolean(rescheduleTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setRescheduleTarget(null);
              setRescheduleSlot(null);
            }
          }}
        >
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto min-w-0 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-lg">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                <RotateCcw className="size-5 text-primary shrink-0" />
                <span>Reschedule Appointment</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Choose a new consultation date and available time slot with your doctor.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-1 min-w-0 w-full">
              {/* Doctor / Current appointment brief */}
              {rescheduleTarget && (
                <div className="rounded-xl border border-border/60 bg-surface/50 p-3 text-xs space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground truncate">
                      {rescheduleTarget.doctorName ||
                        getDoctorDisplayName(
                          typeof rescheduleTarget.doctorId === "object"
                            ? rescheduleTarget.doctorId
                            : null,
                          "Doctor"
                        )}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono bg-muted/40 px-1.5 py-0.5 rounded border border-border/50 shrink-0">
                      Current: {rescheduleTarget.appointmentDate || rescheduleTarget.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {rescheduleTarget.hospital ||
                      (typeof rescheduleTarget.doctorId === "object"
                        ? rescheduleTarget.doctorId?.hospital
                        : "") ||
                      "Clinic Consultation"}{" "}
                    · Slot: {formatTimeSlot(rescheduleTarget.timeSlot)}
                  </p>
                </div>
              )}

              {/* Date strip section */}
              <div className="space-y-2 min-w-0 w-full">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Select New Date
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => scrollDateStrip("left")}
                      aria-label="Previous dates"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => scrollDateStrip("right")}
                      aria-label="Next dates"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Horizontal Scroll Region with min-w-0 isolation */}
                <div className="relative w-full min-w-0">
                  <div
                    ref={dateStripRef}
                    role="region"
                    aria-label="Date selection strip"
                    tabIndex={0}
                    className="flex gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar scroll-smooth min-w-0 w-full max-w-full focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                  >
                    {futureDays.map((d) => {
                      const isSelected = rescheduleDate === d.dateStr;
                      return (
                        <button
                          key={d.dateStr}
                          ref={isSelected ? selectedDateBtnRef : null}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setRescheduleDate(d.dateStr);
                            setRescheduleSlot(null);
                          }}
                          className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] sm:min-w-[68px] p-2.5 rounded-xl border text-xs transition-all cursor-pointer select-none ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                              : "border-border/70 bg-surface/50 text-foreground hover:border-primary/40 hover:bg-surface"
                          }`}
                        >
                          <span className="text-[10px] tracking-tight">{d.label}</span>
                          <span className="text-base font-bold mt-0.5">{d.dayOfMonth}</span>
                          <span className="text-[9px] opacity-75">{d.month}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Slot picker section */}
              <div className="space-y-2 pt-2 border-t border-border/60 min-w-0 w-full">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">
                    Select Available Slot
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    {rescheduleDate}
                  </span>
                </div>

                {isRescheduleSlotsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 min-w-0 w-full">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 rounded-xl" />
                    ))}
                  </div>
                ) : !rescheduleSlotsData?.slots || rescheduleSlotsData.slots.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 bg-surface/30 p-4 text-center">
                    <p className="text-xs text-muted-foreground italic">
                      No available slots on {rescheduleDate}. Please choose another date.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 min-w-0 w-full">
                    {rescheduleSlotsData.slots.map((s) => {
                      const isSelected = rescheduleSlot?.start === s.start;
                      const isAvailable = Boolean(s.available ?? s.isAvailable ?? false);
                      const formatted = formatTimeSlot(s);

                      return (
                        <button
                          key={s.start}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setRescheduleSlot(s)}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all min-w-0 text-center truncate ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                              : isAvailable
                              ? "border-border/80 bg-card hover:border-primary/40 text-foreground cursor-pointer"
                              : "border-border/40 bg-muted/20 text-muted-foreground/40 cursor-not-allowed line-through"
                          }`}
                        >
                          <span className="truncate block">{formatted}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setRescheduleTarget(null);
                  setRescheduleSlot(null);
                }}
                disabled={rescheduleMutation.isPending}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmReschedule}
                disabled={!rescheduleSlot || rescheduleMutation.isPending}
                className="text-xs h-9 gap-1.5 font-semibold"
              >
                {rescheduleMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  "Confirm New Slot"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}
