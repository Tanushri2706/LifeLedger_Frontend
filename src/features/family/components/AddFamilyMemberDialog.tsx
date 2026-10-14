"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateFamilyMemberMutation } from "../family-hooks";
import {
  FamilyRelationship,
  type CreateFamilyMemberDto,
} from "../family-types";
import { RELATIONSHIP_OPTIONS } from "../family-utils";

interface AddFamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "UNKNOWN",
];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export function AddFamilyMemberDialog({
  open,
  onOpenChange,
}: AddFamilyMemberDialogProps) {
  const router = useRouter();
  const createMutation = useCreateFamilyMemberMutation();

  const [displayName, setDisplayName] = useState("");
  const [relationship, setRelationship] = useState<FamilyRelationship>(
    FamilyRelationship.MOTHER
  );
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [allergiesInput, setAllergiesInput] = useState("");
  const [conditionsInput, setConditionsInput] = useState("");
  const [emergencyNotes, setEmergencyNotes] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const resetForm = () => {
    setDisplayName("");
    setRelationship(FamilyRelationship.MOTHER);
    setDateOfBirth("");
    setGender("");
    setBloodGroup("");
    setPhone("");
    setAllergiesInput("");
    setConditionsInput("");
    setEmergencyNotes("");
    setAuthorized(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error("Please provide a display name for this family member.");
      return;
    }

    if (!authorized) {
      toast.error("Please confirm your authorization to manage health records for this profile.");
      return;
    }

    const allergies = allergiesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const medicalConditions = conditionsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: CreateFamilyMemberDto = {
      displayName: displayName.trim(),
      relationship,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      bloodGroup: bloodGroup || undefined,
      phone: phone.trim() || undefined,
      allergies: allergies.length > 0 ? allergies : undefined,
      medicalConditions: medicalConditions.length > 0 ? medicalConditions : undefined,
      emergencyNotes: emergencyNotes.trim() || undefined,
      managementAuthorizationConfirmed: true,
    };

    try {
      const created = await createMutation.mutateAsync(payload);
      onOpenChange(false);
      resetForm();
      if (created?.id) {
        router.push(`/family/${created.id}`);
      }
    } catch {
      // Error handled by mutation hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-lg">Add Family Member</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Create a dedicated, private health subject profile inside your Family Vault.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Basic Identity */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="member-name" className="text-xs font-semibold">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="member-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sita Sharma"
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-relationship" className="text-xs font-semibold">
                Relationship <span className="text-destructive">*</span>
              </Label>
              <Select
                value={relationship}
                onValueChange={(val) => setRelationship(val as FamilyRelationship)}
              >
                <SelectTrigger id="member-relationship" className="text-xs">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clinical Demographics */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="member-dob" className="text-xs font-semibold">
                Date of Birth
              </Label>
              <Input
                id="member-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-gender" className="text-xs font-semibold">
                Gender
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="member-gender" className="text-xs">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g.value} value={g.value} className="text-xs">
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-blood-group" className="text-xs font-semibold">
                Blood Group
              </Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger id="member-blood-group" className="text-xs">
                  <SelectValue placeholder="Blood group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg} value={bg} className="text-xs">
                      {bg === "UNKNOWN" ? "Unknown" : bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="member-phone" className="text-xs font-semibold">
              Contact Phone (Optional)
            </Label>
            <Input
              id="member-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="text-xs"
            />
          </div>

          {/* Allergies & Conditions */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="member-allergies" className="text-xs font-semibold">
                Known Allergies (comma-separated)
              </Label>
              <Input
                id="member-allergies"
                value={allergiesInput}
                onChange={(e) => setAllergiesInput(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts, Dust"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-conditions" className="text-xs font-semibold">
                Medical Conditions (comma-separated)
              </Label>
              <Input
                id="member-conditions"
                value={conditionsInput}
                onChange={(e) => setConditionsInput(e.target.value)}
                placeholder="e.g. Hypertension, Type 2 Diabetes"
                className="text-xs"
              />
            </div>
          </div>

          {/* Critical Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="member-notes" className="text-xs font-semibold">
              Emergency & Medical Notes
            </Label>
            <Textarea
              id="member-notes"
              value={emergencyNotes}
              onChange={(e) => setEmergencyNotes(e.target.value)}
              placeholder="Special instructions, mobility considerations, or preferred hospital..."
              className="h-16 text-xs resize-none"
              maxLength={500}
            />
          </div>

          {/* Explicit Management Authorization Acknowledgment */}
          <div className="rounded-xl border border-border/80 bg-surface/80 p-3 space-y-2">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="auth-confirm"
                checked={authorized}
                onCheckedChange={(c) => setAuthorized(Boolean(c))}
                className="mt-0.5"
              />
              <div className="grid gap-0.5 leading-none">
                <label
                  htmlFor="auth-confirm"
                  className="text-xs font-medium text-foreground cursor-pointer"
                >
                  I confirm that I am authorized to manage health information for this person.
                </label>
                <p className="text-[11px] text-muted-foreground">
                  You are creating a managed health profile within your account. Records and AI insights uploaded under this profile are strictly isolated to this family member.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !displayName.trim() || !authorized}
              className="gap-2 font-semibold"
            >
              {createMutation.isPending ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                "Save Family Profile"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
