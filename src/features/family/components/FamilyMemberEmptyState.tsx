"use client";

import { Users, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FamilyMemberEmptyStateProps {
  onAddMember: () => void;
}

export function FamilyMemberEmptyState({ onAddMember }: FamilyMemberEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-surface/40 p-8 sm:p-12 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-sm mb-4">
        <Users className="size-8" aria-hidden="true" />
      </span>

      <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">
        No Family Profiles Created Yet
      </h3>

      <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
        Family Vault lets you manage health records, AI insights, and medical timelines for parents, children, or dependents in completely isolated, secure profiles.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <Button onClick={onAddMember} className="gap-2 shadow-sm font-semibold">
          <Plus className="size-4" />
          Add First Family Member
        </Button>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/40 pt-4">
        <ShieldCheck className="size-4 text-emerald-500" />
        <span>Each family profile maintains a strict, isolated medical subject space.</span>
      </div>
    </div>
  );
}
