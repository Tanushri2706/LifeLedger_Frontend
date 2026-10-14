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
import { AlertTriangle, Loader2 } from "lucide-react";
import { useCancelAppointmentMutation } from "../doctor-hooks";

interface DoctorCancelDialogProps {
  appointmentId: string | null;
  patientName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DoctorCancelDialog({
  appointmentId,
  patientName,
  isOpen,
  onClose,
  onSuccess,
}: DoctorCancelDialogProps) {
  const [reason, setReason] = useState("");
  const cancelMutation = useCancelAppointmentMutation();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason("");
      onClose();
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) return;

    try {
      await cancelMutation.mutateAsync({
        appointmentId,
        reason: reason.trim() || undefined,
      });
      setReason("");
      onClose();
      onSuccess?.();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleCancel}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
                <AlertTriangle className="size-5" />
              </div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                Cancel Confirmed Appointment
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Are you sure you want to cancel the confirmed appointment with{" "}
              <strong className="text-foreground">{patientName || "the patient"}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason" className="text-xs font-semibold text-foreground">
                Reason for cancellation (optional)
              </Label>
              <Textarea
                id="cancel-reason"
                rows={3}
                placeholder="e.g., Emergency hospital rounds or schedule conflict."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="text-sm resize-none"
                disabled={cancelMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={cancelMutation.isPending}
            >
              Keep Appointment
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={cancelMutation.isPending}
              className="gap-1.5"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
