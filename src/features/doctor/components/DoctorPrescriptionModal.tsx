"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  useDoctorPrescriptionQuery,
  useCreatePrescriptionMutation,
} from "../doctor-hooks";
import type { PrescriptionMedicineDto } from "../doctor-types";

interface DoctorPrescriptionModalProps {
  appointmentId: string | null;
  patientName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const emptyMedicine: PrescriptionMedicineDto = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export function DoctorPrescriptionModal({
  appointmentId,
  patientName,
  isOpen,
  onClose,
  onSuccess,
}: DoctorPrescriptionModalProps) {
  const { data: existingPrescription, isLoading, refetch } = useDoctorPrescriptionQuery(appointmentId);
  const createMutation = useCreatePrescriptionMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [medicines, setMedicines] = useState<PrescriptionMedicineDto[]>([{ ...emptyMedicine }]);
  const [instructions, setInstructions] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form from existing prescription when available
  useEffect(() => {
    if (existingPrescription) {
      if (existingPrescription.medicines && existingPrescription.medicines.length > 0) {
        setMedicines(existingPrescription.medicines);
      } else {
        setMedicines([{ ...emptyMedicine }]);
      }
      setInstructions(existingPrescription.instructions || "");
      setNextVisit(existingPrescription.nextVisit ? existingPrescription.nextVisit.split("T")[0] : "");
      setIsEditing(false);
    } else {
      setMedicines([{ ...emptyMedicine }]);
      setInstructions("");
      setNextVisit("");
      setIsEditing(true);
    }
  }, [existingPrescription, isOpen]);

  const handleAddMedicine = () => {
    setMedicines((prev) => [...prev, { ...emptyMedicine }]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicines.length <= 1) return;
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (
    index: number,
    field: keyof PrescriptionMedicineDto,
    value: string
  ) => {
    setMedicines((prev) =>
      prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    );
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) return;

    // Validation
    const validMeds = medicines.filter((m) => m.name.trim().length > 0);
    if (validMeds.length === 0) {
      setFormError("Please add at least one medication with a valid name.");
      return;
    }

    // Ensure all entered medications have at least name and dosage
    for (let i = 0; i < validMeds.length; i++) {
      const med = validMeds[i];
      if (!med.dosage.trim()) {
        setFormError(`Please specify dosage for "${med.name}" (e.g. 500mg or 1 tablet).`);
        return;
      }
      if (!med.frequency.trim()) {
        setFormError(`Please specify frequency for "${med.name}" (e.g. Once daily, Twice daily).`);
        return;
      }
      if (!med.duration.trim()) {
        setFormError(`Please specify duration for "${med.name}" (e.g. 5 days, 1 month).`);
        return;
      }
    }

    try {
      await createMutation.mutateAsync({
        appointmentId,
        dto: {
          medicines: validMeds,
          instructions: instructions.trim() || undefined,
          nextVisit: nextVisit.trim() || undefined,
        },
      });
      setIsEditing(false);
      refetch();
      onSuccess?.();
    } catch {
      // Handled by toast in mutation
    }
  };

  const handleClose = () => {
    setFormError(null);
    onClose();
  };

  const hasExisting = Boolean(existingPrescription && existingPrescription.medicines?.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {hasExisting && !isEditing ? "Consultation Prescription" : "Write Digital Prescription"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Patient: <strong className="text-foreground">{patientName || "Patient"}</strong>
                </DialogDescription>
              </div>
            </div>

            {hasExisting && !isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs h-8"
              >
                Edit Prescription
              </Button>
            ) : null}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : hasExisting && !isEditing && existingPrescription ? (
          /* View Mode */
          <div className="space-y-6 py-4">
            {/* Prescription Header / Stamp */}
            <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold gap-1">
                    <CheckCircle2 className="size-3" />
                    Doctor Issued
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Rx ID: {existingPrescription.id || appointmentId}
                  </span>
                </div>
                {existingPrescription.createdAt && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(existingPrescription.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              {/* Medicines List Table */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prescribed Medications ({existingPrescription.medicines.length})
                </p>
                <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card overflow-hidden">
                  {existingPrescription.medicines.map((med, idx) => (
                    <div key={idx} className="p-3.5 space-y-1 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-2 text-xs">
                      <div className="sm:col-span-2 font-semibold text-foreground text-sm">
                        {med.name}
                        {med.instructions && (
                          <p className="text-xs font-normal text-muted-foreground mt-0.5">
                            Note: {med.instructions}
                          </p>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        <span className="text-foreground font-medium">{med.dosage}</span> · {med.frequency}
                      </div>
                      <div className="text-muted-foreground sm:text-right font-medium">
                        Duration: {med.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice / Instructions */}
              {existingPrescription.instructions && (
                <div className="space-y-1 rounded-xl bg-card p-3.5 border border-border/70">
                  <p className="text-xs font-semibold text-muted-foreground">General Advice & Instructions</p>
                  <p className="text-xs sm:text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {existingPrescription.instructions}
                  </p>
                </div>
              )}

              {/* Next Visit */}
              {existingPrescription.nextVisit && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="size-4 text-primary" />
                  <span>
                    Follow-up Consultation:{" "}
                    <strong className="text-foreground">
                      {new Date(existingPrescription.nextVisit).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>
                Manual doctor prescription saved under medical privacy standards. Accessible to the patient in their LifeLedger portal.
              </span>
            </div>
          </div>
        ) : (
          /* Form / Authoring Mode */
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            {formError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Medicines Authoring */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Prescribed Medications
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddMedicine}
                  className="text-xs h-7 gap-1 text-primary hover:text-primary"
                >
                  <Plus className="size-3.5" />
                  Add Medicine
                </Button>
              </div>

              <div className="space-y-3">
                {medicines.map((med, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-border/80 bg-surface/40 p-4 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Medicine #{index + 1}
                      </span>
                      {medicines.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMedicine(index)}
                          className="text-destructive hover:text-destructive h-6 px-2 text-xs gap-1"
                        >
                          <Trash2 className="size-3" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Medicine Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="e.g., Paracetamol"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Dosage <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="e.g., 500mg, 1 tablet"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Frequency <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="e.g., Twice daily after food"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Duration <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="e.g., 5 days"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Special Instructions (optional)
                        </Label>
                        <Input
                          placeholder="e.g., Take with a full glass of water. Avoid alcohol."
                          value={med.instructions || ""}
                          onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Instructions & Follow-up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="general-instructions" className="text-xs font-semibold text-foreground">
                  Dietary & Lifestyle Advice / General Notes
                </Label>
                <Textarea
                  id="general-instructions"
                  rows={3}
                  placeholder="e.g., Maintain hydration, avoid heavy physical exertion for 3 days."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="next-visit" className="text-xs font-semibold text-foreground">
                  Next Follow-up Visit Date (optional)
                </Label>
                <Input
                  id="next-visit"
                  type="date"
                  value={nextVisit}
                  onChange={(e) => setNextVisit(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Safety Notice */}
            <div className="rounded-xl border border-border/70 bg-surface/50 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Doctor-entered prescription.</strong> LifeLedger records and delivers only the medications and advice explicitly entered by the attending doctor. No automated or AI prescribing is used.
              </span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {hasExisting && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={createMutation.isPending}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="gap-1.5"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving Prescription...
                  </>
                ) : (
                  "Save Prescription"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
