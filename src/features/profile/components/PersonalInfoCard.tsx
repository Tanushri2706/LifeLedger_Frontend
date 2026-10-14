"use client";

import { useEffect, useState, useMemo } from "react";
import { Lock, Save, RotateCcw, Loader2, User, Phone, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Gender, BloodGroup } from "@/types";
import type { UserProfileDto, UpdateProfileDto } from "../profile-types";
import { useUpdateProfileMutation } from "../profile-hooks";

interface PersonalInfoCardProps {
  profile: UserProfileDto;
}

const GENDER_OPTIONS: Array<{ value: Gender; label: string }> = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function computeFullName(profile: UserProfileDto): string {
  if (profile.fullName) return profile.fullName;
  const combined = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  return combined || profile.name || "";
}

export function PersonalInfoCard({ profile }: PersonalInfoCardProps) {
  const updateMutation = useUpdateProfileMutation();

  const initialFullName = useMemo(() => computeFullName(profile), [profile]);
  const initialPhone = profile.phone || "";
  const initialDob = profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "";
  const initialGender = profile.gender || "";
  const initialBloodGroup = profile.bloodGroup || "";

  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [dateOfBirth, setDateOfBirth] = useState(initialDob);
  const [gender, setGender] = useState<Gender | "">(initialGender);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">(initialBloodGroup);

  // Update local state when remote profile changes
  useEffect(() => {
    setFullName(initialFullName);
    setPhone(initialPhone);
    setDateOfBirth(initialDob);
    setGender(initialGender);
    setBloodGroup(initialBloodGroup);
  }, [initialFullName, initialPhone, initialDob, initialGender, initialBloodGroup]);

  // Today's date string YYYY-MM-DD for max DOB validation
  const today = new Date().toISOString().split("T")[0];

  const isDirty =
    fullName.trim() !== initialFullName.trim() ||
    phone.trim() !== initialPhone.trim() ||
    dateOfBirth !== initialDob ||
    gender !== initialGender ||
    bloodGroup !== initialBloodGroup;

  const handleReset = () => {
    setFullName(initialFullName);
    setPhone(initialPhone);
    setDateOfBirth(initialDob);
    setGender(initialGender);
    setBloodGroup(initialBloodGroup);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || updateMutation.isPending) return;

    const payload: UpdateProfileDto = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      dateOfBirth: dateOfBirth || undefined,
      gender: (gender || undefined) as Gender | undefined,
      bloodGroup: bloodGroup || "",
    };

    await updateMutation.mutateAsync(payload);
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-1">
        <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="size-5 text-primary" />
          Personal Information
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your personal details and medical vitals metadata.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs font-semibold text-foreground">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="h-10 bg-background text-sm"
                disabled={updateMutation.isPending}
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                Email Address
                <Lock className="size-3 text-muted-foreground" aria-hidden="true" />
              </Label>
              <span className="text-[11px] font-medium text-muted-foreground">
                Managed via Security
              </span>
            </div>
            <Input
              id="email"
              type="email"
              disabled
              value={profile.email}
              className="h-10 bg-muted/60 text-sm text-muted-foreground cursor-not-allowed select-all"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" />
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="h-10 bg-background text-sm"
              disabled={updateMutation.isPending}
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              Date of Birth
            </Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              max={today}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-10 bg-background text-sm"
              disabled={updateMutation.isPending}
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-xs font-semibold text-foreground">
              Gender
            </Label>
            <Select
              value={gender}
              onValueChange={(val) => setGender(val as Gender)}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger id="gender" className="h-10 bg-background text-sm">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-sm">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Blood Group */}
          <div className="space-y-2">
            <Label htmlFor="bloodGroup" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Heart className="size-3.5 text-destructive/80" />
              Blood Group
            </Label>
            <Select
              value={bloodGroup || "none"}
              onValueChange={(val) => setBloodGroup(val === "none" ? "" : (val as BloodGroup))}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger id="bloodGroup" className="h-10 bg-background text-sm">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-sm text-muted-foreground">
                  Not specified
                </SelectItem>
                {BLOOD_GROUPS.map((bg) => (
                  <SelectItem key={bg} value={bg} className="text-sm font-medium">
                    {bg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            {isDirty ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                You have unsaved changes.
              </span>
            ) : (
              "All changes are saved."
            )}
          </p>

          <div className="flex items-center gap-2.5">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={updateMutation.isPending}
                className="gap-1.5 text-xs h-9"
              >
                <RotateCcw className="size-3.5" />
                Discard
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={!isDirty || updateMutation.isPending}
              className="gap-2 text-xs font-semibold h-9 px-4 min-w-28"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
