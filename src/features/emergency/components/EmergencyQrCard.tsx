"use client";

import { useState, useMemo, useRef } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Printer,
  QrCode,
  RefreshCw,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  useEmergencyQRQuery,
  useRotateEmergencyQRMutation,
} from "../emergency-hooks";
import { generateQrMatrix } from "../qr-encoder";

export function EmergencyQrCard() {
  const { data: qr, isLoading, isError, error, refetch } = useEmergencyQRQuery();
  const rotateMutation = useRotateEmergencyQRMutation();

  const [isRotateConfirmOpen, setIsRotateConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Compute public scan URL
  const publicScannerUrl = useMemo(() => {
    if (!qr?.qrToken) return "";
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://lifeledger.in";
    return `${origin}/emergency/info/${qr.qrToken}`;
  }, [qr?.qrToken]);

  // Generate QR Matrix
  const qrMatrix = useMemo(() => {
    if (!publicScannerUrl) return null;
    try {
      return generateQrMatrix(publicScannerUrl);
    } catch {
      return null;
    }
  }, [publicScannerUrl]);

  const handleCopyLink = () => {
    if (!publicScannerUrl) return;
    navigator.clipboard.writeText(publicScannerUrl);
    setCopied(true);
    toast.success("Emergency QR scanner link copied to clipboard.");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRotateConfirm = async () => {
    try {
      await rotateMutation.mutateAsync();
      setIsRotateConfirmOpen(false);
    } catch {
      // Handled by mutation toast
    }
  };

  const handlePrintCard = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="surface-calm rounded-2xl border border-border/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <Skeleton className="size-48 rounded-xl" />
          <div className="flex-1 space-y-3 w-full">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="surface-calm flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="size-6 text-destructive mb-2" />
        <h4 className="font-semibold text-foreground text-sm">Failed to load Emergency QR</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {error?.message || "Could not retrieve your QR token."}
        </p>
        <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <section
        ref={cardRef}
        className="surface-calm rounded-2xl border border-border/60 p-5 sm:p-6"
        aria-label="Emergency Life-Saving QR Code"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-emergency/15 text-emergency">
              <QrCode className="size-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
                  Emergency Medical QR Card
                </h3>
                <Badge className="bg-emerald-600/15 text-emerald-700 border-emerald-600/30 dark:text-emerald-400 font-semibold text-xs" variant="outline">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Scannable by any smartphone camera for immediate first-responder access
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRotateConfirmOpen(true)}
            disabled={rotateMutation.isPending}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCw className={`size-3.5 ${rotateMutation.isPending ? "animate-spin" : ""}`} />
            Regenerate QR Token
          </Button>
        </div>

        {/* QR Display and Actions Layout */}
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* High-Resolution SVG QR Matrix */}
          <div className="relative flex flex-col items-center rounded-2xl border-2 border-border/80 bg-card p-4 shadow-md shrink-0">
            {qrMatrix ? (
              <svg
                viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                className="size-48 sm:size-52 rounded-lg shape-rendering-crispEdges"
                aria-label="Scannable Emergency QR Code"
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
              <div className="grid size-48 place-items-center bg-muted text-xs text-muted-foreground">
                Generating QR...
              </div>
            )}

            <span className="mt-2 text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
              Scan with camera
            </span>
          </div>

          {/* Details & Quick Action Buttons */}
          <div className="flex-1 space-y-4 text-center sm:text-left min-w-0">
            <div>
              <h4 className="font-semibold text-sm sm:text-base text-foreground">
                First-Responder Access
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Your Emergency QR encodes only the secure public link to your emergency summary. Responders see your blood group, allergies, medical conditions, and emergency contacts.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              {qr?.bloodGroup ? (
                <Badge variant="secondary" className="font-semibold">
                  Blood: {qr.bloodGroup}
                </Badge>
              ) : null}
              <Badge variant="secondary">
                {qr?.emergencyContacts?.length || 0} Contacts Configured
              </Badge>
              {qr?.accessCount !== undefined && qr.accessCount > 0 ? (
                <Badge variant="outline" className="gap-1 text-[11px]">
                  <Eye className="size-3" />
                  Scanned {qr.accessCount} {qr.accessCount === 1 ? "time" : "times"}
                </Badge>
              ) : null}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <Button
                size="sm"
                variant="default"
                onClick={handleCopyLink}
                className="gap-1.5 shadow-sm"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Link Copied" : "Copy Scanner URL"}
              </Button>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="gap-1.5"
              >
                <a href={publicScannerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  Preview Public View
                </a>
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={handlePrintCard}
                className="gap-1.5"
              >
                <Printer className="size-3.5" />
                Print / Save Card
              </Button>
            </div>

            {/* Privacy Assurance Note */}
            <div className="rounded-xl border border-border/60 bg-surface/80 p-3 text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="size-3.5 text-success" />
                <span>Strict Privacy Guarantee</span>
              </div>
              <p>
                No uploaded medical reports, OCR extractions, AI summaries, or account passwords can be accessed through this QR code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Rotation Confirmation Dialog */}
      <AlertDialog
        open={isRotateConfirmOpen}
        onOpenChange={setIsRotateConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate Emergency QR Token?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-xs text-muted-foreground space-y-2 pt-1">
                <p>
                  Generating a new QR token will <strong className="text-destructive">immediately deactivate</strong> the previous code.
                </p>
                <p>
                  Any physical stickers, printed emergency wallet cards, or lock screen wallpapers using the old QR code will stop resolving.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rotateMutation.isPending}>
              Keep Current QR
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRotateConfirm}
              disabled={rotateMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {rotateMutation.isPending ? "Regenerating..." : "Yes, Regenerate QR"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
