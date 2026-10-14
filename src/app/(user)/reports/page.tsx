"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Share2,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/widgets";
import { Reveal } from "@/components/landing/reveal";
import {
  MedicalDisclaimer,
  reportCategories,
  formatCategoryName,
  getCategoryIcon,
  formatDate,
  formatFileSize,
} from "@/components/vault/vault-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useReportsQuery, reportsApi } from "@/features/reports";
import { CreateMedicalShareDialog } from "@/features/medical-share/components";

const dateRanges = [
  { id: "all", label: "All time" },
  { id: "2026", label: "This year (2026)", startDate: "2026-01-01", endDate: "2026-12-31" },
  { id: "q1-2026", label: "Jan – Mar 2026", startDate: "2026-01-01", endDate: "2026-03-31" },
  { id: "2025", label: "2025", startDate: "2025-01-01", endDate: "2025-12-31" },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [rangeId, setRangeId] = useState("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const selectedRange = dateRanges.find((d) => d.id === rangeId);

  const { data, isLoading, isError, error, refetch, isFetching } = useReportsQuery({
    search: query.trim() || undefined,
    category: category !== "all" ? category : undefined,
    startDate: selectedRange?.startDate,
    endDate: selectedRange?.endDate,
    limit: 50,
  });

  const reports = data?.reports || [];
  const total = data?.pagination?.total ?? 0;

  const handleDownload = async (reportId: string, filename: string) => {
    try {
      setDownloadingId(reportId);
      const res = await reportsApi.getDownloadUrl(reportId);
      if (res.data?.downloadUrl) {
        const link = document.createElement("a");
        link.href = res.data.downloadUrl;
        link.download = res.data.fileName || filename;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate download link.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col items-start gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                AI Health Vault
              </p>
              <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Report history
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {isLoading ? (
                  "Loading health records..."
                ) : (
                  `${total} record${total === 1 ? "" : "s"} saved in your secure vault.`
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsShareOpen(true)}
                className="flex-1 sm:flex-initial gap-1.5 shadow-sm"
              >
                <Share2 className="size-4" aria-hidden="true" />
                Share records
              </Button>
              <Button asChild className="flex-1 sm:flex-initial">
                <Link href="/reports/upload">
                  <UploadCloud className="size-4" aria-hidden="true" />
                  Upload report
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 space-y-6 pb-4">
          <Reveal>
            <div className="surface-calm p-4 sm:p-5">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by report name, lab, doctor, or filename"
                  className="h-11 pl-9"
                  aria-label="Search reports"
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {reportCategories.map((c) => {
                    const active = category === c.id;
                    const IconComponent = c.icon;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <IconComponent className="size-3.5" aria-hidden="true" />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                <Select value={rangeId} onValueChange={setRangeId}>
                  <SelectTrigger className="h-10 w-full sm:w-44" aria-label="Filter by date">
                    <Calendar className="size-4 text-muted-foreground" aria-hidden="true" />
                    <SelectValue placeholder="All dates" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Reveal>

          {isLoading ? (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="surface-calm flex flex-col p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <div className="flex justify-between pt-3 border-t border-border">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <Reveal>
              <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-card p-10 text-center shadow-sm">
                <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="size-6" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold">
                  Unable to load medical reports
                </h2>
                <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                  {error instanceof Error
                    ? error.message
                    : "We could not connect to the health vault. Please check your network and try again."}
                </p>
                <Button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="mt-6 gap-2"
                  variant="outline"
                >
                  <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
                  {isFetching ? "Retrying..." : "Try again"}
                </Button>
              </div>
            </Reveal>
          ) : reports.length === 0 ? (
            <Reveal>
              <div className="surface-calm p-5">
                {query.trim() || category !== "all" || rangeId !== "all" ? (
                  <EmptyState
                    icon={FileText}
                    title="No records match this search"
                    body="Try a different keyword, clear the category filter, or widen the date range."
                  />
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No reports uploaded yet"
                    body="Upload your first health report to start building your health timeline."
                    cta="Upload report"
                    ctaHref="/reports/upload"
                  />
                )}
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {reports.map((r, i) => {
                const IconComponent = getCategoryIcon(r.category);
                const isDownloading = downloadingId === r.id;

                return (
                  <Reveal key={r.id} delay={Math.min(i, 5) * 0.06} className="min-w-0">
                    <article className="surface-calm lift flex h-full flex-col p-5">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                            <IconComponent className="size-4.5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">
                              {formatCategoryName(r.category)}
                            </p>
                            <h2 className="mt-0.5 font-display text-base leading-snug font-semibold truncate">
                              {r.title}
                            </h2>
                          </div>
                        </div>
                        <span className="shrink-0 text-right text-xs text-muted-foreground">
                          {formatDate(r.reportDate)}
                        </span>
                      </div>

                      <div className="mt-4 flex-1">
                        <dl className="space-y-1.5 text-xs text-muted-foreground">
                          {r.hospital ? (
                            <div className="flex min-w-0 items-center gap-1.5">
                              <dt className="sr-only">Hospital / Facility</dt>
                              <dd className="truncate font-medium text-foreground">{r.hospital}</dd>
                            </div>
                          ) : null}
                          {r.doctor ? (
                            <div className="flex min-w-0 items-center gap-1.5">
                              <dt className="sr-only">Doctor</dt>
                              <dd className="truncate">{r.doctor}</dd>
                            </div>
                          ) : null}
                          <div className="flex min-w-0 items-center gap-1.5">
                            <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                            <dt className="sr-only">File info</dt>
                            <dd className="truncate">
                              {r.originalFilename} · {formatFileSize(r.fileSize)}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {r.fileType.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {r.processingStatus}
                        </Badge>
                      </div>

                      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/reports/${r.id}`}>
                            View details
                            <ArrowRight className="size-4" aria-hidden="true" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Download ${r.title}`}
                          disabled={isDownloading}
                          onClick={() => handleDownload(r.id, r.originalFilename)}
                        >
                          {isDownloading ? (
                            <Loader2 className="size-4 animate-spin text-primary" />
                          ) : (
                            <Download className="size-4" />
                          )}
                        </Button>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}

          <Reveal delay={0.06}>
            <MedicalDisclaimer />
          </Reveal>
        </div>

        <CreateMedicalShareDialog
          subjectType="user"
          subjectId={user?.id}
          memberDisplayName={user?.name || user?.firstName || "Your Personal Health Vault"}
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
        />
      </div>
    </DashboardShell>
  );
}
