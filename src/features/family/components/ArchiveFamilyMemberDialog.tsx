"use client";

import { Archive, AlertTriangle, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useArchiveFamilyMemberMutation } from "../family-hooks";
import type { FamilyMemberResponseDto } from "../family-types";

interface ArchiveFamilyMemberDialogProps {
  member: FamilyMemberResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ArchiveFamilyMemberDialog({
  member,
  open,
  onOpenChange,
  onSuccess,
}: ArchiveFamilyMemberDialogProps) {
  const archiveMutation = useArchiveFamilyMemberMutation();

  const handleConfirm = async () => {
    if (!member) return;
    try {
      await archiveMutation.mutateAsync(member.id);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Handled in mutation hook toast
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-5" />
            </span>
            <AlertDialogTitle className="font-display text-lg">
              Archive {member?.displayName}&apos;s Profile?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-xs text-muted-foreground pt-2">
              <p>
                Archiving will remove <strong className="text-foreground">{member?.displayName}</strong> from your active Family Vault list.
              </p>
              <div className="rounded-lg bg-surface p-3 border border-border/60 space-y-1.5 text-[11px]">
                <strong className="text-foreground block">What happens when you archive:</strong>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Historical medical documents and timeline records are <strong>safely preserved</strong> and not deleted.</li>
                  <li>Any active <strong>Selective Medical Shares</strong> for this profile will immediately stop resolving.</li>
                  <li>You can restore this profile and all its records at any time from the <em>Archived Members</em> section.</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={archiveMutation.isPending}>
            Keep Profile
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={archiveMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
          >
            {archiveMutation.isPending ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                Archiving...
              </>
            ) : (
              <>
                <Archive className="size-3.5" />
                Archive Profile
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
