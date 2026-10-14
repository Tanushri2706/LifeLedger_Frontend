"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  User,
  Video,
  MapPin,
  PhoneCall,
  CalendarX2,
  CalendarClock,
  RotateCcw,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { DoctorPageHeader, DoctorShell } from "@/components/doctor/doctor-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDoctorAppointmentsQuery,
  useAcceptAppointmentMutation,
  DoctorAppointmentDetailDialog,
  DoctorRejectDialog,
  DoctorCancelDialog,
  DoctorCompleteDialog,
  DoctorPrescriptionModal,
  type DoctorAppointmentItemDto,
} from "@/features/doctor";
import { formatTimeSlot, getPatientDisplayName } from "@/lib/utils";

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
        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px] font-semibold gap-1"
      >
        <CheckCircle2 className="size-3" />
        Confirmed
      </Badge>
    );
  }
  if (s === "completed") {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground text-[11px] gap-1">
        <CheckCircle2 className="size-3" />
        Completed
      </Badge>
    );
  }
  if (s === "cancelled") {
    return (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/30 text-[11px] gap-1"
      >
        <XCircle className="size-3" />
        Cancelled
      </Badge>
    );
  }
  if (s === "rejected") {
    return (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/30 text-[11px] gap-1"
      >
        <XCircle className="size-3" />
        Declined
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[11px] font-semibold gap-1"
    >
      <Clock className="size-3" />
      Pending
    </Badge>
  );
}

