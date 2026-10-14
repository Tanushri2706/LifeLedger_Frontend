"use client";

import {
  Sparkles,
  AlertTriangle,
  Brain,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFamilyMemberHealthIntelligenceQuery } from "../family-hooks";
import type { FamilyMemberResponseDto } from "../family-types";

interface FamilyMemberAIInsightsProps {
  member: FamilyMemberResponseDto;
}

export function FamilyMemberAIInsights({ member }: FamilyMemberAIInsightsProps) {
  const {
    data: intel,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useFamilyMemberHealthIntelligenceQuery(member.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <AlertTriangle className="size-6 text-destructive mb-2" />
        <h4 className="font-semibold text-sm text-foreground">Failed to load AI health insights</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Could not aggregate health intelligence for {member.displayName}.
        </p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-3 gap-1.5 text-xs">
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  const coverage = intel?.coverage;
  const synthesis = intel?.aiSynthesis;
  const hasAnalyzedReports = (coverage?.analyzedReports ?? 0) > 0;

  if (!hasAnalyzedReports || !synthesis) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-surface/40 p-8 sm:p-12 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary mb-3">
          <Brain className="size-6" />
        </span>
        <h3 className="font-display text-base font-bold text-foreground">
          No Analyzed Reports for {member.displayName}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-md leading-relaxed">
          Upload and analyze lab reports or blood tests for this profile to generate structured AI summaries, longitudinal biomarker trends, and physician discussion points.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Summary Banner */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Health Intelligence: {member.displayName}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Aggregated across {coverage?.analyzedReports} analyzed clinical {coverage?.analyzedReports === 1 ? "report" : "reports"}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh Intelligence
          </Button>
        </div>

        {/* Synthesis Overview */}
        {synthesis.overview ? (
          <p className="text-xs sm:text-sm text-foreground leading-relaxed pt-1">
            {synthesis.overview}
          </p>
        ) : null}
      </div>

      {/* Urgent Signals Callout if actively flagged */}
      {(() => {
        const isHistoricalUrgency = synthesis.urgentSignals?.urgencyLevel === "historical_finding";
        const hasActiveUrgentConcern =
          Boolean(synthesis.urgentSignals?.hasUrgentConcern) &&
          !isHistoricalUrgency &&
          synthesis.urgentSignals?.urgencyLevel !== "none";

        if (!hasActiveUrgentConcern) return null;

        return (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:p-5 flex items-start gap-3">
            <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-destructive">
                Urgent Clinical Observation
              </h4>
              <p className="text-xs text-foreground leading-relaxed">
                {synthesis.urgentSignals?.details}
              </p>
              <p className="text-[11px] text-muted-foreground italic pt-1">
                Please consult a medical professional immediately regarding critical or abnormal findings.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Two Column Grid: Key Findings & Doctor Questions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Key Observations */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>
              Key Observations (
                {Array.isArray(intel?.currentObservations)
                  ? intel.currentObservations.length
                  : synthesis.keyObservations?.length || 0}
              )
            </span>
          </div>

          <ul className="space-y-2 text-xs text-muted-foreground">
            {Array.isArray(intel?.currentObservations) && intel.currentObservations.length > 0 ? (
              intel.currentObservations.map((obs, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  <span className="leading-relaxed text-foreground">
                    {typeof obs === "string" ? obs : `${obs.testName}: ${obs.rawValue}`}
                  </span>
                </li>
              ))
            ) : synthesis.keyObservations && synthesis.keyObservations.length > 0 ? (
              synthesis.keyObservations.map((obs, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  <span className="leading-relaxed text-foreground">{obs}</span>
                </li>
              ))
            ) : (
              <li className="italic text-muted-foreground">No specific observations noted.</li>
            )}
          </ul>
        </div>

        {/* Questions for Doctor */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <HelpCircle className="size-4 text-sky-500" />
            <span>Doctor Discussion Points ({synthesis.areasToDiscussWithDoctor?.length || 0})</span>
          </div>

          <ul className="space-y-2 text-xs text-muted-foreground">
            {synthesis.areasToDiscussWithDoctor && synthesis.areasToDiscussWithDoctor.length > 0 ? (
              synthesis.areasToDiscussWithDoctor.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                  <span className="leading-relaxed text-foreground">{q}</span>
                </li>
              ))
            ) : (
              <li className="italic text-muted-foreground">No urgent doctor questions suggested.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Historical Findings Section if present */}
      {((intel?.historicalFindings && intel.historicalFindings.length > 0) ||
        (synthesis.historicalFindings && synthesis.historicalFindings.length > 0) ||
        (intel?.historicalFlaggedMarkers && intel.historicalFlaggedMarkers.length > 0)) && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <TrendingUp className="size-4 text-muted-foreground" />
            <span>Historical Findings & Prior Records</span>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {(intel?.historicalFindings || synthesis.historicalFindings || []).map((finding, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-muted-foreground shrink-0 mt-1.5" />
                <span className="leading-relaxed text-foreground">
                  {typeof finding === "string"
                    ? finding
                    : `${finding.testName || finding.finding}: ${finding.rawValue || ""} ${
                        finding.resolutionContext ? `(${finding.resolutionContext})` : ""
                      }`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Changes Over Time / Trends */}
      {synthesis.changesOverTime && synthesis.changesOverTime.length > 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <TrendingUp className="size-4 text-indigo-500" />
            <span>Longitudinal Trends & Progression</span>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {synthesis.changesOverTime.map((trend, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                <span className="leading-relaxed text-foreground">{trend}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Mandatory Medical Disclaimer */}
      <div className="rounded-xl border border-border/60 bg-surface/60 p-4 text-[11px] text-muted-foreground space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Medical Intelligence & Privacy Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          {synthesis.disclaimer ||
            "This AI synthesis is for health organization and educational purposes only. It is not a clinical diagnosis or treatment plan. Always consult a qualified medical doctor."}
        </p>
      </div>
    </div>
  );
}
