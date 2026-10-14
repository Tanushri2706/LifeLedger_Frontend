"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Apple,
  ArrowLeft,
  Brain,
  Download,
  Dumbbell,
  Edit,
  FileQuestion,
  FileText,
  FlaskConical,
  HeartPulse,
  HelpCircle,
  Info,
  Loader2,
  Pill,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WidgetCard } from "@/components/dashboard/widgets";
import { Reveal } from "@/components/landing/reveal";
import {
  reportCategories,
  formatCategoryName,
  getCategoryIcon,
  formatDate,
  formatFileSize,
} from "@/components/vault/vault-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useReportDetailQuery,
  useUpdateReportMutation,
  useDeleteReportMutation,
  reportsApi,
  type ReportCategory,
} from "@/features/reports";
import {
  useReportAnalysisQuery,
  useAnalyzeReportMutation,
  type StructuredReportAnalysis,
} from "@/features/ai";

interface PageProps {
  params: Promise<{ reportId: string }>;
}

function getReportAttentionDetails(level?: string) {
  const normalized = level?.toLowerCase();
  switch (normalized) {
    case "critical":
      return {
        label: "Critical attention",
        fullLabel: "Report attention: Critical",
        badgeClass: "bg-emergency/20 text-emergency border border-emergency/30",
      };
    case "high":
      return {
        label: "High attention",
        fullLabel: "Report attention: High",
        badgeClass: "bg-emergency/20 text-emergency border border-emergency/30",
      };
    case "moderate":
      return {
        label: "Moderate attention",
        fullLabel: "Report attention: Moderate",
        badgeClass: "bg-primary-soft text-primary border border-primary/30",
      };
    case "low":
    default:
      return {
        label: "Low attention",
        fullLabel: "Report attention: Low",
        badgeClass: "bg-accent-soft text-accent border border-accent/30",
      };
  }
}

