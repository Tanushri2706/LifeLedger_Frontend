"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Check,
  Droplet,
  Edit3,
  Heart,
  Plus,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmergencyProfileQuery,
  useUpdateEmergencyProfileMutation,
} from "../emergency-hooks";
import { BLOOD_GROUPS, type BloodGroup } from "../emergency-types";

export function EmergencyProfileCard() {
  const { data: profile, isLoading, isError, error, refetch } = useEmergencyProfileQuery();
  const updateMutation = useUpdateEmergencyProfileMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("UNKNOWN");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState("");
  const [criticalNotes, setCriticalNotes] = useState("");

  // Sync state on open or when profile loads
  useEffect(() => {
    if (profile) {
      setBloodGroup(profile.bloodGroup || "UNKNOWN");
      setAllergies(profile.allergies || []);
      setConditions(profile.medicalConditions || []);
      setCriticalNotes(profile.criticalNotes || "");
    }
  }, [profile]);

  const handleOpenEdit = () => {
    if (profile) {
      setBloodGroup(profile.bloodGroup || "UNKNOWN");
      setAllergies([...(profile.allergies || [])]);
      setConditions([...(profile.medicalConditions || [])]);
      setCriticalNotes(profile.criticalNotes || "");
    }
    setIsEditOpen(true);
  };

  const handleAddAllergy = () => {
    const trimmed = newAllergy.trim();
    if (trimmed && !allergies.includes(trimmed) && allergies.length < 20) {
      setAllergies([...allergies, trimmed]);
      setNewAllergy("");
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddCondition = () => {
    const trimmed = newCondition.trim();
    if (trimmed && !conditions.includes(trimmed) && conditions.length < 20) {
      setConditions([...conditions, trimmed]);
      setNewCondition("");
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        bloodGroup: bloodGroup !== "UNKNOWN" ? bloodGroup : undefined,
        allergies,
        medicalConditions: conditions,
        criticalNotes: criticalNotes.trim() || undefined,
      });
      setIsEditOpen(false);
    } catch {
      // Handled by mutation toast
    }
  };

  if (isLoading) {
    return (
      <div className="surface-calm rounded-2xl border border-border/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="surface-calm flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="size-6 text-destructive mb-2" />
        <h4 className="font-semibold text-foreground text-sm">Failed to load emergency profile</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {error?.message || "Unable to retrieve your emergency medical details."}
        </p>
        <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <section
        className="surface-calm rounded-2xl border border-border/60 p-5 sm:p-6"
        aria-label="Emergency Medical Profile"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
              <Stethoscope className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
                Emergency Medical Profile
              </h3>
              <p className="text-xs text-muted-foreground">
                Critical life-saving parameters displayed on your Emergency QR for first responders
              </p>
            </div>
          </div>

          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleOpenEdit}>
            <Edit3 className="size-3.5" aria-hidden="true" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Content Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Blood Group */}
          <div className="rounded-xl border border-border/60 bg-surface p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Droplet className="size-3.5 text-destructive" aria-hidden="true" />
              Blood Group
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-foreground">
              {profile?.bloodGroup && profile.bloodGroup !== "UNKNOWN" ? (
                <span className="inline-flex items-center gap-1.5 text-destructive">
                  {profile.bloodGroup}
                </span>
              ) : (
                <span className="text-sm font-normal text-muted-foreground italic">Not specified</span>
              )}
            </p>
          </div>

          {/* Allergies */}
          <div className="rounded-xl border border-border/60 bg-surface p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <AlertCircle className="size-3.5 text-amber-500" aria-hidden="true" />
              Known Allergies ({profile?.allergies?.length || 0})
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 min-h-[32px]">
              {profile?.allergies && profile.allergies.length > 0 ? (
                profile.allergies.map((allergy, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {allergy}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">None recorded</span>
              )}
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="rounded-xl border border-border/60 bg-surface p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Heart className="size-3.5 text-primary" aria-hidden="true" />
              Medical Conditions ({profile?.medicalConditions?.length || 0})
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 min-h-[32px]">
              {profile?.medicalConditions && profile.medicalConditions.length > 0 ? (
                profile.medicalConditions.map((cond, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {cond}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">None recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Critical Emergency Notes */}
        {profile?.criticalNotes ? (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary-soft/30 p-4">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">
              Critical First-Responder Instructions
            </h4>
            <p className="mt-1 text-sm text-foreground leading-relaxed">
              {profile.criticalNotes}
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
          <span>
            First responders scanning your Emergency QR will only see these exact emergency fields.
          </span>
        </div>
      </section>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Edit Emergency Medical Profile</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Maintain your life-saving medical details for emergency situations and public QR scan cards.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Blood Group Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Blood Group</Label>
              <Select value={bloodGroup} onValueChange={(val) => setBloodGroup(val as BloodGroup)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg === "UNKNOWN" ? "Not Specified / Unknown" : bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Allergies Tag Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Known Allergies (Drugs, Foods, Materials)</Label>
              <div className="flex gap-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAllergy();
                    }
                  }}
                  placeholder="e.g. Penicillin, Peanuts, Latex"
                  className="h-9 text-xs"
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddAllergy}>
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-surface border border-border px-2 py-0.5 text-xs text-foreground"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(i)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Medical Conditions Tag Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pre-existing Medical Conditions</Label>
              <div className="flex gap-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCondition();
                    }
                  }}
                  placeholder="e.g. Type 1 Diabetes, Asthma, Pacemaker"
                  className="h-9 text-xs"
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddCondition}>
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {conditions.map((cond, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-surface border border-border px-2 py-0.5 text-xs text-foreground"
                  >
                    {cond}
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(i)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Critical Notes */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs font-semibold">Critical Emergency Notes</Label>
                <span className="text-[10px] text-muted-foreground">
                  {criticalNotes.length}/500 chars
                </span>
              </div>
              <Textarea
                value={criticalNotes}
                onChange={(e) => setCriticalNotes(e.target.value)}
                placeholder="e.g. Carries EpiPen in backpack right pocket. History of sudden hypoglycemic episodes."
                className="h-24 text-xs leading-relaxed"
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-1.5">
              {updateMutation.isPending ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Save Emergency Profile
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
