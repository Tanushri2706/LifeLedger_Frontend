"use client";

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ChevronDown,
  FileText,
  HeartPulse,
  Loader2,
  Pill,
  RefreshCw,
  Sparkles,
  Stethoscope,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Reveal } from "@/components/landing/reveal";
import { MedicalDisclaimer } from "@/components/vault/vault-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useInfiniteTimelineQuery,
  type BackendTimelineEventType,
  type TimelineEventItem,
} from "@/features/timeline";

/* ---------- Event type filters ---------- */

interface FilterOption {
  id?: BackendTimelineEventType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const filterOptions: FilterOption[] = [
  { label: "Everything", icon: Activity },
  { id: "report_uploaded", label: "Report Uploads", icon: UploadCloud },
  { id: "ai_analysis", label: "AI Insights", icon: Sparkles },
  { id: "medication_prescribed", label: "Prescriptions", icon: Pill },
  { id: "diagnosis_recorded", label: "Diagnoses", icon: Stethoscope },
  { id: "vital_check", label: "Vitals", icon: HeartPulse },
];

/* ---------- Event presentation config ---------- */

interface EventPresentation {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
  iconBorderClass: string;
}

function getEventPresentation(eventType: string): EventPresentation {
  switch (eventType?.toLowerCase()) {
    case "report_uploaded":
      return {
        label: "Report Uploaded",
        icon: FileText,
        badgeClass: "bg-primary-soft text-primary border-primary/20",
        iconBorderClass: "text-primary",
      };
    case "ai_analysis":
      return {
        label: "AI Health Analysis",
        icon: Sparkles,
        badgeClass: "bg-primary-soft text-primary border-primary/20",
        iconBorderClass: "text-primary",
      };
    case "diagnosis_recorded":
      return {
        label: "Diagnosis Documented",
        icon: Stethoscope,
        badgeClass: "bg-primary-soft text-primary border-primary/20",
        iconBorderClass: "text-primary",
      };
    case "medication_prescribed":
      return {
        label: "Medication Prescribed",
        icon: Pill,
        badgeClass: "bg-accent-soft text-accent border-accent/20",
        iconBorderClass: "text-accent",
      };
    case "vital_check":
      return {
        label: "Vitals Check",
        icon: HeartPulse,
        badgeClass: "bg-primary-soft text-primary border-primary/20",
        iconBorderClass: "text-primary",
      };
    default:
      return {
        label: "Health Event",
        icon: Activity,
        badgeClass: "bg-muted text-muted-foreground border-border",
        iconBorderClass: "text-muted-foreground",
      };
  }
}

function formatCategory(category?: string): string {
  if (!category) return "";
  return category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatEventDay(dateVal?: string | Date): string {
  if (!dateVal) return "Date unavailable";
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

function formatMonthYear(dateVal?: string | Date): string {
  if (!dateVal) return "Recent Events";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Recent Events";
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "Recent Events";
  }
}

/* ---------- Timeline Event Card Component ---------- */

function TimelineCard({ event, index }: { event: TimelineEventItem; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const presentation = getEventPresentation(event.eventType);
  const Icon = presentation.icon;

  const originDetails = [
    event.metadata?.hospital,
    event.metadata?.doctor,
    event.metadata?.category ? formatCategory(event.metadata.category) : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="relative">
      <span
        className={`absolute -left-[2.55rem] grid size-9 place-items-center rounded-full border border-border bg-card shadow-sm sm:-left-[3.2rem] ${presentation.iconBorderClass}`}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <div className="surface-calm overflow-hidden rounded-xl border border-border/70 transition-all hover:border-border">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-5 text-left transition-colors hover:bg-surface/50"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`gap-1.5 font-medium ${presentation.badgeClass}`}>
                {presentation.label}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatEventDay(event.date)}</span>
              {event.metadata?.riskLevel && (
                <Badge
                  variant="secondary"
                  className={
                    event.metadata.riskLevel === "high"
                      ? "bg-destructive/15 text-destructive border-destructive/20"
                      : event.metadata.riskLevel === "moderate"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20"
                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  }
                >
                  Risk: {event.metadata.riskLevel}
                </Badge>
              )}
            </div>
            <h3 className="mt-2 font-display text-base font-semibold leading-snug break-words">
              {event.title}
            </h3>
            {originDetails && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{originDetails}</p>
            )}
          </div>
          <ChevronDown
            className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        <div
          className={`grid transition-all duration-300 ease-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-border/40 px-5 pt-3 pb-5">
              <p className="rounded-lg bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-foreground whitespace-pre-line break-words">
                {event.description}
              </p>

              {/* Real metadata highlights if present */}
              {event.metadata && (event.metadata.findingsCount || event.metadata.extractedValuesCount || event.metadata.reportType) ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {typeof event.metadata.findingsCount === "number" && (
                    <span className="rounded-md bg-surface px-2 py-1">
                      {event.metadata.findingsCount} key {event.metadata.findingsCount === 1 ? "finding" : "findings"} identified
                    </span>
                  )}
                  {typeof event.metadata.extractedValuesCount === "number" && (
                    <span className="rounded-md bg-surface px-2 py-1">
                      {event.metadata.extractedValuesCount} lab {event.metadata.extractedValuesCount === 1 ? "value" : "values"} extracted
                    </span>
                  )}
                  {event.metadata.reportType && (
                    <span className="rounded-md bg-surface px-2 py-1">
                      Type: {event.metadata.reportType}
                    </span>
                  )}
                </div>
              ) : null}

              {event.relatedReport && (
                <div className="mt-4 pt-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/reports/${event.relatedReport}`}>
                      <FileText className="size-3.5 mr-1.5" aria-hidden="true" />
                      View record
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ---------- Timeline Skeleton Component ---------- */

function TimelineSkeleton() {
  return (
    <div className="mt-8 space-y-8" aria-label="Loading timeline events" aria-busy="true">
      <div>
        <div className="mb-4 h-6 w-36 rounded bg-muted animate-pulse" />
        <ol className="relative space-y-6 border-l border-border pl-8 sm:pl-11">
          {[1, 2, 3].map((i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[2.55rem] size-9 rounded-full border border-border bg-muted animate-pulse sm:-left-[3.2rem]" />
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-28 rounded bg-muted animate-pulse" />
                  <div className="h-5 w-20 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ---------- Main Timeline Page Component ---------- */

export default function TimelinePage() {
  const [selectedEventType, setSelectedEventType] = useState<BackendTimelineEventType | undefined>(
    undefined
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTimelineQuery(
    selectedEventType ? { eventType: selectedEventType, limit: 20 } : { limit: 20 }
  );

  // Flatten all pages and deduplicate events by ID
  const allEvents = useMemo(() => {
    if (!data?.pages) return [];
    const eventMap = new Map<string, TimelineEventItem>();
    for (const page of data.pages) {
      if (page?.timeline) {
        for (const event of page.timeline) {
          if (!eventMap.has(event.id)) {
            eventMap.set(event.id, event);
          }
        }
      }
    }
    return Array.from(eventMap.values());
  }, [data]);

  // Group events by Month & Year in chronological order
  const monthGroups = useMemo(() => {
    const map = new Map<string, TimelineEventItem[]>();
    for (const event of allEvents) {
      const monthKey = formatMonthYear(event.date);
      const list = map.get(monthKey) ?? [];
      list.push(event);
      map.set(monthKey, list);
    }
    return Array.from(map.entries());
  }, [allEvents]);

  const totalEventsCount = data?.pages?.[0]?.pagination?.total ?? allEvents.length;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="flex flex-col items-start gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Health timeline
              </p>
              <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Your family&apos;s health journey
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Chronological timeline of uploaded records, AI-evaluated medical summaries, and health milestones.
              </p>
            </div>
            <Button asChild className="w-full shrink-0 sm:w-auto">
              <Link href="/reports/upload">
                <UploadCloud className="size-4 mr-2" aria-hidden="true" />
                Upload record
              </Link>
            </Button>
          </div>
        </Reveal>

        <div className="mt-6 space-y-8 pb-8">
          {/* Filters Bar */}
          <Reveal>
            <div className="surface-calm flex flex-wrap items-center gap-2 p-3 sm:p-4 rounded-xl border border-border/80">
              {filterOptions.map((filter) => {
                const isActive = selectedEventType === filter.id;
                const FilterIcon = filter.icon;
                return (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => setSelectedEventType(filter.id)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-surface text-muted-foreground hover:bg-surface/80 hover:text-foreground"
                    }`}
                  >
                    <FilterIcon className="size-3.5" aria-hidden="true" />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Loading State */}
          {isLoading ? (
            <TimelineSkeleton />
          ) : isError ? (
            /* Error State with retry */
            <Reveal>
              <div className="surface-calm rounded-xl border border-destructive/20 p-8 text-center sm:p-12">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="size-6" />
                </div>
                <h2 className="mt-4 font-display text-base font-semibold">
                  Unable to load health timeline
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  {error instanceof Error
                    ? error.message
                    : "A connection error occurred while loading your health timeline. Please verify your connection."}
                </p>
                <Button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="mt-6 gap-2"
                  variant="outline"
                >
                  <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
                  {isFetching ? "Retrying..." : "Retry"}
                </Button>
              </div>
            </Reveal>
          ) : allEvents.length === 0 ? (
            /* Empty State */
            <Reveal>
              <div className="surface-calm rounded-xl border border-border p-10 text-center sm:p-14">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
                  <HeartPulse className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-base font-semibold">
                  {selectedEventType
                    ? "No events match this filter"
                    : "No health timeline events yet"}
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  {selectedEventType
                    ? "Try switching back to 'Everything' or upload another medical record."
                    : "Timeline entries appear automatically as you upload medical reports to your Health Vault and run AI health insights."}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {selectedEventType ? (
                    <Button variant="outline" size="sm" onClick={() => setSelectedEventType(undefined)}>
                      Show everything
                    </Button>
                  ) : (
                    <Button asChild size="sm">
                      <Link href="/reports/upload">
                        <UploadCloud className="size-4 mr-2" />
                        Upload first report
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </Reveal>
          ) : (
            /* Grouped Timeline Events */
            <>
              {monthGroups.map(([month, items]) => (
                <section key={month} aria-labelledby={`month-${month.replace(/\s+/g, "-")}`}>
                  <Reveal>
                    <h2
                      id={`month-${month.replace(/\s+/g, "-")}`}
                      className="sticky top-16 z-10 -mx-1 mb-4 inline-flex rounded-md bg-surface/95 px-3 py-1.5 font-display text-sm font-semibold tracking-wide backdrop-blur border border-border/50"
                    >
                      {month}
                    </h2>
                  </Reveal>
                  <ol className="relative space-y-5 border-l border-border pl-8 sm:pl-11">
                    {items.map((event, i) => (
                      <Reveal key={event.id} delay={Math.min(i, 4) * 0.05}>
                        <TimelineCard event={event} index={i} />
                      </Reveal>
                    ))}
                  </ol>
                </section>
              ))}

              {/* Load More Pagination */}
              {hasNextPage && (
                <Reveal>
                  <div className="pt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="gap-2"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Loading older events...
                        </>
                      ) : (
                        `Load older events (${allEvents.length} of ${totalEventsCount})`
                      )}
                    </Button>
                  </div>
                </Reveal>
              )}
            </>
          )}

          <Reveal>
            <MedicalDisclaimer />
          </Reveal>
        </div>
      </div>
    </DashboardShell>
  );
}
