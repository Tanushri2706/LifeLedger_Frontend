"use client";

import Link from "next/link";
import {
  ChevronRight,
  Droplet,
  Heart,
  AlertCircle,
  MoreVertical,
  Archive,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FamilyMemberResponseDto } from "../family-types";
import { formatRelationship, getInitials } from "../family-utils";

interface FamilyMemberCardProps {
  member: FamilyMemberResponseDto;
  onEdit?: (member: FamilyMemberResponseDto) => void;
  onArchive?: (member: FamilyMemberResponseDto) => void;
}

export function FamilyMemberCard({
  member,
  onEdit,
  onArchive,
}: FamilyMemberCardProps) {
  const initials = getInitials(member.displayName);
  const relationshipLabel = formatRelationship(member.relationship);

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:border-border hover:shadow-md">
      <div>
        {/* Top bar with initials avatar and options dropdown */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary font-display font-bold text-base border border-primary/20 shadow-sm">
              {initials}
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {member.displayName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className="text-[11px] font-medium py-0 px-2">
                  {relationshipLabel}
                </Badge>
                {member.age !== null && member.age !== undefined ? (
                  <span className="text-xs text-muted-foreground">
                    {member.age} yrs
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                aria-label={`Options for ${member.displayName}`}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => onEdit?.(member)}
                className="gap-2 cursor-pointer text-xs"
              >
                <Edit2 className="size-3.5 text-muted-foreground" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onArchive?.(member)}
                className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
              >
                <Archive className="size-3.5" />
                Archive Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Clinical Summary Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          {member.bloodGroup && member.bloodGroup !== "UNKNOWN" ? (
            <div className="flex items-center gap-1 text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
              <Droplet className="size-3 fill-rose-500" />
              <span>{member.bloodGroup}</span>
            </div>
          ) : null}

          {member.allergies && member.allergies.length > 0 ? (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
              <AlertCircle className="size-3" />
              <span>{member.allergies.length} {member.allergies.length === 1 ? "Allergy" : "Allergies"}</span>
            </div>
          ) : null}

          {member.medicalConditions && member.medicalConditions.length > 0 ? (
            <div className="flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
              <Heart className="size-3" />
              <span>{member.medicalConditions.length} {member.medicalConditions.length === 1 ? "Condition" : "Conditions"}</span>
            </div>
          ) : null}

          {(!member.allergies || member.allergies.length === 0) &&
          (!member.medicalConditions || member.medicalConditions.length === 0) &&
          (!member.bloodGroup || member.bloodGroup === "UNKNOWN") ? (
            <span className="text-[11px] text-muted-foreground italic">
              No clinical tags added
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Action Link */}
      <div className="mt-5 pt-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all font-medium text-xs"
        >
          <Link href={`/family/${member.id}`}>
            <span>Open Profile</span>
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
