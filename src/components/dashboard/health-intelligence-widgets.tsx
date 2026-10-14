"use client";

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  FileText,
  HeartPulse,
  History,
  Info,
  Minus,
  Pill,
  RefreshCw,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  AggregateHealthIntelligenceData,
  HistoricalFindingItem,
  LongitudinalTrend,
  NormalizedObservation,
} from "@/features/health-intelligence";

/* ---------- Helper formatting functions ---------- */

function formatDate(dateVal?: string | Date): string {
  if (!dateVal) return "Date not recorded";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateVal);
  }
}

/* ---------- 1. Skeleton Loading State ---------- */

export function HealthIntelligenceSkeleton() {
  return (
    <div className="surface-calm space-y-6 rounded-2xl border border-border p-6 sm:p-8" aria-busy="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-64" />
        </div>
        <Skeleton className="h-6 w-36 rounded-full" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}

/* ---------- 2. Contained Error State ---------- */

export function HealthIntelligenceError({
  error,
  onRetry,
  isFetching,
}: {
  error?: Error | null;
  onRetry: () => void;
  isFetching: boolean;
}) {
  return (
    <div className="surface-calm rounded-2xl border border-destructive/20 p-6 sm:p-8 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-base font-semibold">
        Unable to load health intelligence
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
        {error instanceof Error
          ? error.message
          : "We encountered a temporary issue while assembling your health intelligence overview."}
      </p>
      <Button
        onClick={onRetry}
        disabled={isFetching}
        variant="outline"
        size="sm"
        className="mt-5 gap-2"
      >
        <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
        {isFetching ? "Retrying..." : "Retry overview"}
      </Button>
    </div>
  );
}

/* ---------- 3. No Reports Onboarding State ---------- */

export function NoReportsIntelligenceCard() {
  return (
    <div className="surface-calm rounded-2xl border border-border p-6 sm:p-10 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
        <Sparkles className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold sm:text-xl">
        No health records uploaded yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Upload your diagnostic lab panels, blood tests, or doctor prescriptions. LifeLedger automatically extracts clinical markers, tracks values across visits, and generates structured discussion guides for your doctor.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/reports">
            <Upload className="size-4 mr-2" aria-hidden="true" />
            Upload first report
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ---------- 4. No Analyzed Reports State ---------- */

export function NoAnalyzedReportsIntelligenceCard({
  coverage,
}: {
  coverage: AggregateHealthIntelligenceData["coverage"];
}) {
  const hasUnreadable = coverage.unreadableReports > 0;
  const hasPending = coverage.pendingReports > 0;

  return (
    <div className="surface-calm rounded-2xl border border-border p-6 sm:p-10 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
        <FileText className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold sm:text-xl">
        Health records saved — AI analysis pending
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        You have {coverage.totalReports} medical {coverage.totalReports === 1 ? "document" : "documents"} stored in your Health Vault. Once reports with readable clinical data are analyzed, your cross-report intelligence and longitudinal trends will appear here.
      </p>

      {hasUnreadable && (
        <div className="mx-auto mt-4 max-w-md rounded-lg bg-surface p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Document Note</p>
          <p className="mt-0.5">
            {coverage.unreadableReports} document{coverage.unreadableReports === 1 ? "" : "s"} could not be extracted due to low image clarity or non-clinical content.
          </p>
        </div>
      )}

      {hasPending && (
        <p className="mt-3 text-xs text-primary">
          {coverage.pendingReports} report{coverage.pendingReports === 1 ? " is" : "s are"} currently queued for analysis.
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/reports">
            View Health Vault
            <ArrowRight className="size-4 ml-2" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ---------- 5. Main Health Overview Hero Card ---------- */

export function HealthOverviewHeroCard({
  data,
  onRefresh,
  isRefreshing,
}: {
  data: AggregateHealthIntelligenceData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { coverage, aiSynthesis, status, isCached, generatedAt } = data;
  const isPartial = status === "partial_data";
  const urgent = aiSynthesis?.urgentSignals;

  // Strict temporal guard: Do NOT render emergency banner if finding is historical or urgencyLevel is "historical_finding" or "none"
  const isHistoricalUrgency = urgent?.urgencyLevel === "historical_finding";
  const hasActiveUrgentConcern =
    Boolean(urgent?.hasUrgentConcern) &&
    !isHistoricalUrgency &&
    urgent?.urgencyLevel !== "none";

  const firstDateStr = coverage.firstReportDate ? formatDate(coverage.firstReportDate) : "";
  const latestDateStr = coverage.latestReportDate ? formatDate(coverage.latestReportDate) : "";
  const hasDateRange = firstDateStr && latestDateStr;
  const dateRangeDisplay =
    firstDateStr === latestDateStr
      ? firstDateStr
      : `${firstDateStr} – ${latestDateStr}`;

  return (
    <section className="glass-ai rounded-2xl border border-primary/20 p-6 sm:p-8 relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Health Intelligence
            </span>
            <Badge
              variant="outline"
              className={
                isPartial
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-primary/30 bg-primary-soft text-primary"
              }
            >
              {isPartial ? "Partial record overview" : "Comprehensive record overview"}
            </Badge>
            {isCached && (
              <Badge variant="secondary" className="text-[11px] text-muted-foreground font-normal">
                Cached synthesis
              </Badge>
            )}
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Your Health Overview
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Refresh health intelligence"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Active Urgent Concern Alert (Rendered ONLY for true active emergency concerns) */}
      {hasActiveUrgentConcern && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-semibold">Urgent Clinical Observation Noted in Records</p>
              <p className="mt-1 leading-relaxed text-destructive/90">
                {urgent?.details || "A critical marker or clinical flag was detected in your latest diagnostic records. Please consult a qualified medical professional immediately."}
              </p>
              <p className="mt-2 text-xs font-medium text-destructive/80">
                For immediate emergency medical assistance in India, dial <strong className="font-bold underline">112 (National Emergency)</strong> or <strong className="font-bold underline">108 (Ambulance)</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Synthesis Overview Narrative */}
      {aiSynthesis?.overview && (
        <div className="mt-5 rounded-xl bg-surface/80 p-4 sm:p-5 border border-border/60">
          <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-line">
            {aiSynthesis.overview}
          </p>
        </div>
      )}

      {/* Coverage & Record Metadata Footnote */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            Based on <strong className="font-semibold text-foreground">{coverage.analyzedReports}</strong> analyzed {coverage.analyzedReports === 1 ? "report" : "reports"} of {coverage.totalReports} in vault
          </span>
          {coverage.unreadableReports > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              ({coverage.unreadableReports} unreadable)
            </span>
          )}
          {hasDateRange && (
            <span>
              Coverage: {dateRangeDisplay}
            </span>
          )}
        </div>
        <div>
          <span>Updated {formatDate(generatedAt)}</span>
        </div>
      </div>

      {/* Limitations if present */}
      {coverage.limitations && coverage.limitations.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface/50 px-3 py-2 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
          <ul className="space-y-0.5">
            {coverage.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ---------- 6. Key Observations Card ---------- */

export function KeyObservationsCard({
  observations,
  currentObservations,
}: {
  observations?: string[];
  currentObservations?: (string | NormalizedObservation)[];
}) {
  // Prefer currentObservations if provided, otherwise fallback to observations
  const obsList: string[] = [];

  if (currentObservations && currentObservations.length > 0) {
    for (const item of currentObservations) {
      if (typeof item === "string") {
        obsList.push(item);
      } else if (item && typeof item === "object" && item.testName) {
        obsList.push(`${item.testName}: ${item.rawValue}${item.referenceRange ? ` (Ref: ${item.referenceRange})` : ""}`);
      }
    }
  } else if (observations && observations.length > 0) {
    obsList.push(...observations);
  }

  if (obsList.length === 0) return null;

  return (
    <section className="surface-calm flex flex-col rounded-2xl border border-border p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-primary" aria-hidden="true" />
        <h3 className="font-display text-base font-semibold">
          Key observations from your records
        </h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Cross-report patterns identified from your structured diagnostic reports.
      </p>

      <ul className="mt-4 space-y-2.5">
        {obsList.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 rounded-lg bg-surface p-3 text-sm leading-relaxed text-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- 7. Current Flagged Values to Review ---------- */

export function AbnormalMarkersCard({
  markers,
  currentFlaggedMarkers,
}: {
  markers?: NormalizedObservation[];
  currentFlaggedMarkers?: NormalizedObservation[];
}) {
  // Use currentFlaggedMarkers if explicitly defined (including empty array []), else fallback to legacy markers
  const activeMarkers = currentFlaggedMarkers !== undefined ? currentFlaggedMarkers : markers;

  // If there are no current flagged values in latest report, show explicit reassuring state per requirement
  if (!activeMarkers || activeMarkers.length === 0) {
    return (
      <section className="surface-calm flex flex-col justify-between rounded-2xl border border-border/80 p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <h3 className="font-display text-base font-semibold">
                Current flagged values
              </h3>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs">
              All in normal range
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Biomarkers documented outside standard reference ranges in your latest diagnostic report.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface p-4 border border-border/60">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            No currently flagged values in the latest available report.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="surface-calm flex flex-col rounded-2xl border border-amber-500/20 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <h3 className="font-display text-base font-semibold">
            Current flagged values
          </h3>
        </div>
        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
          {activeMarkers.length} flagged {activeMarkers.length === 1 ? "value" : "values"}
        </Badge>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Biomarkers documented outside standard reference ranges in your latest diagnostic report.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {activeMarkers.map((marker, idx) => (
          <div
            key={`${marker.reportId || "marker"}-${marker.testName}-${idx}`}
            className="flex flex-col justify-between rounded-xl bg-surface p-3.5 border border-border/60"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm leading-snug">{marker.testName}</p>
                <Badge
                  variant="secondary"
                  className={
                    marker.flag === "HIGH"
                      ? "bg-destructive/15 text-destructive border-destructive/20 text-[11px]"
                      : marker.flag === "LOW"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px]"
                      : "bg-destructive/10 text-destructive text-[11px]"
                  }
                >
                  {marker.flag || "Flagged"}
                </Badge>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-lg font-semibold text-foreground">
                  {marker.rawValue}
                </span>
                {marker.referenceRange && (
                  <span className="text-xs text-muted-foreground">
                    (Ref: {marker.referenceRange})
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground">
              <span>{formatDate(marker.reportDate)}</span>
              {marker.reportId && (
                <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary">
                  <Link href={`/reports/${marker.reportId}`}>
                    View source
                    <ChevronRight className="size-3 ml-0.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Alias for clarity */
export const CurrentFlaggedMarkersCard = AbnormalMarkersCard;

/* ---------- 8. Historical Findings & Resolved Indicators ---------- */

export function HistoricalFindingsCard({
  findings,
  historicalFlaggedMarkers,
  historicalDiagnoses,
}: {
  findings?: (string | HistoricalFindingItem)[];
  historicalFlaggedMarkers?: (NormalizedObservation | HistoricalFindingItem)[];
  historicalDiagnoses?: string[];
}) {
  // Normalize all historical items into unified display objects
  interface DisplayFinding {
    id: string;
    title: string;
    value?: string;
    date?: string | Date;
    reportId?: string;
    resolutionContext?: string;
    referenceRange?: string;
  }

  const items: DisplayFinding[] = [];

  // 1. Process structured historical findings
  if (findings && findings.length > 0) {
    findings.forEach((item, idx) => {
      if (typeof item === "string") {
        items.push({
          id: `finding-str-${idx}`,
          title: item,
        });
      } else if (item && typeof item === "object") {
        items.push({
          id: `finding-obj-${item.reportId || idx}-${item.testName || idx}`,
          title: item.testName || item.finding || "Historical Finding",
          value: item.rawValue,
          date: item.reportDate,
          reportId: item.reportId,
          resolutionContext: item.resolutionContext,
          referenceRange: item.referenceRange,
        });
      }
    });
  }

  // 2. Process historical flagged markers (e.g. earlier abnormal labs that normalized)
  if (historicalFlaggedMarkers && historicalFlaggedMarkers.length > 0) {
    historicalFlaggedMarkers.forEach((marker, idx) => {
      if (typeof marker === "object" && marker) {
        // Avoid exact duplicate titles if already included
        const title = marker.testName || ("finding" in marker ? (marker as HistoricalFindingItem).finding : "Prior Laboratory Flag") || "Prior Laboratory Flag";
        const alreadyExists = items.some(
          (it) => it.title === title && it.value === marker.rawValue
        );
        if (!alreadyExists) {
          items.push({
            id: `hist-marker-${marker.reportId || idx}-${idx}`,
            title,
            value: marker.rawValue,
            date: marker.reportDate,
            reportId: marker.reportId,
            resolutionContext: marker.resolutionContext,
            referenceRange: marker.referenceRange,
          });
        }
      }
    });
  }

  // 3. Process historical diagnoses (e.g. prior acute conditions)
  if (historicalDiagnoses && historicalDiagnoses.length > 0) {
    historicalDiagnoses.forEach((diag, idx) => {
      const alreadyExists = items.some((it) => it.title.includes(diag));
      if (!alreadyExists) {
        items.push({
          id: `hist-diag-${idx}`,
          title: `Previous Diagnosis / Condition: ${diag}`,
          resolutionContext: "Documented in prior clinical records.",
        });
      }
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="surface-calm flex flex-col rounded-2xl border border-border p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="font-display text-base font-semibold">
            Historical findings & prior records
          </h3>
        </div>
        <Badge variant="outline" className="border-border bg-muted/60 text-muted-foreground text-xs">
          Historical context ({items.length})
        </Badge>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Past observations from earlier records that have subsequent follow-ups, updated lab readings, or clinical resolution notes.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-xl bg-surface p-3.5 border border-border/60"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm leading-snug text-foreground">
                  {item.title}
                </p>
                <Badge
                  variant="outline"
                  className="shrink-0 border-border bg-muted/80 text-[11px] text-muted-foreground font-normal"
                >
                  Historical
                </Badge>
              </div>

              {item.value && (
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-base font-semibold text-muted-foreground">
                    Prior result: {item.value}
                  </span>
                  {item.referenceRange && (
                    <span className="text-xs text-muted-foreground">
                      (Ref: {item.referenceRange})
                    </span>
                  )}
                </div>
              )}

              {/* Resolution or Evolution Context */}
              {item.resolutionContext && (
                <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <div className="min-w-0">
                    <span className="font-semibold">Follow-up: </span>
                    <span>{item.resolutionContext}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground">
              <span>{item.date ? `Observed ${formatDate(item.date)}` : "Earlier visit record"}</span>
              {item.reportId && (
                <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary">
                  <Link href={`/reports/${item.reportId}`}>
                    View record
                    <ChevronRight className="size-3 ml-0.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 9. Longitudinal Trends (Changes Over Time) ---------- */

export function LongitudinalTrendsCard({ trends }: { trends?: LongitudinalTrend[] }) {
  if (!trends || trends.length === 0) return null;

  return (
    <section className="surface-calm flex flex-col rounded-2xl border border-border p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="size-4 text-primary" aria-hidden="true" />
        <h3 className="font-display text-base font-semibold">
          Changes over time
        </h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Numerical progression across multiple clinical observations. Direction describes mathematical movement across lab dates.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trends.map((trend) => {
          const isIncreasing = trend.direction === "increasing";
          const isDecreasing = trend.direction === "decreasing";
          const isStable = trend.direction === "stable";
          const isInsufficient = trend.direction === "insufficient_data";

          const hasBaselineAndLatest =
            trend.baselineValue !== null &&
            trend.latestValue !== null &&
            trend.firstObservedDate &&
            trend.latestObservedDate;

          return (
            <div
              key={trend.markerKey}
              className="flex flex-col justify-between rounded-xl bg-surface p-4 border border-border/60"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-snug">{trend.displayName}</p>
                  <Badge
                    variant="outline"
                    className={`gap-1 text-[11px] ${
                      isIncreasing
                        ? "border-primary/30 bg-primary-soft text-primary"
                        : isDecreasing
                        ? "border-accent/30 bg-accent-soft text-accent"
                        : isStable
                        ? "border-border bg-muted text-muted-foreground"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {isIncreasing ? (
                      <>
                        <ArrowUpRight className="size-3" />
                        Increasing
                      </>
                    ) : isDecreasing ? (
                      <>
                        <ArrowDownRight className="size-3" />
                        Decreasing
                      </>
                    ) : isStable ? (
                      <>
                        <Minus className="size-3" />
                        Stable
                      </>
                    ) : (
                      "Single observation"
                    )}
                  </Badge>
                </div>

                {/* Values Progression Banner (e.g. 92,000 → 248,000 /mcL) */}
                {hasBaselineAndLatest && trend.baselineValue !== trend.latestValue ? (
                  <div className="mt-3 rounded-lg bg-surface/80 p-2.5 border border-border/40">
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                      Progression ({formatDate(trend.firstObservedDate)} → {formatDate(trend.latestObservedDate)})
                    </p>
                    <div className="mt-1 flex items-center gap-2 font-display text-base font-semibold">
                      <span className="text-muted-foreground">{trend.baselineValue}</span>
                      <ArrowRight className="size-3.5 text-primary shrink-0" />
                      <span className="text-foreground">{trend.latestValue} {trend.unit}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Latest Value</p>
                      <p className="font-display text-base font-semibold">
                        {trend.latestValue !== null ? `${trend.latestValue} ${trend.unit}` : "—"}
                      </p>
                    </div>
                    {trend.baselineValue !== null && (
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">Baseline</p>
                        <p className="text-xs text-muted-foreground">
                          {trend.baselineValue} {trend.unit}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Mathematical delta if applicable */}
                {trend.changeValue !== null && !isInsufficient && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Shift: {trend.changeValue > 0 ? `+${trend.changeValue}` : trend.changeValue} {trend.unit}
                    {trend.changePercent !== null ? ` (${trend.changePercent > 0 ? `+${trend.changePercent}` : trend.changePercent}%)` : ""}
                  </p>
                )}

                {/* Observation history timeline points */}
                <div className="mt-3 border-t border-border/40 pt-2.5">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {trend.observations.length} {trend.observations.length === 1 ? "data point" : "data points"} recorded
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {trend.observations.map((obs, oIdx) => (
                      <span
                        key={oIdx}
                        className="inline-flex items-center rounded-md bg-card px-2 py-0.5 text-[10px] text-muted-foreground border border-border/50"
                        title={`${formatDate(obs.reportDate)}: ${obs.rawValue} ${obs.unit || trend.unit}`}
                      >
                        {formatDate(obs.reportDate)}: {obs.rawValue} {obs.unit || ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- 10. Things to Discuss With Your Doctor & Wellness Guidance ---------- */

export function DoctorDiscussionAndWellnessCard({
  areasToDiscuss,
  wellnessGuidance,
}: {
  areasToDiscuss?: string[];
  wellnessGuidance?: AggregateHealthIntelligenceData["aiSynthesis"] extends null ? undefined : NonNullable<AggregateHealthIntelligenceData["aiSynthesis"]>["generalWellnessGuidance"];
}) {
  const hasAreas = areasToDiscuss && areasToDiscuss.length > 0;
  const hasWellness =
    wellnessGuidance &&
    (wellnessGuidance.nutritionNotes?.length > 0 ||
      wellnessGuidance.activityNotes?.length > 0 ||
      wellnessGuidance.lifestyleNotes?.length > 0);

  if (!hasAreas && !hasWellness) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Discussion Points */}
      {hasAreas && (
        <section className="surface-calm flex flex-col rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Stethoscope className="size-4 text-primary" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold">
              Things to discuss with your doctor
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Constructive topics and follow-up considerations prepared for your next clinical consultation.
          </p>

          <ul className="mt-4 space-y-2.5">
            {areasToDiscuss.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 rounded-lg bg-surface p-3 text-sm leading-relaxed text-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Wellness & Lifestyle Notes */}
      {hasWellness && (
        <section className="surface-calm flex flex-col rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <HeartPulse className="size-4 text-accent" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold">
              General wellness guidance
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Educational lifestyle suggestions based on verified health records. Does not replace prescribed medical advice.
          </p>

          <div className="mt-4 space-y-3">
            {wellnessGuidance.nutritionNotes?.length > 0 && (
              <div className="rounded-lg bg-surface p-3 text-xs leading-relaxed">
                <p className="font-semibold text-foreground">Nutrition Considerations</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {wellnessGuidance.nutritionNotes.map((note, i) => (
                    <li key={i}>• {note}</li>
                  ))}
                </ul>
              </div>
            )}

            {wellnessGuidance.activityNotes?.length > 0 && (
              <div className="rounded-lg bg-surface p-3 text-xs leading-relaxed">
                <p className="font-semibold text-foreground">Activity & Movement</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {wellnessGuidance.activityNotes.map((note, i) => (
                    <li key={i}>• {note}</li>
                  ))}
                </ul>
              </div>
            )}

            {wellnessGuidance.lifestyleNotes?.length > 0 && (
              <div className="rounded-lg bg-surface p-3 text-xs leading-relaxed">
                <p className="font-semibold text-foreground">Lifestyle Routine</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {wellnessGuidance.lifestyleNotes.map((note, i) => (
                    <li key={i}>• {note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- 11. Documented Diagnoses & Medications ---------- */

export function DocumentedDiagnosesAndMedicationsCard({
  diagnoses,
  currentDiagnoses,
  historicalDiagnoses,
  medications,
}: {
  diagnoses?: string[];
  currentDiagnoses?: string[];
  historicalDiagnoses?: string[];
  medications?: AggregateHealthIntelligenceData["activeMedications"];
}) {
  // Determine current diagnoses
  const activeDiagnoses = currentDiagnoses && currentDiagnoses.length > 0
    ? currentDiagnoses
    : diagnoses && diagnoses.length > 0
    ? diagnoses
    : [];

  const pastDiagnoses = historicalDiagnoses && historicalDiagnoses.length > 0
    ? historicalDiagnoses
    : [];

  const hasCurrentDiagnoses = activeDiagnoses.length > 0;
  const hasPastDiagnoses = pastDiagnoses.length > 0;
  const hasMeds = medications && medications.length > 0;

  if (!hasCurrentDiagnoses && !hasPastDiagnoses && !hasMeds) return null;

  return (
    <section className="surface-calm flex flex-col rounded-2xl border border-border p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <FileCheck className="size-4 text-primary" aria-hidden="true" />
        <h3 className="font-display text-base font-semibold">
          Documented in your records
        </h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Conditions and prescribed medications explicitly recorded in your uploaded documents. LifeLedger did not diagnose or prescribe these.
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {(hasCurrentDiagnoses || hasPastDiagnoses) && (
          <div className="space-y-4">
            {hasCurrentDiagnoses && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Diagnoses / Documented Conditions
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeDiagnoses.map((diag, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1 text-xs font-medium bg-surface">
                      {diag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {hasPastDiagnoses && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prior / Historical Findings
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pastDiagnoses.map((diag, idx) => (
                    <Badge key={idx} variant="outline" className="px-3 py-1 text-xs font-normal border-border bg-muted/60 text-muted-foreground">
                      {diag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Documented in earlier clinical records.
                </p>
              </div>
            )}
          </div>
        )}

        {hasMeds && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Documented Medications
            </h4>
            <ul className="mt-2 space-y-2">
              {medications.map((med, idx) => (
                <li key={idx} className="rounded-lg bg-surface p-2.5 text-xs text-foreground flex items-center gap-2">
                  <Pill className="size-3.5 shrink-0 text-accent" />
                  <div>
                    <span className="font-semibold">{med.name}</span>
                    {med.dosage && <span className="text-muted-foreground"> · {med.dosage}</span>}
                    {med.frequency && <span className="text-muted-foreground"> · {med.frequency}</span>}
                    {med.instructions && <span className="text-muted-foreground"> ({med.instructions})</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- 12. Mandatory Medical Disclaimer ---------- */

export function MandatoryDisclaimerCard({ disclaimer }: { disclaimer?: string }) {
  if (!disclaimer) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-surface/50 p-4 text-xs leading-relaxed text-muted-foreground">
      <p className="font-semibold text-foreground">Medical Disclaimer</p>
      <p className="mt-1">{disclaimer}</p>
    </div>
  );
}

