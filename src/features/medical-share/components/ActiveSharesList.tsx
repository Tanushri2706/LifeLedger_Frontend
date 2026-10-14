"use client";

import { useState } from "react";
import {
  Share2,
  ShieldAlert,
  AlertCircle,
  Eye,
  Plus,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  useOwnerMedicalSharesQuery,
  useRevokeMedicalShareMutation,
} from "../medical-share-hooks";
import { MedicalShareStatusBadge } from "./MedicalShareStatusBadge";
import type { MedicalShareOwnerResponseDto } from "../medical-share-types";

export interface ActiveSharesListProps {
  subjectType?: "user" | "family_member";
  subjectId?: string;
  subjectDisplayName?: string;
  onCreateNewShare: () => void;
}

export function ActiveSharesList({
  subjectType,
  subjectId,
  subjectDisplayName,
  onCreateNewShare,
}: ActiveSharesListProps) {
  const [shareToRevoke, setShareToRevoke] = useState<MedicalShareOwnerResponseDto | null>(
    null
  );
  const revokeMutation = useRevokeMedicalShareMutation();
  const isPersonal = subjectType === "user";

  const {
    data: allShares = [],
    isLoading,
    isError,
    refetch,
  } = useOwnerMedicalSharesQuery(
    subjectId
      ? {
          subjectType: subjectType || "family_member",
          subjectId,
        }
      : undefined
  );

  // Filter for this subject if subjectId provided
  const shares = subjectId
    ? allShares.filter((s) => {
        if (isPersonal) {
          return s.subject?.type === "user" || s.subject?.id === subjectId;
        }
        return s.subject?.id === subjectId;
      })
    : allShares;

  const handleRevokeConfirm = async () => {
    if (!shareToRevoke) return;
    try {
      await revokeMutation.mutateAsync(shareToRevoke.id);
      setShareToRevoke(null);
    } catch {
      // Handled in mutation hook toast
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="size-5 text-destructive mb-1.5" />
        <p className="text-xs text-muted-foreground">Failed to load medical shares.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-2 text-xs">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm text-foreground">
              {isPersonal ? "Shared with Doctors & Caregivers" : "Active & Past Medical Shares"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isPersonal
                ? "Manage temporary QR and link access to your personal medical records."
                : `Manage temporary QR and link access to ${subjectDisplayName || "this profile"}'s documents.`}
            </p>
          </div>

          <Button
            onClick={onCreateNewShare}
            size="sm"
            className="gap-1.5 text-xs font-semibold shadow-sm"
          >
            <Plus className="size-3.5" />
            Create New Share
          </Button>
        </div>

        {shares.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/30 p-8 text-center">
            <Share2 className="size-8 text-muted-foreground/60 mb-2" />
            <p className="text-xs font-semibold text-foreground">
              No Medical Shares Created
            </p>
            <p className="text-[11px] text-muted-foreground max-w-sm mt-0.5">
              {isPersonal
                ? "Select specific personal medical documents to generate a one-time or time-limited QR code for physicians or hospitals."
                : "Select specific medical documents to generate a one-time or time-limited QR code for physicians or hospitals."}
            </p>
            <Button
              onClick={onCreateNewShare}
              size="sm"
              variant="outline"
              className="mt-4 text-xs gap-1.5"
            >
              <Share2 className="size-3.5" />
              Share Records
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm hover:border-border transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <MedicalShareStatusBadge status={share.status} />
                    <span className="font-semibold text-xs text-foreground">
                      {share.reportCount} {share.reportCount === 1 ? "document" : "documents"} shared
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {share.accessMode === "one_time" ? "One-Time Access" : "Time-Limited"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                    <span>
                      Created: {new Date(share.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      Expires: {new Date(share.expiresAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {share.accessCount > 0 ? (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3" />
                          Accessed {share.accessCount} {share.accessCount === 1 ? "time" : "times"}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  {share.status === "active" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShareToRevoke(share)}
                      className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive h-8"
                    >
                      Revoke Access
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}

            <div className="rounded-xl bg-surface/60 p-3 border border-border/40 text-[11px] text-muted-foreground flex items-start gap-2">
              <Lock className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Policy:</strong> To protect clinical confidentiality, raw QR tokens cannot be retrieved once a share dialog is closed. Generate a new share whenever you need to grant access again.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog
        open={Boolean(shareToRevoke)}
        onOpenChange={(open) => !open && setShareToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-destructive" />
              <AlertDialogTitle className="font-display text-lg">
                Revoke Medical Share?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground pt-1 leading-relaxed">
              Anyone with the QR code or link will immediately lose access to the shared documents. Any active viewing session will be terminated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeMutation.isPending}>
              Keep Active
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRevokeConfirm();
              }}
              disabled={revokeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeMutation.isPending ? "Revoking..." : "Revoke Immediately"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