export default function ReportDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { reportId } = use(params);

  // Queries
  const {
    data: report,
    isLoading: isReportLoading,
    isError: isReportError,
    error: reportError,
    refetch: refetchReport,
    isFetching: isReportFetching,
  } = useReportDetailQuery(reportId);

  const { data: analysisData } = useReportAnalysisQuery(reportId);

  // Mutations
  const updateMutation = useUpdateReportMutation();
  const deleteMutation = useDeleteReportMutation();
  const analyzeMutation = useAnalyzeReportMutation();

  // Dialog & Action States
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<string>("other");
  const [editReportDate, setEditReportDate] = useState("");
  const [editHospital, setEditHospital] = useState("");
  const [editDoctor, setEditDoctor] = useState("");

  const handleOpenEdit = () => {
    if (report) {
      setEditTitle(report.title || "");
      setEditCategory(report.category || "other");
      setEditReportDate(
        report.reportDate ? new Date(report.reportDate).toISOString().split("T")[0] : ""
      );
      setEditHospital(report.hospital || "");
      setEditDoctor(report.doctor || "");
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error("Report title cannot be empty.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        reportId,
        payload: {
          title: editTitle.trim(),
          category: editCategory as ReportCategory,
          reportDate: editReportDate || undefined,
          hospital: editHospital.trim() || undefined,
          doctor: editDoctor.trim() || undefined,
        },
      });
      toast.success("Report metadata updated successfully.");
      setIsEditDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update report metadata.");
    }
  };

  const isFamilyReport = report?.subject?.type === "family_member" && Boolean(report?.subject?.id);
  const backUrl = isFamilyReport ? `/family/${report!.subject!.id}` : "/reports";
  const backLabel = isFamilyReport
    ? `Back to ${report!.subject!.displayName || "Family Member"}'s Documents`
    : "Report history";

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(reportId);
      toast.success("Medical report deleted successfully.");
      setIsDeleteDialogOpen(false);
      router.push(backUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete report.");
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    try {
      setIsDownloading(true);
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get secure download URL.");
    } finally {
      setIsDownloading(false);
    }
  };

  const currentStatus = analysisData?.processingStatus ?? report?.processingStatus ?? "pending";
  const isUnreadable = currentStatus === "unreadable";
  const isFailed = currentStatus === "failed";

  const handleAnalyze = async (forceReanalyze = false) => {
    try {
      const result = await analyzeMutation.mutateAsync({
        reportId,
        forceReanalyze,
      });
      if (result.isCached) {
        toast.info("Retrieved existing AI analysis.");
      } else if (result.processingStatus === "unreadable") {
        toast.info(
          result.errorMessage ||
            "We couldn't extract enough clinical information from this document to provide AI health insights."
        );
      } else {
        toast.success("Medical report analyzed successfully with Gemini AI.");
      }
    } catch (err: unknown) {
      const apiErr = err as { statusCode?: number; message?: string };
      if (apiErr?.statusCode === 422) {
        toast.info(
          apiErr.message ||
            "We couldn't extract enough clinical information from this document to provide AI health insights."
        );
      } else {
        toast.error(err instanceof Error ? err.message : "AI analysis failed. Please try again.");
      }
    }
  };

  const isAnalyzing =
    analyzeMutation.isPending ||
    (analysisData?.processingStatus === "processing" && !analysisData?.analysis);

  const analysis: StructuredReportAnalysis | null =
    !isUnreadable && analysisData?.analysis ? analysisData.analysis : null;
  const hasAnalysis = !!analysis;

  const attentionDetails = getReportAttentionDetails(
    analysis?.aiInsights?.riskAssessment?.level
  );

  const hasLifestyleGuidance =
    !!analysis &&
    ((analysis.aiInsights.lifestyleGuidance?.dietSuggestions?.length ?? 0) > 0 ||
      (analysis.aiInsights.lifestyleGuidance?.exerciseSuggestions?.length ?? 0) > 0 ||
      (analysis.aiInsights.lifestyleGuidance?.generalTips?.length ?? 0) > 0);

  const disclaimerText =
    analysisData?.disclaimer ||
    "This AI analysis is for educational and organizational purposes only and does not constitute a medical diagnosis, prognosis, or treatment plan. Always consult a qualified healthcare professional for medical advice and before making healthcare decisions.";

  const IconComponent = getCategoryIcon(report?.category);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="pt-6">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link href={backUrl}>
                <ArrowLeft className="size-4" aria-hidden="true" />
                {backLabel}
              </Link>
            </Button>

            {isReportLoading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-96" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : isReportError ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-card p-10 text-center shadow-sm">
                <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="size-6" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold">
                  Medical report not found
                </h2>
                <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                  {reportError instanceof Error
                    ? reportError.message
                    : "The requested medical report could not be found or you do not have permission to view it."}
                </p>
                <div className="mt-6 flex gap-3">
                  <Button asChild variant="outline">
                    <Link href={backUrl}>Back</Link>
                  </Button>
                  <Button
                    onClick={() => refetchReport()}
                    disabled={isReportFetching}
                    className="gap-2"
                  >
                    <RefreshCw className={`size-4 ${isReportFetching ? "animate-spin" : ""}`} />
                    Try again
                  </Button>
                </div>
              </div>
            ) : report ? (
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {isFamilyReport ? (
                      <Badge className="bg-primary/10 text-primary border-primary/30 font-semibold text-xs">
                        Health Record for {report.subject?.displayName}
                      </Badge>
                    ) : null}
                    <span className="font-medium text-primary">
                      {formatCategoryName(report.category)}
                    </span>
                    <span>·</span>
                    <span>{formatDate(report.reportDate)}</span>
                    <span>·</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {currentStatus}
                    </Badge>
                  </div>
                  <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {report.title}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isFamilyReport
                      ? `Family Vault: ${report.subject?.displayName} (${report.subject?.relationship || "Profile"})`
                      : report.hospital || "Registered in Personal Health Vault"}
                    {report.doctor ? ` · Doctor: ${report.doctor}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {/* AI Analysis Action Button */}
                  {hasAnalysis ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleAnalyze(true)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : (
                        <RefreshCw className="size-4 text-primary" />
                      )}
                      Re-analyze with AI
                    </Button>
                  ) : isUnreadable ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleAnalyze(true)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : (
                        <RefreshCw className="size-4 text-primary" />
                      )}
                      {isAnalyzing ? "Analyzing..." : "Re-analyze Document"}
                    </Button>
                  ) : isFailed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleAnalyze(true)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : (
                        <RefreshCw className="size-4 text-primary" />
                      )}
                      {isAnalyzing ? "Retrying..." : "Retry Analysis"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleAnalyze(false)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      {isAnalyzing ? "Analyzing..." : "Analyze Report Now"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleOpenEdit}
                  >
                    <Edit className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:bg-destructive/10"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Reveal>

        {report && !isReportLoading && !isReportError ? (
          <div className="mt-6 space-y-6 pb-8">
            {/* Document Details & AI Health Assistant Cards */}
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <Reveal>
                <WidgetCard
                  title="Document Details"
                  icon={FileText}
                  action={
                    <Badge variant="secondary">
                      {report.fileType.toUpperCase()} · {formatFileSize(report.fileSize)}
                    </Badge>
                  }
                >
                  <div className="rounded-lg bg-surface p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
                        <IconComponent className="size-6" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{report.originalFilename}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          MIME: {report.mimeType} · {formatFileSize(report.fileSize)}
                        </p>
                      </div>
                    </div>

                    <dl className="grid gap-3 pt-3 border-t border-border sm:grid-cols-2 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Category</dt>
                        <dd className="font-medium mt-0.5">{formatCategoryName(report.category)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Report Date</dt>
                        <dd className="font-medium mt-0.5">{formatDate(report.reportDate)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Facility / Lab</dt>
                        <dd className="font-medium mt-0.5">{report.hospital || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Consulting Doctor</dt>
                        <dd className="font-medium mt-0.5">{report.doctor || "Not specified"}</dd>
                      </div>
                    </dl>
                  </div>

                  <Button
                    variant="outline"
                    className="mt-5 w-full gap-2"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    Download / Open Document
                  </Button>
                </WidgetCard>
              </Reveal>

              {/* AI Processing / Status Summary Card */}
              <Reveal delay={0.04}>
                <WidgetCard
                  title="AI Health Assistant"
                  icon={Sparkles}
                  variant="ai"
                  action={
                    <Badge variant="secondary" className="capitalize">
                      Status: {currentStatus}
                    </Badge>
                  }
                >
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                      <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary animate-pulse">
                        <Sparkles className="size-6 animate-spin" />
                      </div>
                      <p className="font-semibold text-sm">Analyzing your report securely…</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Extracting clinical markers and generating structured health insights with
                        Gemini AI. This usually takes a few seconds.
                      </p>
                    </div>
                  ) : isUnreadable ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                        <FileQuestion className="size-6" />
                      </span>
                      <p className="font-semibold text-sm text-foreground">
                        Insufficient Clinical Information
                      </p>
                      <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                        {analysisData?.errorMessage ||
                          "We couldn't extract enough clinical information from this document to provide AI health insights."}
                      </p>
                      <div className="w-full rounded-lg border border-border bg-surface/80 p-3 text-left space-y-1.5 text-[0.75rem] text-muted-foreground mt-1">
                        <p className="font-medium text-foreground">Important Safety Notes:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>No health assessment, risk score, or clinical summary was generated for this document.</li>
                          <li>
                            The absence of extracted findings does <strong className="text-foreground font-semibold">not</strong> mean the report is normal or low risk.
                          </li>
                          <li>This document may be scanned or may not contain readable clinical text.</li>
                        </ul>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalyze(true)}
                        disabled={isAnalyzing}
                        className="mt-2 gap-1.5"
                      >
                        <RefreshCw className="size-3.5" />
                        Re-analyze Document
                      </Button>
                    </div>
                  ) : hasAnalysis && analysis ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          AI Interpretation
                        </p>
                        <p className="text-[0.75rem] text-muted-foreground mt-0.5">
                          An informational interpretation of the extracted findings in this report.
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">
                        {analysis.aiInsights.summary}
                      </p>
                      <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`gap-1.5 text-xs font-medium ${attentionDetails.badgeClass}`}
                          >
                            <Brain className="size-3.5" />
                            {attentionDetails.fullLabel}
                          </Badge>
                        </div>
                        <p className="text-[0.7rem] text-muted-foreground">
                          Based only on findings in this uploaded report.
                        </p>
                      </div>
                    </div>
                  ) : isFailed ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                      <AlertTriangle className="size-8 text-destructive" />
                      <p className="font-semibold text-sm text-destructive">
                        AI Analysis Encountered an Issue
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {analysisData?.errorMessage ||
                          "The AI pipeline could not complete processing for this document."}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalyze(true)}
                        className="mt-2 gap-1.5"
                      >
                        <RefreshCw className="size-3.5" />
                        Retry Analysis
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                      <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                        <Sparkles className="size-5" />
                      </span>
                      <p className="font-semibold text-sm">AI Analysis Ready</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Extract biomarker facts, clinical summaries, and personalized lifestyle insights
                        from this document using Gemini AI.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleAnalyze(false)}
                        className="mt-2 gap-1.5"
                      >
                        <Sparkles className="size-3.5" />
                        Analyze Report Now
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[0.7rem] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="size-3 text-success" />
                      Privacy-First Gemini Pipeline
                    </span>
                    {!isUnreadable && analysis?.metadata?.analyzedAt ? (
                      <span>Analyzed: {formatDate(analysis.metadata.analyzedAt)}</span>
                    ) : null}
                  </div>
                </WidgetCard>
              </Reveal>
            </div>

            {/* If Analysis is Present: Render Complete Structured Sections */}
            {hasAnalysis && analysis ? (
              <div className="space-y-6 pt-2">
                {/* Urgent Warning Section (Only if emergency signal is active) */}
                {analysis.aiInsights.emergencySignals?.isEmergency ||
                analysis.aiInsights.emergencySignals?.warningDetails ? (
                  <Reveal>
                    <div className="rounded-xl border border-emergency/40 bg-emergency/10 p-5 space-y-2.5">
                      <div className="flex items-center gap-2 font-semibold text-emergency">
                        <ShieldAlert className="size-5 shrink-0" />
                        <span className="text-sm sm:text-base">Urgent Information</span>
                      </div>
                      {analysis.aiInsights.emergencySignals.warningDetails ? (
                        <p className="text-sm text-foreground leading-relaxed">
                          {analysis.aiInsights.emergencySignals.warningDetails}
                        </p>
                      ) : null}
                      {analysis.aiInsights.emergencySignals.emergencyAdvice ? (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {analysis.aiInsights.emergencySignals.emergencyAdvice}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium text-emergency">
                        <span>India Emergency Helpline: <strong>112</strong></span>
                        <span>·</span>
                        <span>Ambulance: <strong>108</strong></span>
                      </div>
                    </div>
                  </Reveal>
                ) : null}

                {/* SECTION 1: EXTRACTED SOURCE FACTS */}
                <Reveal>
                  <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="size-5 text-primary" />
                        <h2 className="font-display text-lg font-semibold tracking-tight">
                          Extracted from your report
                        </h2>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Direct Document Extraction (Non-interpretive)
                      </Badge>
                    </div>

                    {/* Extracted Lab Values / Biomarkers Table */}
                    <WidgetCard
                      title="Extracted Biomarkers & Test Values"
                      icon={FlaskConical}
                      action={
                        <span className="text-xs text-muted-foreground">
                          {analysis.sourceFacts.extractedValues.length} values extracted
                        </span>
                      }
                    >
                      {analysis.sourceFacts.extractedValues.length === 0 ? (
                        <p className="rounded-lg bg-surface p-4 text-xs text-muted-foreground">
                          No specific numeric lab test values were detected in this document.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                              <tr className="border-b border-border text-muted-foreground">
                                <th className="pb-3 font-semibold">Test / Biomarker</th>
                                <th className="pb-3 font-semibold">Measured Value</th>
                                <th className="pb-3 font-semibold">Reference Range</th>
                                <th className="pb-3 font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {analysis.sourceFacts.extractedValues.map((val, idx) => (
                                <tr key={`${val.testName}-${idx}`} className="hover:bg-surface/50">
                                  <td className="py-3 font-medium">
                                    {val.testName}
                                    {val.sourceContext ? (
                                      <p className="text-[0.7rem] text-muted-foreground font-normal">
                                        {val.sourceContext}
                                      </p>
                                    ) : null}
                                  </td>
                                  <td className="py-3 font-semibold text-foreground">
                                    {val.value} {val.unit || ""}
                                  </td>
                                  <td className="py-3 text-muted-foreground">
                                    {val.referenceRange || "—"}
                                  </td>
                                  <td className="py-3">
                                    {val.isAbnormal ||
                                    (val.flag && val.flag.toUpperCase() !== "NORMAL") ? (
                                      <Badge
                                        variant="secondary"
                                        className="bg-emergency/15 text-emergency text-[0.7rem]"
                                      >
                                        {val.flag ? val.flag.toUpperCase() : "ABNORMAL"}
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="secondary"
                                        className="bg-accent-soft text-accent text-[0.7rem]"
                                      >
                                        NORMAL
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </WidgetCard>

                    {/* Documented Diagnoses & Medications (only when present) */}
                    {analysis.sourceFacts.documentedDiagnoses.length > 0 ||
                    analysis.sourceFacts.documentedMedications.length > 0 ? (
                      <div className="grid gap-6 sm:grid-cols-2">
                        {/* Documented Diagnoses */}
                        {analysis.sourceFacts.documentedDiagnoses.length > 0 ? (
                          <WidgetCard
                            title="Documented Diagnoses"
                            icon={Stethoscope}
                            action={
                              <Badge variant="outline" className="text-[0.65rem]">
                                Documented in this report
                              </Badge>
                            }
                          >
                            <ul className="space-y-2">
                              {analysis.sourceFacts.documentedDiagnoses.map((diag, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-2 rounded-lg bg-surface p-3 text-xs sm:text-sm font-medium"
                                >
                                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                                  <span className="min-w-0">{diag}</span>
                                </li>
                              ))}
                            </ul>
                          </WidgetCard>
                        ) : null}

                        {/* Documented Medications */}
                        {analysis.sourceFacts.documentedMedications.length > 0 ? (
                          <WidgetCard
                            title="Documented Medications"
                            icon={Pill}
                            action={
                              <Badge variant="outline" className="text-[0.65rem]">
                                Documented in this report
                              </Badge>
                            }
                          >
                            <div className="space-y-2.5">
                              <ul className="space-y-2">
                                {analysis.sourceFacts.documentedMedications.map((med, i) => (
                                  <li
                                    key={i}
                                    className="rounded-lg bg-surface p-3 text-xs sm:text-sm space-y-1"
                                  >
                                    <div className="flex items-center justify-between font-semibold">
                                      <span>{med.name}</span>
                                      {med.dosage ? (
                                        <Badge variant="outline" className="text-[0.65rem]">
                                          {med.dosage}
                                        </Badge>
                                      ) : null}
                                    </div>
                                    {med.frequency ? (
                                      <p className="text-xs text-muted-foreground">
                                        Frequency: {med.frequency}
                                      </p>
                                    ) : null}
                                    {med.instructions ? (
                                      <p className="text-xs text-muted-foreground">
                                        {med.instructions}
                                      </p>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                              <p className="text-[0.7rem] text-muted-foreground italic pt-1">
                                * Extracted from document. Always consult your doctor before changing medication.
                              </p>
                            </div>
                          </WidgetCard>
                        ) : null}
                      </div>
                    ) : null}
                  </section>
                </Reveal>

                {/* SECTION 2: AI HEALTH INSIGHTS */}
                <Reveal delay={0.06}>
                  <section className="space-y-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-primary" />
                        <h2 className="font-display text-lg font-semibold tracking-tight">
                          AI Interpretation & Insights
                        </h2>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Educational & Clinical Synthesis
                      </Badge>
                    </div>

                    {/* Key Findings to Review & AI Attention Assessment */}
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                      {/* Key Findings to Review */}
                      <WidgetCard title="Key findings to review" icon={Sparkles} variant="ai">
                        {analysis.aiInsights.keyFindings.length === 0 &&
                        analysis.aiInsights.potentialConcerns.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No notable abnormal clinical findings identified.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {analysis.aiInsights.keyFindings.length > 0 ? (
                              <ul className="space-y-2.5 text-sm leading-relaxed">
                                {analysis.aiInsights.keyFindings.map((finding, idx) => (
                                  <li key={idx} className="flex gap-2.5">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                    <span className="min-w-0 text-foreground">{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}

                            {analysis.aiInsights.potentialConcerns.length > 0 ? (
                              <div className="space-y-2.5 pt-2 border-t border-border">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Potential Considerations
                                </p>
                                <div className="space-y-2">
                                  {analysis.aiInsights.potentialConcerns.map((concern, idx) => (
                                    <div key={idx} className="rounded-lg bg-surface p-3 space-y-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-xs sm:text-sm text-foreground">
                                          {concern.concern}
                                        </p>
                                        <Badge
                                          variant="outline"
                                          className={`text-[0.65rem] capitalize shrink-0 ${
                                            concern.severity === "high"
                                              ? "border-emergency text-emergency"
                                              : concern.severity === "moderate"
                                                ? "border-primary text-primary"
                                                : "border-accent text-accent"
                                          }`}
                                        >
                                          {concern.severity}
                                        </Badge>
                                      </div>
                                      <p className="text-xs leading-relaxed text-muted-foreground">
                                        {concern.possibleRelevance}
                                      </p>
                                      {concern.sourceRef ? (
                                        <p className="text-[0.7rem] text-primary/80 font-medium">
                                          Referenced from: {concern.sourceRef}
                                        </p>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </WidgetCard>

                      {/* AI Attention Assessment (Clear non-score presentation) */}
                      <WidgetCard title="AI Attention Assessment" icon={HeartPulse}>
                        <div className="space-y-3">
                          <div className="rounded-lg bg-surface p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground font-medium">
                                Report Attention Level
                              </span>
                              <Badge
                                variant="secondary"
                                className={`capitalize text-xs font-semibold ${attentionDetails.badgeClass}`}
                              >
                                {attentionDetails.label}
                              </Badge>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {analysis.aiInsights.riskAssessment.explanation}
                            </p>
                            <p className="text-[0.7rem] text-muted-foreground pt-1 border-t border-border">
                              Based only on findings in this uploaded report.
                            </p>
                          </div>
                        </div>
                      </WidgetCard>
                    </div>

                    {/* Things to Discuss with a Doctor */}
                    {analysis.aiInsights.questionsForDoctor.length > 0 ? (
                      <WidgetCard title="Things to discuss with your doctor" icon={HelpCircle}>
                        <ul className="space-y-2.5">
                          {analysis.aiInsights.questionsForDoctor.map((q, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 rounded-lg bg-surface p-3 text-xs sm:text-sm"
                            >
                              <span className="grid size-5 place-items-center rounded-full bg-primary-soft text-primary font-semibold text-[0.7rem] shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="min-w-0 text-foreground">{q}</span>
                            </li>
                          ))}
                        </ul>
                      </WidgetCard>
                    ) : null}

                    {/* General Care / Lifestyle Guidance */}
                    {hasLifestyleGuidance ? (
                      <WidgetCard
                        title="General guidance"
                        icon={Activity}
                        action={
                          <span className="text-[0.7rem] text-muted-foreground hidden sm:inline">
                            Informational suggestions
                          </span>
                        }
                      >
                        <div className="space-y-4">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            These suggestions are informational and should be considered alongside advice from a qualified healthcare professional.
                          </p>
                          <div className="grid gap-4 sm:grid-cols-3">
                            {/* Diet Considerations */}
                            {(analysis.aiInsights.lifestyleGuidance?.dietSuggestions || []).length > 0 ? (
                              <div className="rounded-lg bg-surface p-4 space-y-2">
                                <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                                  <Apple className="size-4 text-accent" />
                                  <span>Diet considerations</span>
                                </div>
                                <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                                  {analysis.aiInsights.lifestyleGuidance.dietSuggestions?.map((item, i) => (
                                    <li key={i} className="flex gap-2">
                                      <span className="size-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

                            {/* Exercise Considerations */}
                            {(analysis.aiInsights.lifestyleGuidance?.exerciseSuggestions || []).length > 0 ? (
                              <div className="rounded-lg bg-surface p-4 space-y-2">
                                <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                                  <Dumbbell className="size-4 text-primary" />
                                  <span>Activity / exercise considerations</span>
                                </div>
                                <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                                  {analysis.aiInsights.lifestyleGuidance.exerciseSuggestions?.map((item, i) => (
                                    <li key={i} className="flex gap-2">
                                      <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

                            {/* General Wellness Tips */}
                            {(analysis.aiInsights.lifestyleGuidance?.generalTips || []).length > 0 ? (
                              <div className="rounded-lg bg-surface p-4 space-y-2">
                                <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                                  <Activity className="size-4 text-primary-soft" />
                                  <span>General wellness tips</span>
                                </div>
                                <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                                  {analysis.aiInsights.lifestyleGuidance.generalTips?.map((item, i) => (
                                    <li key={i} className="flex gap-2">
                                      <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </WidgetCard>
                    ) : null}
                  </section>
                </Reveal>
              </div>
            ) : null}

            {/* Health Timeline Event Connection */}
            <Reveal delay={0.08}>
              <WidgetCard
                title="Timeline Event"
                icon={HeartPulse}
                action={
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/timeline">View timeline</Link>
                  </Button>
                }
              >
                <div className="relative border-l border-border pl-6">
                  <span className="absolute -left-[0.95rem] grid size-7 place-items-center rounded-full border border-border bg-card text-primary">
                    <FileText className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="surface-calm p-4">
                    <p className="text-xs text-muted-foreground">{formatDate(report.reportDate)}</p>
                    <p className="mt-1 text-sm font-semibold">{report.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {report.hospital || formatCategoryName(report.category)}
                    </p>
                    <p className="mt-3 rounded-md bg-surface px-3 py-2 text-xs text-muted-foreground">
                      {hasAnalysis
                        ? "AI analysis completed and registered to your personal health timeline."
                        : isUnreadable
                          ? "Medical report registered in health vault. AI analysis was unable to extract readable clinical text."
                          : "Medical report registered in health vault. Automatically synchronized with your personal health records."}
                    </p>
                  </div>
                </div>
              </WidgetCard>
            </Reveal>

            {/* Mandatory Medical Disclaimer & Limitations */}
            <Reveal delay={0.1}>
              <aside
                role="note"
                className="flex gap-3 rounded-xl border border-primary/20 bg-primary-soft/60 p-4 sm:p-5"
              >
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-card text-primary">
                  <Info className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Medical Disclaimer & Limitations</p>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    This analysis is based only on this uploaded report and does not represent a complete assessment of your health. {disclaimerText}
                  </p>
                </div>
              </aside>
            </Reveal>
          </div>
        ) : null}

        {/* Edit Metadata Modal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Report Metadata</DialogTitle>
              <DialogDescription>
                Update the document information and classification in your vault.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">Report Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportCategories
                        .filter((c) => c.id !== "all")
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-date">Report Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editReportDate}
                    onChange={(e) => setEditReportDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-hospital">Hospital / Diagnostic Lab</Label>
                <Input
                  id="edit-hospital"
                  value={editHospital}
                  onChange={(e) => setEditHospital(e.target.value)}
                  placeholder="e.g. Dr. Lal PathLabs"
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-doctor">Consulting Doctor</Label>
                <Input
                  id="edit-doctor"
                  value={editDoctor}
                  onChange={(e) => setEditDoctor(e.target.value)}
                  placeholder="e.g. Dr. Meera Iyer"
                  maxLength={100}
                />
              </div>

              <DialogFooter className="mt-6 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Alert Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Medical Report</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{report?.title}&quot;? This will remove the document
                from your health ledger and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Report"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardShell>
  );
}
