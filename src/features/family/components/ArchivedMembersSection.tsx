"use client";

import { useState } from "react";
import { Archive, ChevronDown, ChevronUp, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFamilyMembersQuery, useRestoreFamilyMemberMutation } from "../family-hooks";
import { formatRelationship, getInitials } from "../family-utils";
import { FamilyMemberStatus } from "../family-types";

export function ArchivedMembersSection() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: allMembers = [], isLoading } = useFamilyMembersQuery(true);
  const restoreMutation = useRestoreFamilyMemberMutation();

  const archivedMembers = allMembers.filter(
    (m) => m.status === FamilyMemberStatus.ARCHIVED
  );

  if (archivedMembers.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-dashed border-border/80 bg-surface/30 p-5 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Archive className="size-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Archived Profiles ({archivedMembers.length})
          </h3>
          <Badge variant="outline" className="text-[10px] bg-muted">
            Inactive
          </Badge>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-8 gap-1.5 text-xs text-muted-foreground"
        >
          {isOpen ? "Hide Archived" : "View Archived"}
          {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-3 pt-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Archived family profiles and their historical medical documents are preserved and can be restored at any time.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {archivedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground font-bold text-xs shrink-0">
                    {getInitials(member.displayName)}
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-foreground block truncate">
                      {member.displayName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelationship(member.relationship)}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restoreMutation.mutate(member.id)}
                  disabled={restoreMutation.isPending}
                  className="h-8 gap-1.5 text-xs shrink-0 font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary"
                >
                  {restoreMutation.isPending ? (
                    <RefreshCw className="size-3 animate-spin" />
                  ) : (
                    <RotateCcw className="size-3" />
                  )}
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
