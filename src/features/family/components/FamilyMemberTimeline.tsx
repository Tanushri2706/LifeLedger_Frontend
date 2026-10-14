"use client";

import Link from "next/link";
import {
  Clock,
  FileText,
  Sparkles,
  HeartPulse,
  Pill,
  Activity,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFamilyMemberTimelineQuery } from "../family-hooks";
import type { FamilyMemberResponseDto } from "../family-types";

interface FamilyMemberTimelineProps {
  member: FamilyMemberResponseDto;
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case "report_uploaded":
      return <FileText className="size-4 text-primary" />;
    case "ai_analysis":
      return <Sparkles className="size-4 text-indigo-500" />;
    case "medication_prescribed":
      return <Pill className="size-4 text-emerald-500" />;
    case "vital_check":
      return <Activity className="size-4 text-sky-500" />;
    default:
      return <HeartPulse className="size-4 text-primary" />;
  }
}

export function FamilyMemberTimeline({ member }: FamilyMemberTimelineProps) {
  const {
    data: timelineData,
    isLoading,
    isError,
    refetch,
  } = useFamilyMemberTimelineQuery(member.id);

  const events = timelineData?.timeline || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-start">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <AlertCircle className="size-6 text-destructive mb-2" />
        <p className="text-xs text-muted-foreground">Failed to load medical timeline.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-3 gap-1.5 text-xs">
          <RefreshCw className="size-3.5" /> Retry
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-surface/40 p-8 sm:p-12 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary mb-3">
          <Clock className="size-6" />
        </span>
        <h3 className="font-display text-base font-bold text-foreground">
          No Timeline Events for {member.displayName}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Uploading reports, prescriptions, or analyzing records will automatically build a chronological health timeline for this profile.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
      {events.map((event) => (
        <div key={event.id} className="relative flex items-start gap-4">
          {/* Timeline Dot */}
          <span className="absolute -left-6 top-1.5 grid size-6 place-items-center rounded-full bg-card border-2 border-border/80 shadow-xs">
            {getEventIcon(event.eventType)}
          </span>

          <div className="flex-1 rounded-xl border border-border/60 bg-card p-4 shadow-sm hover:border-border transition-colors space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-semibold text-xs sm:text-sm text-foreground">
                {event.title}
              </h4>
              <span className="text-[11px] text-muted-foreground">
                {new Date(event.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {event.description ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            ) : null}

            {event.relatedReport ? (
              <div className="pt-1">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1 px-2.5"
                >
                  <Link href={`/reports/${event.relatedReport}`}>
                    <span>View Related Report</span>
                    <ChevronRight className="size-3" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
