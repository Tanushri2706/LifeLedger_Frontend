"use client";

import { use, useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Lock,
  Download,
  AlertTriangle,
  Clock,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePublicMedicalShareMetadataQuery,
  useAccessPublicShareMutation,
} from "@/features/medical-share/medical-share-hooks";
import { medicalShareApi } from "@/features/medical-share/medical-share-api";
import type {
  SharedReportSummaryDto,
  PublicMedicalShareAccessSessionDto,
} from "@/features/medical-share/medical-share-types";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function PublicMedicalSharePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  // Metadata Query (Non-consuming GET)
  const {
    data: metadata,
    isLoading: isMetaLoading,
    isError: isMetaError,
    error: metaError,
    refetch: refetchMeta,
  } = usePublicMedicalShareMetadataQuery(token);

  const accessMutation = useAccessPublicShareMutation();

  // In-memory recipient session state
  const [activeSession, setActiveSession] = useState<PublicMedicalShareAccessSessionDto | null>(null);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Restore session from sessionStorage if present for same tab refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(`lifeledger_share_sess_${token}`);
        if (saved) {
          const parsed = JSON.parse(saved) as PublicMedicalShareAccessSessionDto;
          // Check if session hasn't expired
          if (new Date(parsed.sessionExpiresAt).getTime() > Date.now()) {
            setActiveSession(parsed);
          } else {
            sessionStorage.removeItem(`lifeledger_share_sess_${token}`);
          }
        }
      } catch {
        // Ignore session parse error
      }
    }
  }, [token]);

  // Handle explicit recipient activation
  const handleActivateShare = async () => {
    setErrorMessage(null);
    try {
      const session = await accessMutation.mutateAsync(token);
      setActiveSession(session);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            `lifeledger_share_sess_${token}`,
            JSON.stringify(session)
          );
        } catch {
          // In-memory state remains intact
        }
      }
      toast.success("Secure viewing session activated.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to open shared medical records.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Handle downloading/viewing a shared report
  const handleDownloadReport = async (report: SharedReportSummaryDto) => {
    if (!activeSession?.sessionToken) {
      toast.error("Active viewing session expired.");
      return;
    }

    try {
      setDownloadingReportId(report.id);
      const res = await medicalShareApi.getSessionReportDownload(
        activeSession.sessionToken,
        report.id
      );

      if (res?.downloadUrl) {
        const link = document.createElement("a");
        link.href = res.downloadUrl;
        link.download = res.originalFilename || report.originalFilename || "medical_document";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Opening document...");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate document download.";
      toast.error(msg);
    } finally {
      setDownloadingReportId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl space-y-6">
        {/* Public Header */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Lock className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold text-white sm:text-xl tracking-tight">
                LifeLedger Secure Share
              </h1>
              <p className="text-xs text-slate-400">
                Encrypted Medical Document Portal
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-semibold"
          >
            Verified Share Link
          </Badge>
        </header>

        {/* Loading State */}
        {isMetaLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <Skeleton className="h-6 w-1/3 bg-slate-800" />
            <Skeleton className="h-20 w-full bg-slate-800 rounded-xl" />
            <Skeleton className="h-10 w-full bg-slate-800 rounded-lg" />
          </div>
        ) : isMetaError || !metadata ? (
          /* Error State: Invalid / Expired / Revoked Share */
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 sm:p-8 text-center space-y-4">
            <div className="grid size-12 place-items-center rounded-full bg-rose-500/20 text-rose-400 mx-auto">
              <AlertTriangle className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Medical Share Inactive or Expired
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                {metaError instanceof Error
                  ? metaError.message
                  : "This medical share link has expired, was revoked by the owner, or has already been consumed."}
              </p>
            </div>

            <div className="rounded-xl bg-slate-900/80 p-4 text-xs text-slate-400 border border-slate-800 max-w-md mx-auto">
              <strong className="text-slate-200 block mb-1">Notice to Healthcare Provider / Recipient:</strong>
              Please request the patient or family member to generate a fresh Medical Share QR code from their LifeLedger account.
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchMeta()}
              className="gap-1.5 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              <RefreshCw className="size-3.5" />
              Retry Lookup
            </Button>
          </div>
        ) : !activeSession ? (
          /* Landing View (Before Explicit Activation) */
          <article className="rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Authorized Medical Records
              </span>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                Health Records for {metadata.subjectDisplayName}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The account holder has authorized secure, read-only access to selected clinical documents for medical evaluation.
              </p>
            </div>

            {/* Share Metadata Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Documents Included
                </span>
                <p className="font-mono text-xl font-bold text-primary">
                  {metadata.reportCount} {metadata.reportCount === 1 ? "Record" : "Records"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Access Policy
                </span>
                <p className="text-xs font-semibold text-slate-200 mt-1 capitalize">
                  {metadata.accessMode === "one_time" ? "One-Time Access" : "Time-Limited"}
                </p>
              </div>
            </div>

            {/* Explanatory Notice */}
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                <Clock className="size-4 text-primary" />
                <span>One-Time Viewing Activation</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-400">
                Opening this share will start the secure viewing session. Once activated, the documents will be available for inspection during this consultation.
              </p>
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {/* Explicit Activation Action */}
            <Button
              onClick={handleActivateShare}
              disabled={accessMutation.isPending}
              size="lg"
              className="w-full gap-2 text-sm font-bold shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 h-12"
            >
              {accessMutation.isPending ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Starting Secure Session...
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Open Shared Medical Records
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </article>
        ) : (
          /* Active Recipient Session: Document Viewer Portal */
          <article className="rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-white">
                    {activeSession.subjectDisplayName}&apos;s Documents
                  </h2>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Session Active
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeSession.reports.length} {activeSession.reports.length === 1 ? "document" : "documents"} authorized for viewing
                </p>
              </div>

              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                Session expires at {new Date(activeSession.sessionExpiresAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
              {activeSession.reports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="grid size-10 place-items-center rounded-lg bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                      <FileText className="size-5" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate">
                          {report.title}
                        </span>
                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700 capitalize">
                          {report.category?.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        Date: {new Date(report.reportDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownloadReport(report)}
                    disabled={downloadingReportId === report.id}
                    size="sm"
                    className="gap-1.5 text-xs font-semibold shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {downloadingReportId === report.id ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                    View / Download
                  </Button>
                </div>
              ))}
            </div>

            {/* Privacy & Clinical Notice */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>Confidentiality Disclosure</span>
              </div>
              <p className="leading-relaxed">
                These documents are delivered via short-lived, signed URLs for clinical consultation. No unselected documents, account history, or personal identifiers are exposed.
              </p>
            </div>
          </article>
        )}

        {/* Footer */}
        <footer className="text-center pt-2 pb-6 text-xs text-slate-500">
          LifeLedger Medical Share Portal &bull; End-to-End Encrypted Delivery
        </footer>
      </div>
    </main>
  );
}
