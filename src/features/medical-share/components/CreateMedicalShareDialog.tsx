"use client";

import { useState, useMemo } from "react";
import {
  Share2,
  Check,
  Copy,
  Printer,
  ExternalLink,
  ShieldCheck,
  FileText,
  RefreshCw,
  QrCode,
  CheckSquare,
  Square,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useReportsQuery } from "@/features/reports";
import { useFamilyMemberReportsQuery } from "@/features/family/family-hooks";
import { useCreateMedicalShareMutation } from "../medical-share-hooks";
import { generateQrMatrix } from "@/features/emergency/qr-encoder";
import type {
  MedicalShareAccessMode,
  MedicalShareCreatedResponseDto,
} from "../medical-share-types";

export interface CreateMedicalShareDialogProps {
  subjectType?: "user" | "family_member";
  subjectId?: string;
  memberId?: string; // backwards-compatible alias for subjectId
  memberDisplayName?: string;
  memberRelationship?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ShareStep = "select_reports" | "select_policy" | "qr_result";

export function CreateMedicalShareDialog({
  subjectType,
  subjectId,
  memberId,
  memberDisplayName,
  memberRelationship,
  open,
  onOpenChange,
}: CreateMedicalShareDialogProps) {
  const { user } = useAuth();
  const effectiveSubjectType = subjectType || (memberId ? "family_member" : "user");
  const isPersonal = effectiveSubjectType === "user";
  const effectiveSubjectId = subjectId || memberId || user?.id || "";

  const [step, setStep] = useState<ShareStep>("select_reports");
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [accessMode, setAccessMode] = useState<MedicalShareAccessMode>("one_time");
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(15);
  const [createdShare, setCreatedShare] = useState<MedicalShareCreatedResponseDto | null>(null);
  const [copied, setCopied] = useState(false);

  // 1. Personal reports query (only fetched when in personal mode)
  const { data: personalReportsData, isLoading: isPersonalLoading } = useReportsQuery(
    isPersonal ? { limit: 100 } : undefined
  );

  // 2. Family member reports query (only fetched when in family member mode)
  const { data: familyReportsData, isLoading: isFamilyLoading } = useFamilyMemberReportsQuery(
    !isPersonal ? effectiveSubjectId : ""
  );

  // Derive reports list with strict personal isolation
  const reports = useMemo(() => {
    if (isPersonal) {
      const allPersonal = personalReportsData?.reports || [];
      // Guarantee only personal reports: exclude any family member reports
      return allPersonal.filter(
        (r) => !r.subject || r.subject.type === "user" || (user?.id && r.subject.id === user.id)
      );
    }
    return familyReportsData?.reports || [];
  }, [isPersonal, personalReportsData?.reports, familyReportsData?.reports, user?.id]);

  const isReportsLoading = isPersonal ? isPersonalLoading : isFamilyLoading;

  const createMutation = useCreateMedicalShareMutation();

  const resetDialog = () => {
    setStep("select_reports");
    setSelectedReportIds([]);
    setAccessMode("one_time");
    setExpiresInMinutes(15);
    setCreatedShare(null);
    setCopied(false);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      resetDialog();
    }
    onOpenChange(newOpen);
  };

  const toggleSelectAll = () => {
    if (selectedReportIds.length === reports.length) {
      setSelectedReportIds([]);
    } else {
      setSelectedReportIds(reports.map((r) => r.id));
    }
  };

