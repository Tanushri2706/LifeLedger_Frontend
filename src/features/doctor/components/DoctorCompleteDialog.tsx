"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCompleteAppointmentMutation } from "../doctor-hooks";

interface DoctorCompleteDialogProps {
  appointmentId: string | null;
  patientName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DoctorCompleteDialog({
  appointmentId,
  patientName,
  isOpen,
  onClose,
  onSuccess,
}: DoctorCompleteDialogProps) {
  const completeMutation = useCompleteAppointmentMutation();

  const handleComplete = async () => {
    if (!appointmentId) return;

    try {
      await completeMutation.mutateAsync(appointmentId);
      onClose();
      onSuccess?.();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="size-5" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Complete Consultation
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Mark consultation with{" "}
            <strong className="text-foreground">{patientName || "the patient"}</strong> as completed.
            You will be able to write and attach a digital prescription afterwards.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={completeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleComplete}
            size="sm"
            disabled={completeMutation.isPending}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {completeMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Completing...
              </>
            ) : (
              "Mark as Completed"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
