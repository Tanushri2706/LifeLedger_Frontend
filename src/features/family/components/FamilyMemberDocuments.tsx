"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Search,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  useFamilyMemberReportsQuery,
  familyKeys,
} from "../family-hooks";
import { FamilyMemberUploadDialog } from "./FamilyMemberUploadDialog";
import { reportsApi, type MedicalReportData } from "@/features/reports";
import type { FamilyMemberResponseDto } from "../family-types";

interface FamilyMemberDocumentsProps {
  member: FamilyMemberResponseDto;
}

export function FamilyMemberDocuments({ member }: FamilyMemberDocumentsProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<MedicalReportData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: reportsData,
    isLoading,
    isError,
    refetch,
  } = useFamilyMemberReportsQuery(member.id, {
    search: search.trim() || undefined,
  });

  const reports = reportsData?.reports || [];

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    try {
      setIsDeleting(true);
      await reportsApi.deleteReport(reportToDelete.id);
      toast.success("Medical report deleted.");

      // Invalidate isolated subject caches
      queryClient.invalidateQueries({
        queryKey: familyKeys.reports(member.id),
      });
      queryClient.invalidateQueries({
        queryKey: familyKeys.timeline(member.id),
      });
      queryClient.invalidateQueries({
        queryKey: familyKeys.healthIntelligence(member.id),
      });

      setReportToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete report.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (report: MedicalReportData) => {
    try {
      const res = await reportsApi.getDownloadUrl(report.id);
      if (res.data?.downloadUrl) {
        const link = document.createElement("a");
        link.href = res.data.downloadUrl;
        link.download = res.data.fileName || report.originalFilename || "medical_report";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Document opened for secure download.");
      }
    } catch {
      toast.error("Failed to generate download link.");
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by title, hospital, doctor..."
              className="pl-9 text-xs h-9"
            />
          </div>

          <Button
            onClick={() => setIsUploadOpen(true)}
            size="sm"
            className="gap-2 font-semibold shadow-sm shrink-0"
          >
            <Upload className="size-4" />
            Upload Document for {member.displayName.split(" ")[0]}
          </Button>
        </div>

        {/* Documents List / State */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle className="size-6 text-destructive mb-2" />
            <p className="text-xs text-muted-foreground">Failed to load medical reports.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-3 gap-1.5 text-xs">
              <RefreshCw className="size-3.5" /> Retry
            </Button>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-surface/40 p-8 sm:p-12 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary mb-3">
              <FileText className="size-6" />
            </span>
            <h3 className="font-display text-base font-bold text-foreground">
              No Medical Documents for {member.displayName}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Upload blood tests, prescriptions, pathology reports, or imaging scans to build this profile&apos;s health record.
            </p>
            <Button
              onClick={() => setIsUploadOpen(true)}
              size="sm"
              className="mt-4 gap-2 shadow-sm font-semibold text-xs"
            >
              <Upload className="size-3.5" />
              Upload First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm hover:border-border transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/reports/${report.id}`}
                        className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate"
                      >
                        {report.title}
                      </Link>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {report.category.replace("_", " ")}
                      </Badge>
                      {report.processingStatus === "completed" ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                          Analyzed
                        </Badge>
                      ) : report.processingStatus === "unreadable" ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Unreadable
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(report.reportDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {report.hospital ? (
                        <>
                          <span>•</span>
                          <span>{report.hospital}</span>
                        </>
                      ) : null}
                      {report.doctor ? (
                        <>
                          <span>•</span>
                          <span>Dr. {report.doctor}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Link href={`/reports/${report.id}`}>
                      <span>View & Insights</span>
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownload(report)}
                    className="size-8 text-muted-foreground hover:text-foreground"
                    aria-label={`Download ${report.title}`}
                  >
                    <Download className="size-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setReportToDelete(report)}
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label={`Delete ${report.title}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <FamilyMemberUploadDialog
        member={member}
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(reportToDelete)}
        onOpenChange={(open) => !open && setReportToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medical Report?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to delete <strong className="text-foreground">{reportToDelete?.title}</strong>? This will remove the document file, associated extractions, and timeline events for {member.displayName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