  const toggleReport = (id: string) => {
    setSelectedReportIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleProceedToPolicy = () => {
    if (selectedReportIds.length === 0) {
      toast.error("Please select at least one medical document to share.");
      return;
    }
    setStep("select_policy");
  };

  const handleCreateShare = async () => {
    if (selectedReportIds.length === 0) {
      toast.error("Please select at least one medical document to share.");
      return;
    }

    try {
      const response = await createMutation.mutateAsync({
        subjectType: isPersonal ? "user" : "family_member",
        subjectId: isPersonal ? (user?.id || effectiveSubjectId) : effectiveSubjectId,
        reportIds: selectedReportIds,
        accessMode,
        expiresInMinutes: accessMode === "time_limited" ? expiresInMinutes : undefined,
      });

      setCreatedShare(response);
      setStep("qr_result");
    } catch {
      // Handled in mutation toast
    }
  };

  // Derive public share URL for QR
  const shareUrl = useMemo(() => {
    if (!createdShare?.rawToken) return "";
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://lifeledger.in";
    return `${origin}/medical-share/${createdShare.rawToken}`;
  }, [createdShare?.rawToken]);

  // Generate QR Matrix
  const qrMatrix = useMemo(() => {
    if (!shareUrl) return null;
    try {
      return generateQrMatrix(shareUrl);
    } catch {
      return null;
    }
  }, [shareUrl]);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Secure medical share link copied to clipboard.");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const targetDisplayName = isPersonal
    ? "Your Personal Health Vault"
    : memberDisplayName || "Family Member";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Share2 className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-lg">
                {step === "qr_result" ? "Secure Medical Share Ready" : "Share Medical Records"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isPersonal ? (
                  <>Sharing records from: <strong className="text-foreground">Your Personal Health Vault</strong></>
                ) : (
                  <>
                    Sharing records for: <strong className="text-foreground">{memberDisplayName}</strong>{" "}
                    {memberRelationship ? `· ${memberRelationship}` : ""}
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* STEP 1: REPORT SELECTION */}
        {step === "select_reports" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-xs font-semibold text-foreground">
                Select Documents ({selectedReportIds.length} of {reports.length} selected)
              </span>
              {reports.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="h-7 text-xs text-primary hover:text-primary"
                >
                  {selectedReportIds.length === reports.length ? "Deselect All" : "Select All"}
                </Button>
              )}
            </div>

            {isReportsLoading ? (
              <div className="space-y-2.5">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            ) : reports.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-surface/40 p-6 text-center text-xs text-muted-foreground">
                <FileText className="size-6 mx-auto mb-2 text-muted-foreground" />
                {isPersonal
                  ? "No medical documents found in your personal vault. Please upload medical documents before creating a share."
                  : `No documents found for ${targetDisplayName}. Please upload medical documents before creating a share.`}
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {reports.map((report) => {
                  const isSelected = selectedReportIds.includes(report.id);
                  return (
                    <div
                      key={report.id}
                      onClick={() => toggleReport(report.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border/70 hover:border-border bg-card"
                      }`}
                    >
                      <span className="mt-0.5 text-primary">
                        {isSelected ? (
                          <CheckSquare className="size-4.5 text-primary" />
                        ) : (
                          <Square className="size-4.5 text-muted-foreground" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-foreground truncate">
                          {report.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className="capitalize">{report.category.replace("_", " ")}</span>
                          <span>•</span>
                          <span>
                            {new Date(report.reportDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {report.hospital ? (
                            <>
                              <span>•</span>
                              <span>{report.hospital}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleProceedToPolicy}
                disabled={selectedReportIds.length === 0}
                className="gap-1.5 font-semibold"
              >
                <span>Continue ({selectedReportIds.length} Selected)</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 2: SHARE POLICY */}
        {step === "select_policy" && (
          <div className="space-y-4 py-2">
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                How should this share work?
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose an access policy for the recipient.
              </p>
            </div>

            <RadioGroup
              value={accessMode}
              onValueChange={(val) => setAccessMode(val as MedicalShareAccessMode)}
              className="space-y-3"
            >
              {/* Option A: One-time */}
              <div
                onClick={() => setAccessMode("one_time")}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                  accessMode === "one_time"
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-card hover:border-border"
                }`}
              >
                <RadioGroupItem value="one_time" id="mode-onetime" className="mt-0.5" />
                <div className="space-y-1">
                  <Label htmlFor="mode-onetime" className="font-semibold text-xs text-foreground cursor-pointer">
                    One-Time Access (Recommended for Doctor Visits)
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Recipient can unlock this share once. After unlocking, the selected documents remain available only for the short secure viewing session.
                  </p>
                </div>
              </div>

              {/* Option B: Time-Limited */}
              <div
                onClick={() => setAccessMode("time_limited")}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                  accessMode === "time_limited"
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-card hover:border-border"
                }`}
              >
                <RadioGroupItem value="time_limited" id="mode-timelimited" className="mt-0.5" />
                <div className="space-y-2 flex-1">
                  <div>
                    <Label htmlFor="mode-timelimited" className="font-semibold text-xs text-foreground cursor-pointer">
                      Temporary Time-Limited Access
                    </Label>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Allows viewing during a defined emergency or consultation window.
                    </p>
                  </div>

                  {accessMode === "time_limited" && (
                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={expiresInMinutes === 15 ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpiresInMinutes(15);
                        }}
                        className="h-8 text-xs"
                      >
                        15 Minutes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={expiresInMinutes === 60 ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpiresInMinutes(60);
                        }}
                        className="h-8 text-xs"
                      >
                        1 Hour
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </RadioGroup>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep("select_reports")}
                disabled={createMutation.isPending}
                className="gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <Button
                onClick={handleCreateShare}
                disabled={createMutation.isPending}
                className="gap-2 font-semibold"
              >
                {createMutation.isPending ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Generating Secure Share...
                  </>
                ) : (
                  <>
                    <QrCode className="size-4" />
                    Generate Share QR
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 3: QR RESULT */}
        {step === "qr_result" && createdShare && (
          <div className="space-y-5 py-2">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Crisp SVG QR Code */}
              <div className="flex flex-col items-center rounded-2xl border-2 border-border/80 bg-card p-3.5 shadow-md shrink-0">
                {qrMatrix ? (
                  <svg
                    viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                    className="size-44 rounded-lg shape-rendering-crispEdges"
                    aria-label="Scannable Medical Share QR"
                  >
                    <rect width="100%" height="100%" fill="white" />
                    {qrMatrix.map((row, r) =>
                      row.map((isDark, c) =>
                        isDark ? (
                          <rect
                            key={`${r}-${c}`}
                            x={c}
                            y={r}
                            width="1"
                            height="1"
                            fill="#09090b"
                          />
                        ) : null
                      )
                    )}
                  </svg>
                ) : (
                  <div className="grid size-44 place-items-center bg-muted text-xs text-muted-foreground">
                    Generating QR...
                  </div>
                )}
                <span className="mt-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Scan to View Records
                </span>
              </div>

              {/* Summary details */}
              <div className="space-y-2.5 flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                    {createdShare.selectedReportCount} {createdShare.selectedReportCount === 1 ? "Document" : "Documents"} Included
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {createdShare.accessMode === "one_time" ? "One-Time Access" : "Time-Limited"}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isPersonal ? (
                    <>
                      Only the <strong className="text-foreground">{createdShare.selectedReportCount} selected documents</strong> from your personal vault are accessible through this link.
                    </>
                  ) : (
                    <>
                      Only the <strong className="text-foreground">{createdShare.selectedReportCount} selected documents</strong> for <strong className="text-foreground">{memberDisplayName}</strong> are accessible through this link.
                    </>
                  )}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={handleCopyLink}
                    className="gap-1.5 text-xs shadow-sm"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy Link"}
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                  >
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3.5" />
                      Preview
                    </a>
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handlePrint}
                    className="gap-1.5 text-xs"
                  >
                    <Printer className="size-3.5" />
                    Print
                  </Button>
                </div>
              </div>
            </div>

            {/* Privacy Assurance Box */}
            <div className="rounded-xl border border-border/60 bg-surface/80 p-3 text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Strict Security Boundary</span>
              </div>
              <p>
                Anyone with this QR or link may access the selected records while the share is valid. No password, login, or personal profile history is exposed.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button onClick={() => handleClose(false)} className="w-full sm:w-auto">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
