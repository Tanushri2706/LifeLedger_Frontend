"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRejectAppointmentMutation } from "../doctor-hooks";

interface DoctorRejectDialogProps {
  appointmentId: string | null;
  patientName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DoctorRejectDialog({
  appointmentId,
  patientName,
  isOpen,
  onClose,
  onSuccess,
}: DoctorRejectDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const rejectMutation = useRejectAppointmentMutation();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason("");
      setError(null);
      onClose();
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) return;

    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide a reason for declining this appointment request.");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        appointmentId,
        reason: trimmed,
      });
      setReason("");
      setError(null);
      onClose();
      onSuccess?.();
    } catch {
      // Error handled by mutation onError toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleReject}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/10">
                <AlertCircle className="size-5" />
              </div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                Decline Appointment Request
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Decline the appointment requested by{" "}
              <strong className="text-foreground">{patientName || "the patient"}</strong>. A reason is
              required to notify the patient.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason" className="text-xs font-semibold text-foreground">
                Reason for declining <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                rows={3}
                placeholder="e.g., Doctor unavailable due to surgery, please choose an alternative time slot."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                className="text-sm resize-none"
                disabled={rejectMutation.isPending}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={rejectMutation.isPending}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={rejectMutation.isPending}
              className="gap-1.5"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Declining...
                </>
              ) : (
                "Decline Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
