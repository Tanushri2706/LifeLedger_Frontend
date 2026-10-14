"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Reveal } from "@/components/landing/reveal";
import {
  FamilyVaultHeader,
  FamilyMemberGrid,
  AddFamilyMemberDialog,
  EditFamilyMemberDialog,
  ArchiveFamilyMemberDialog,
  ArchivedMembersSection,
} from "@/features/family/components";
import {
  useFamilyVaultSummaryQuery,
  useFamilyMembersQuery,
} from "@/features/family/family-hooks";
import type { FamilyMemberResponseDto } from "@/features/family/family-types";

export default function FamilyVaultPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMemberResponseDto | null>(null);
  const [archivingMember, setArchivingMember] = useState<FamilyMemberResponseDto | null>(null);

  const { data: summary } = useFamilyVaultSummaryQuery();
  const { data: members = [], isLoading } = useFamilyMembersQuery(false);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6 pt-6 pb-12">
        <Reveal>
          <FamilyVaultHeader
            summary={summary}
            onAddMember={() => setIsAddOpen(true)}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <FamilyMemberGrid
            members={members}
            isLoading={isLoading}
            onAddMember={() => setIsAddOpen(true)}
            onEditMember={(member) => setEditingMember(member)}
            onArchiveMember={(member) => setArchivingMember(member)}
          />
        </Reveal>

        <Reveal delay={0.2}>
          <ArchivedMembersSection />
        </Reveal>
      </div>

      {/* Dialogs */}
      <AddFamilyMemberDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />

      <EditFamilyMemberDialog
        member={editingMember}
        open={Boolean(editingMember)}
        onOpenChange={(open) => !open && setEditingMember(null)}
      />

      <ArchiveFamilyMemberDialog
        member={archivingMember}
        open={Boolean(archivingMember)}
        onOpenChange={(open) => !open && setArchivingMember(null)}
      />
    </DashboardShell>
  );
}