export default function DoctorAppointmentsPage() {
  const { data: appointments = [], isLoading, isError, error, refetch } = useDoctorAppointmentsQuery();
  const acceptMutation = useAcceptAppointmentMutation();

  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointmentItemDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);
  const [isCancelOpen, setIsCancelOpen] = useState<boolean>(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState<boolean>(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState<boolean>(false);

  // Derive counts from real data
  const counts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter((a) => a.status?.toLowerCase() === "pending").length,
      confirmed: appointments.filter((a) => a.status?.toLowerCase() === "confirmed").length,
      completed: appointments.filter((a) => a.status?.toLowerCase() === "completed").length,
      cancelled: appointments.filter((a) => {
        const s = a.status?.toLowerCase();
        return s === "cancelled" || s === "rejected";
      }).length,
    };
  }, [appointments]);

  // Filter and search
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const s = appt.status?.toLowerCase() || "pending";
      let matchesFilter = true;
      if (filter === "pending") matchesFilter = s === "pending";
      else if (filter === "confirmed") matchesFilter = s === "confirmed";
      else if (filter === "completed") matchesFilter = s === "completed";
      else if (filter === "cancelled") matchesFilter = s === "cancelled" || s === "rejected";

      if (!matchesFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const patient = getPatientDisplayName(appt.patientName || appt.patient, "").toLowerCase();
      const reason = (appt.reason || "").toLowerCase();
      const hospital = (appt.hospital || "").toLowerCase();
      const ref = (appt.referenceNumber || appt.reference || "").toLowerCase();
      return patient.includes(q) || reason.includes(q) || hospital.includes(q) || ref.includes(q);
    });
  }, [appointments, filter, searchQuery]);

  const handleOpenDetail = (appt: DoctorAppointmentItemDto) => {
    setSelectedAppointment(appt);
    setIsDetailOpen(true);
  };

  const handleOpenReject = (e: React.MouseEvent, appt: DoctorAppointmentItemDto) => {
    e.stopPropagation();
    setSelectedAppointment(appt);
    setIsRejectOpen(true);
  };

  const handleOpenCancel = (e: React.MouseEvent, appt: DoctorAppointmentItemDto) => {
    e.stopPropagation();
    setSelectedAppointment(appt);
    setIsCancelOpen(true);
  };

  const handleOpenComplete = (e: React.MouseEvent, appt: DoctorAppointmentItemDto) => {
    e.stopPropagation();
    setSelectedAppointment(appt);
    setIsCompleteOpen(true);
  };

  const handleOpenPrescription = (e: React.MouseEvent, appt: DoctorAppointmentItemDto) => {
    e.stopPropagation();
    setSelectedAppointment(appt);
    setIsPrescriptionOpen(true);
  };

  const handleInlineAccept = async (e: React.MouseEvent, appt: DoctorAppointmentItemDto) => {
    e.stopPropagation();
    if (!appt.id) return;
    try {
      await acceptMutation.mutateAsync(appt.id);
    } catch {
      // Handled in mutation
    }
  };

  return (
    <DoctorShell>
      <div className="space-y-6 pt-2 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <DoctorPageHeader
            title="Appointments Schedule"
            subtitle="Review booking requests, manage confirmed consultations, and write digital prescriptions."
          />
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-9 gap-1.5 self-start sm:self-center shrink-0"
          >
            <Link href="/doctor/availability">
              <CalendarClock className="size-3.5" />
              Manage Slot Availability
            </Link>
          </Button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
            <TabsList className="grid h-10 w-full md:w-auto grid-cols-5 text-xs">
              <TabsTrigger value="all" className="text-xs px-2 sm:px-3">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs px-2 sm:px-3">
                Pending ({counts.pending})
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="text-xs px-2 sm:px-3">
                Confirmed ({counts.confirmed})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs px-2 sm:px-3">
                Completed ({counts.completed})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs px-2 sm:px-3">
                Cancelled ({counts.cancelled})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient or reason..."
              className="h-10 pl-9 text-xs"
            />
          </div>
        </div>

        {/* State Views */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-5 rounded-2xl border border-border/60 bg-card gap-4"
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <Skeleton className="size-11 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-44 rounded-lg" />
                    <Skeleton className="h-3 w-64 rounded-lg" />
                  </div>
                </div>
                <Skeleton className="h-7 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">Failed to load appointments</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {error instanceof Error
                ? error.message
                : "An error occurred while fetching your appointment schedule."}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="text-xs gap-1.5 mt-2">
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 px-4 text-center space-y-3 bg-card/40">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto">
              <CalendarX2 className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                {filter === "pending"
                  ? "No Pending Appointment Requests"
                  : filter === "confirmed"
                    ? "No Confirmed Appointments"
                    : filter === "completed"
                      ? "No Completed Consultations"
                      : filter === "cancelled"
                        ? "No Cancelled or Declined Appointments"
                        : "No Appointments Found"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? `No appointments matching "${searchQuery}".`
                  : filter === "pending"
                    ? "You have no pending consultation requests awaiting approval."
                    : filter === "confirmed"
                      ? "You have no upcoming confirmed appointments at this time."
                      : filter === "completed"
                        ? "Completed patient consultations will appear here."
                        : "No appointments have been scheduled yet. Ensure your slot availability is active."}
              </p>
            </div>
            {!searchQuery && (
              <Button asChild variant="outline" size="sm" className="text-xs font-semibold h-8 mt-2">
                <Link href="/doctor/availability">Manage Slot Availability</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appt) => {
              const consultType = formatConsultationType(appt.consultationType);
              const TypeIcon = consultType.icon;
              const patientName = getPatientDisplayName(appt.patientName || appt.patient, "Patient");
              const patientAge = appt.patientAge || (typeof appt.patient === "object" ? appt.patient?.age : undefined);
              const timeDisplay = formatTimeSlot(appt.timeSlot || appt.time, "Scheduled Slot");
              const apptStatus = appt.status?.toLowerCase() || "pending";
              const isAccepting = acceptMutation.isPending && acceptMutation.variables === appt.id;
              const referenceId = appt.referenceNumber || appt.reference;

              return (
                <div
                  key={appt.id || appt.appointmentId}
                  onClick={() => handleOpenDetail(appt)}
                  className="group flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0 group-hover:scale-105 transition-transform">
                      <User className="size-5" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-base text-foreground truncate">
                          {patientName}
                        </span>
                        {patientAge ? (
                          <span className="text-xs text-muted-foreground">({patientAge} yrs)</span>
                        ) : null}
                        {referenceId && (
                          <span className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border/60">
                            Ref: #{referenceId}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Clock className="size-3.5 text-primary" />
                          {appt.date} · {timeDisplay}
                        </span>
                        <span className="flex items-center gap-1">
                          <TypeIcon className="size-3.5" />
                          {consultType.label}
                        </span>
                        {appt.reason ? (
                          <span className="truncate max-w-xs">· {appt.reason}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Pill */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0 w-full lg:w-auto justify-between lg:justify-end">
                    <StatusBadge status={appt.status} />

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {apptStatus === "pending" && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleOpenReject(e, appt)}
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Decline
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={(e) => handleInlineAccept(e, appt)}
                            disabled={isAccepting}
                            className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {isAccepting ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="size-3" />
                            )}
                            Accept
                          </Button>
                        </>
                      )}

                      {apptStatus === "confirmed" && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleOpenCancel(e, appt)}
                            className="h-8 text-xs text-muted-foreground hover:text-destructive"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={(e) => handleOpenComplete(e, appt)}
                            className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle2 className="size-3" />
                            Complete
                          </Button>
                        </>
                      )}

                      {apptStatus === "completed" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleOpenPrescription(e, appt)}
                          className="h-8 text-xs gap-1"
                        >
                          <FileText className="size-3 text-primary" />
                          Digital Rx
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDetail(appt)}
                        className="size-8 text-muted-foreground hover:text-foreground"
                        aria-label="View appointment details"
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment Detail Dialog */}
      <DoctorAppointmentDetailDialog
        appointmentId={selectedAppointment?.id || null}
        fallbackAppointment={selectedAppointment}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* Reject Modal */}
      <DoctorRejectDialog
        appointmentId={selectedAppointment?.id || null}
        patientName={getPatientDisplayName(selectedAppointment?.patientName || selectedAppointment?.patient, "the patient")}
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
      />

      {/* Cancel Modal */}
      <DoctorCancelDialog
        appointmentId={selectedAppointment?.id || null}
        patientName={getPatientDisplayName(selectedAppointment?.patientName || selectedAppointment?.patient, "the patient")}
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
      />

      {/* Complete Modal */}
      <DoctorCompleteDialog
        appointmentId={selectedAppointment?.id || null}
        patientName={getPatientDisplayName(selectedAppointment?.patientName || selectedAppointment?.patient, "the patient")}
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
      />

      {/* Prescription Modal */}
      <DoctorPrescriptionModal
        appointmentId={selectedAppointment?.id || null}
        patientName={getPatientDisplayName(selectedAppointment?.patientName || selectedAppointment?.patient, "the patient")}
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
      />
    </DoctorShell>
  );
}

