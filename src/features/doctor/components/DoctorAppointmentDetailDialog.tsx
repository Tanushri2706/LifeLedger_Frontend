"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarHeart,
  Clock,
  User,
  Video,
  MapPin,
  PhoneCall,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  Lock,
} from "lucide-react";
import {
  useDoctorAppointmentDetailQuery,
  useAcceptAppointmentMutation,
} from "../doctor-hooks";
import { DoctorRejectDialog } from "./DoctorRejectDialog";
import { DoctorCancelDialog } from "./DoctorCancelDialog";
import { DoctorCompleteDialog } from "./DoctorCompleteDialog";
import { DoctorPrescriptionModal } from "./DoctorPrescriptionModal";
import type { DoctorAppointmentItemDto } from "../doctor-types";
import { formatTimeSlot, getPatientDisplayName } from "@/lib/utils";

interface DoctorAppointmentDetailDialogProps {
  appointmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  fallbackAppointment?: DoctorAppointmentItemDto | null;
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

function StatusPill({ status }: { status: string }) {
  const s = status?.toLowerCase() || "pending";
  if (s === "confirmed") {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold gap-1"
      >
        <CheckCircle2 className="size-3" />
        Confirmed
      </Badge>
    );
  }
  if (s === "completed") {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground text-xs gap-1">
        <CheckCircle2 className="size-3" />
        Completed
      </Badge>
    );
  }
  if (s === "cancelled") {
    return (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/30 text-xs gap-1"
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
        className="bg-destructive/10 text-destructive border-destructive/30 text-xs gap-1"
      >
        <XCircle className="size-3" />
        Declined
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-semibold gap-1"
    >
      <Clock className="size-3" />
      Pending Approval
    </Badge>
  );
}

export function DoctorAppointmentDetailDialog({
  appointmentId,
  isOpen,
  onClose,
  fallbackAppointment,
}: DoctorAppointmentDetailDialogProps) {
  const { data: fetchedAppointment, isLoading } = useDoctorAppointmentDetailQuery(appointmentId);
  const acceptMutation = useAcceptAppointmentMutation();

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);

  const appointment = fetchedAppointment || fallbackAppointment;
  const status = appointment?.status?.toLowerCase() || "pending";
  const consultType = formatConsultationType(appointment?.consultationType || "in_person");
  const TypeIcon = consultType.icon;

  const handleAccept = async () => {
    if (!appointment?.id) return;
    try {
      await acceptMutation.mutateAsync(appointment.id);
    } catch {
      // Handled in mutation
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarHeart className="size-5" />
                </div>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  Appointment Overview
                </DialogTitle>
              </div>
              {appointment?.status ? <StatusPill status={appointment.status} /> : null}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Reference: {appointment?.referenceNumber || appointment?.reference ? `#${appointment.referenceNumber || appointment.reference}` : appointment?.id || appointmentId}
            </DialogDescription>
          </DialogHeader>

          {isLoading && !appointment ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : appointment ? (
            <div className="space-y-5 py-3">
              {/* Patient Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-base">
                    <User className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-base text-foreground">
                      {getPatientDisplayName(appointment.patientName || appointment.patient, "Patient")}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      {appointment.patientAge || (typeof appointment.patient === "object" ? appointment.patient?.age : undefined) ? (
                        <span>{appointment.patientAge || (typeof appointment.patient === "object" ? appointment.patient?.age : undefined)} years</span>
                      ) : null}
                      {appointment.patientGender || (typeof appointment.patient === "object" ? appointment.patient?.gender : undefined) ? (
                        <span>· {appointment.patientGender || (typeof appointment.patient === "object" ? appointment.patient?.gender : undefined)}</span>
                      ) : null}
                      {appointment.patientBloodGroup || (typeof appointment.patient === "object" ? appointment.patient?.bloodGroup : undefined) ? (
                        <span>· Blood Group {appointment.patientBloodGroup || (typeof appointment.patient === "object" ? appointment.patient?.bloodGroup : undefined)}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${consultType.color} self-start sm:self-center`}>
                  <TypeIcon className="size-4" />
                  <span>{consultType.label}</span>
                </div>
              </div>

              {/* Consultation Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    Scheduled Date & Time
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {appointment.date} · {formatTimeSlot(appointment.timeSlot || appointment.time, "Scheduled Slot")}
                  </p>
                </div>

                {appointment.hospital ? (
                  <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-primary" />
                      Hospital / Clinic
                    </span>
                    <p className="font-semibold text-foreground text-sm truncate">
                      {appointment.hospital}
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-primary" />
                      Consultation Channel
                    </span>
                    <p className="font-semibold text-foreground text-sm">
                      {consultType.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Reason / Notes */}
              {appointment.reason && (
                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Reason for Consultation / Symptoms
                  </p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {appointment.reason}
                  </p>
                </div>
              )}

              {/* Rejection / Cancellation explanation if present */}
              {appointment.rejectionReason && (
                <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-1">
                  <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                    <AlertCircle className="size-3.5" />
                    Reason for Declining Request
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">
                    {appointment.rejectionReason}
                  </p>
                </div>
              )}

              {appointment.cancellationReason && (
                <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-1">
                  <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                    <AlertCircle className="size-3.5" />
                    Reason for Cancellation
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">
                    {appointment.cancellationReason}
                  </p>
                </div>
              )}

              {/* Patient Privacy Protection Notice */}
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
                <Lock className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Protected:</strong> Patient medical records, lab reports, and timeline are private to the patient and accessible only when explicitly shared through LifeLedger Medical Share.
                </span>
              </div>

              {/* Action State Machine Controls */}
              <div className="border-t border-border pt-4 flex flex-wrap items-center justify-end gap-2.5">
                {status === "pending" && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRejectOpen(true)}
                      className="text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      Decline Request
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAccept}
                      disabled={acceptMutation.isPending}
                      className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {acceptMutation.isPending ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          Accept Appointment
                        </>
                      )}
                    </Button>
                  </>
                )}

                {status === "confirmed" && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCancelOpen(true)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Cancel Appointment
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setIsCompleteOpen(true)}
                      className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Mark as Completed
                    </Button>
                  </>
                )}

                {status === "completed" && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setIsPrescriptionOpen(true)}
                    className="text-xs gap-1.5"
                  >
                    <FileText className="size-3.5" />
                    Digital Prescription
                  </Button>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Appointment details could not be loaded.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <DoctorRejectDialog
        appointmentId={appointment?.id || null}
        patientName={getPatientDisplayName(appointment?.patientName || appointment?.patient, "the patient")}
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
      />

      {/* Cancel Modal */}
      <DoctorCancelDialog
        appointmentId={appointment?.id || null}
        patientName={getPatientDisplayName(appointment?.patientName || appointment?.patient, "the patient")}
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
      />

      {/* Complete Modal */}
      <DoctorCompleteDialog
        appointmentId={appointment?.id || null}
        patientName={getPatientDisplayName(appointment?.patientName || appointment?.patient, "the patient")}
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
      />

      {/* Prescription Modal */}
      <DoctorPrescriptionModal
        appointmentId={appointment?.id || null}
        patientName={getPatientDisplayName(appointment?.patientName || appointment?.patient, "the patient")}
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
      />
    </>
  );
}
