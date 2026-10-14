"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FamilyMemberCard } from "./FamilyMemberCard";
import { FamilyMemberEmptyState } from "./FamilyMemberEmptyState";
import type { FamilyMemberResponseDto } from "../family-types";

interface FamilyMemberGridProps {
  members: FamilyMemberResponseDto[];
  isLoading: boolean;
  onAddMember: () => void;
  onEditMember: (member: FamilyMemberResponseDto) => void;
  onArchiveMember: (member: FamilyMemberResponseDto) => void;
}

export function FamilyMemberGrid({
  members,
  isLoading,
  onAddMember,
  onEditMember,
  onArchiveMember,
}: FamilyMemberGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return <FamilyMemberEmptyState onAddMember={onAddMember} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <FamilyMemberCard
          key={member.id}
          member={member}
          onEdit={onEditMember}
          onArchive={onArchiveMember}
        />
      ))}
    </div>
  );
}
