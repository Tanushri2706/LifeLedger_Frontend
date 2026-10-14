"use client";

import { Users, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FamilyVaultSummaryDto } from "../family-types";

interface FamilyVaultHeaderProps {
  summary?: FamilyVaultSummaryDto;
  onAddMember: () => void;
}

export function FamilyVaultHeader({ summary, onAddMember }: FamilyVaultHeaderProps) {
  const activeCount = summary?.activeMemberCount ?? 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Family Vault
              </h1>
              <Badge variant="outline" className="text-xs font-semibold">
                {activeCount} {activeCount === 1 ? "Active Profile" : "Active Profiles"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keep your family&apos;s health records organized in separate, secure profiles.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-surface/80 border border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Separate Subject Spaces</span>
        </div>

        <Button
          onClick={onAddMember}
          className="gap-2 shadow-sm font-semibold"
          size="default"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Family Member
        </Button>
      </div>
    </div>
  );
}
