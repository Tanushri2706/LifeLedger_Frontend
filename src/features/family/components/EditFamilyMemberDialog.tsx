"use client";

import { useState, useEffect } from "react";
import { Edit3, RefreshCw } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateFamilyMemberMutation } from "../family-hooks";
import {
  FamilyRelationship,
  type FamilyMemberResponseDto,
  type UpdateFamilyMemberDto,
} from "../family-types";
import { RELATIONSHIP_OPTIONS } from "../family-utils";

interface EditFamilyMemberDialogProps {
  member: FamilyMemberResponseDto | null;
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

export function EditFamilyMemberDialog({
  member,
  open,
  onOpenChange,
}: EditFamilyMemberDialogProps) {
  const updateMutation = useUpdateFamilyMemberMutation();

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

  useEffect(() => {
    if (member) {
      setDisplayName(member.displayName || "");
      setRelationship(member.relationship || FamilyRelationship.OTHER);
      setDateOfBirth(
        member.dateOfBirth
          ? new Date(member.dateOfBirth).toISOString().split("T")[0]
          : ""
      );
      setGender(member.gender || "");
      setBloodGroup(member.bloodGroup || "");
      setPhone(member.phone || "");
      setAllergiesInput((member.allergies || []).join(", "));
      setConditionsInput((member.medicalConditions || []).join(", "));
      setEmergencyNotes(member.emergencyNotes || "");
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (!displayName.trim()) {
      toast.error("Display name cannot be empty.");
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

    const payload: UpdateFamilyMemberDto = {
      displayName: displayName.trim(),
      relationship,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      bloodGroup: bloodGroup || null,
      phone: phone.trim() || null,
      allergies,
      medicalConditions,
      emergencyNotes: emergencyNotes.trim() || null,
    };

    try {
      await updateMutation.mutateAsync({
        memberId: member.id,
        payload,
      });
      onOpenChange(false);
    } catch {
      // Error handled in hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Edit3 className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-lg">Edit Family Profile</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update clinical demographics and contact details for {member?.displayName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Basic Identity */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-member-name" className="text-xs font-semibold">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-member-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-member-relationship" className="text-xs font-semibold">
                Relationship <span className="text-destructive">*</span>
              </Label>
              <Select
                value={relationship}
                onValueChange={(val) => setRelationship(val as FamilyRelationship)}
              >
                <SelectTrigger id="edit-member-relationship" className="text-xs">
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
              <Label htmlFor="edit-member-dob" className="text-xs font-semibold">
                Date of Birth
              </Label>
              <Input
                id="edit-member-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-member-gender" className="text-xs font-semibold">
                Gender
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="edit-member-gender" className="text-xs">
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
              <Label htmlFor="edit-member-blood-group" className="text-xs font-semibold">
                Blood Group
              </Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger id="edit-member-blood-group" className="text-xs">
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
            <Label htmlFor="edit-member-phone" className="text-xs font-semibold">
              Contact Phone
            </Label>
            <Input
              id="edit-member-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Allergies & Conditions */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-member-allergies" className="text-xs font-semibold">
                Known Allergies (comma-separated)
              </Label>
              <Input
                id="edit-member-allergies"
                value={allergiesInput}
                onChange={(e) => setAllergiesInput(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-member-conditions" className="text-xs font-semibold">
                Medical Conditions (comma-separated)
              </Label>
              <Input
                id="edit-member-conditions"
                value={conditionsInput}
                onChange={(e) => setConditionsInput(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Critical Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-member-notes" className="text-xs font-semibold">
              Emergency & Medical Notes
            </Label>
            <Textarea
              id="edit-member-notes"
              value={emergencyNotes}
              onChange={(e) => setEmergencyNotes(e.target.value)}
              className="h-16 text-xs resize-none"
              maxLength={500}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !displayName.trim()}
              className="gap-2 font-semibold"
            >
              {updateMutation.isPending ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
