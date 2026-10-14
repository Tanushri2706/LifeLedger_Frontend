"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Edit,
  Archive,
  Droplet,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FamilyMemberResponseDto } from "../family-types";
import { formatRelationship, getInitials } from "../family-utils";

interface FamilyMemberHeaderProps {
  member: FamilyMemberResponseDto;
  onEdit: () => void;
  onShare: () => void;
  onArchive: () => void;
}

export function FamilyMemberHeader({
  member,
  onEdit,
  onShare,
  onArchive,
}: FamilyMemberHeaderProps) {
  const initials = getInitials(member.displayName);
  const relationshipLabel = formatRelationship(member.relationship);

  return (
    <div className="space-y-4 border-b border-border/60 pb-5">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/family">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to Family Vault
          </Link>
        </Button>
      </div>

      {/* Main Profile Info & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid size-14 sm:size-16 place-items-center rounded-2xl bg-primary/10 text-primary font-display font-bold text-xl sm:text-2xl border-2 border-primary/20 shadow-md shrink-0">
            {initials}
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {member.displayName}
              </h1>
              <Badge variant="secondary" className="font-semibold text-xs">
                {relationshipLabel}
              </Badge>
              {member.status === "archived" ? (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-xs">
                  Archived Profile
                </Badge>
              ) : null}
            </div>

            {/* Demographics row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
              {member.age !== null && member.age !== undefined ? (
                <span>{member.age} years old</span>
              ) : null}
              {member.gender ? (
                <>
                  <span>•</span>
                  <span className="capitalize">{member.gender.replace("_", " ")}</span>
                </>
              ) : null}
              {member.bloodGroup && member.bloodGroup !== "UNKNOWN" ? (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-500">
                    <Droplet className="size-3 fill-rose-500" />
                    {member.bloodGroup}
                  </span>
                </>
              ) : null}
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-3.5" />
                Isolated Subject Space
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={onShare}
            className="gap-2 font-semibold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
          >
            <Share2 className="size-3.5" aria-hidden="true" />
            Share Medical Records
          </Button>

          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium"
          >
            <Edit className="size-3.5" aria-hidden="true" />
            Edit Profile
          </Button>

          <Button
            onClick={onArchive}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Archive className="size-3.5" aria-hidden="true" />
            Archive
          </Button>
        </div>
      </div>
    </div>
  );
}
