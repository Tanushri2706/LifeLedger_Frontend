"use client";

import {
  AlertCircle,
  Droplet,
  ShieldCheck,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FamilyMemberResponseDto } from "../family-types";
import { formatRelationship } from "../family-utils";

interface FamilyMemberOverviewProps {
  member: FamilyMemberResponseDto;
}

export function FamilyMemberOverview({ member }: FamilyMemberOverviewProps) {
  const formattedDob = member.dateOfBirth
    ? new Date(member.dateOfBirth).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Personal Details Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <User className="size-4 text-primary" />
            <span>Personal Information</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-semibold text-foreground">{member.displayName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Relationship</span>
              <span className="font-medium text-foreground">{formatRelationship(member.relationship)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Date of Birth</span>
              <span className="text-foreground">{formattedDob || <em className="text-muted-foreground">Not added</em>}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Gender</span>
              <span className="capitalize text-foreground">{member.gender?.replace("_", " ") || <em className="text-muted-foreground">Not added</em>}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Contact Phone</span>
              <span className="font-mono text-foreground">{member.phone || <em className="text-muted-foreground">Not added</em>}</span>
            </div>
          </div>
        </div>

        {/* Clinical Summary Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Droplet className="size-4 text-rose-500" />
            <span>Emergency & Clinical Data</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Blood Group</span>
              {member.bloodGroup && member.bloodGroup !== "UNKNOWN" ? (
                <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold">
                  {member.bloodGroup}
                </Badge>
              ) : (
                <span className="text-muted-foreground italic">Not recorded</span>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-muted-foreground block">Known Allergies:</span>
              <div className="flex flex-wrap gap-1.5">
                {member.allergies && member.allergies.length > 0 ? (
                  member.allergies.map((allergy, i) => (
                    <Badge key={i} variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px]">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground italic">No drug/food allergies recorded</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-muted-foreground block">Medical Conditions:</span>
              <div className="flex flex-wrap gap-1.5">
                {member.medicalConditions && member.medicalConditions.length > 0 ? (
                  member.medicalConditions.map((cond, i) => (
                    <Badge key={i} variant="outline" className="bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30 text-[11px]">
                      {cond}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground italic">No pre-existing conditions recorded</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Subject Policy Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <AlertCircle className="size-4 text-amber-500" />
            <span>Emergency Notes & Policy</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block mb-1">Critical Instructions / Notes:</span>
              {member.emergencyNotes ? (
                <p className="rounded-xl bg-surface/90 p-3 border border-border/60 text-foreground leading-relaxed">
                  {member.emergencyNotes}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No emergency instructions or special notes added.
                </p>
              )}
            </div>

            <div className="rounded-xl bg-surface/60 p-3 border border-border/40 space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Subject Isolation Guarantee</span>
              </div>
              <p>
                Medical documents and AI health trends uploaded under this profile are strictly isolated from your personal records and other family members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
