"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  ChevronRight,
  Download,
  FileText,
  FlaskConical,
  HeartPulse,
  MapPin,
  Navigation,
  Pill,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  User as UserIcon,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/landing/reveal";
import { useAuth } from "@/hooks/use-auth";
import { useNearbyHospitalsQuery, useUserLocation, formatFacilityTypeName } from "@/features/hospitals";
import type {
  UserProfileSummary,
  UserVitals,
  UserMetrics,
  HealthVaultSummary,
  TimelinePreviewSummary,
} from "@/features/dashboard/dashboard-types";

/* ---------- formatting helpers ---------- */

function formatCategory(category?: string): string {
  if (!category) return "Medical Record";
  return category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(dateString?: string | Date): string {
  if (!dateString) return "Recent";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateString);
  }
}

function formatEventType(eventType?: string): string {
  if (!eventType) return "Health Event";
  return eventType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function getEventIcon(eventType?: string) {
  switch (eventType?.toLowerCase()) {
    case "report_uploaded":
    case "medical_report":
      return FileText;
    case "vital_check":
      return HeartPulse;
    case "medication_prescribed":
    case "prescription":
      return Pill;
    case "ai_analysis":
      return Sparkles;
    case "diagnosis_recorded":
      return Stethoscope;
    default:
      return FlaskConical;
  }
}

/* ---------- shared building blocks ---------- */

export function WidgetCard({
  title,
  icon: Icon,
  action,
  children,
  className = "",
  variant = "calm",
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "calm" | "ai";
}) {
  return (
    <section
      className={`${variant === "ai" ? "glass-ai" : "surface-calm"} flex h-full flex-col p-5 sm:p-6 ${className}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="flex min-w-0 items-center gap-2 font-display text-base font-semibold">
          {Icon ? <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" /> : null}
          <span className="min-w-0 leading-tight">{title}</span>
        </h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5 flex-1">{children}</div>
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
  ctaHref,
  onCtaClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  cta?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-surface px-5 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">{body}</p>
      {cta ? (
        ctaHref ? (
          <Button asChild size="sm" className="mt-5">
            <Link href={ctaHref}>
              <Plus className="size-4" aria-hidden="true" />
              {cta}
            </Link>
          </Button>
        ) : (
          <Button size="sm" className="mt-5" onClick={onCtaClick}>
            <Plus className="size-4" aria-hidden="true" />
            {cta}
          </Button>
        )
      ) : null}
    </div>
  );
}

export function WidgetSkeleton({ lines = 3, tall = false }: { lines?: number; tall?: boolean }) {
  return (
    <div className="surface-calm h-full p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 w-36" />
      </div>
      {tall ? <Skeleton className="mt-6 h-32 w-full rounded-lg" /> : null}
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- welcome header ---------- */

export function WelcomeHeader({
  profileSummary,
  totalReports,
}: {
  profileSummary?: UserProfileSummary;
  totalReports?: number;
}) {
  const { user } = useAuth();
  const displayName = profileSummary?.firstName || user?.firstName || "User";

  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const vaultStatusText =
    totalReports !== undefined && totalReports > 0
      ? `Your vault is active with ${totalReports} health report${totalReports === 1 ? "" : "s"}.`
      : "Welcome to LifeLedger. Upload your first health report to start building your health vault.";

  return (
    <Reveal>
      <header className="flex flex-col gap-4 pt-6 pb-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            {formattedDate}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}, {displayName}
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">{vaultStatusText}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/doctors">
              <CalendarPlus className="size-4" aria-hidden="true" />
              Book visit
            </Link>
          </Button>
          <Button asChild>
            <Link href="/reports">
              <Upload className="size-4" aria-hidden="true" />
              Upload report
            </Link>
          </Button>
        </div>
      </header>
    </Reveal>
  );
}

/* ---------- vitals & profile metrics ---------- */

export function HealthScoreCard({
  vitals,
  metrics,
}: {
  vitals?: UserVitals;
  metrics?: UserMetrics;
}) {
  const completionPct = metrics?.profileCompletionPercentage ?? 0;
  const hasVitals = !!(vitals?.height || vitals?.weight || vitals?.bmi);

  return (
    <WidgetCard
      title="Recorded Vitals & Profile"
      icon={HeartPulse}
      action={
        hasVitals ? (
          <Badge variant="secondary" className="gap-1.5 text-success">
            Recorded
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1.5 text-muted-foreground">
            Incomplete
          </Badge>
        )
      }
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {hasVitals ? "Physical measurements recorded in profile" : "No vitals recorded yet"}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Overall aggregate health score is intentionally omitted across diagnostic records to maintain clinical integrity.
        </p>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-lg bg-surface p-3.5">
          <dt className="text-xs text-muted-foreground">Height</dt>
          <dd className="mt-1 text-sm font-semibold">
            {vitals?.height ? `${vitals.height} cm` : "Not recorded"}
          </dd>
        </div>

        <div className="rounded-lg bg-surface p-3.5">
          <dt className="text-xs text-muted-foreground">Weight</dt>
          <dd className="mt-1 text-sm font-semibold">
            {vitals?.weight ? `${vitals.weight} kg` : "Not recorded"}
          </dd>
        </div>

        <div className="rounded-lg bg-surface p-3.5">
          <dt className="text-xs text-muted-foreground">BMI</dt>
          <dd className="mt-1 text-sm font-semibold">
            {vitals?.bmi !== null && vitals?.bmi !== undefined ? `${vitals.bmi}` : "—"}
          </dd>
        </div>

        <div className="rounded-lg bg-surface p-3.5">
          <dt className="text-xs text-muted-foreground">Profile Completed</dt>
          <dd className="mt-1 text-sm font-semibold">{completionPct}%</dd>
          <Progress value={completionPct} className="mt-2 h-1.5" />
        </div>
      </dl>
    </WidgetCard>
  );
}

/* ---------- AI insights card ---------- */

export function AiInsightsCard({ totalReports = 0 }: { totalReports?: number }) {
  const hasReports = totalReports > 0;

  return (
    <WidgetCard
      title="AI Health Assistant"
      icon={Sparkles}
      variant="ai"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/reports">
            View Reports
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      }
    >
      <p className="text-sm leading-relaxed text-foreground">
        {hasReports
          ? `You have ${totalReports} report${totalReports === 1 ? "" : "s"} saved in your vault. AI summaries, clinical extractions, and timeline events are generated automatically upon report analysis.`
          : "No medical reports uploaded yet. Upload your blood test, scan, or prescription to generate AI-powered summaries, risk indicators, and automated timeline milestones."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge variant="secondary">
          {hasReports ? `${totalReports} report${totalReports === 1 ? "" : "s"} in vault` : "0 reports in vault"}
        </Badge>
        <Badge variant="secondary">Privacy-First AI</Badge>
      </div>

      <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        AI analysis is for informational purposes only and is not a medical diagnosis.
      </p>
    </WidgetCard>
  );
}

/* ---------- recent reports ---------- */

export function RecentReports({ healthVault }: { healthVault?: HealthVaultSummary }) {
  const reports = healthVault?.recentReports || [];

  return (
    <WidgetCard
      title="Recent Medical Reports"
      icon={FileText}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/reports">
            View all
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      }
    >
      {reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports uploaded yet"
          body="Upload your first health report to start building your health timeline."
          cta="Upload report"
          ctaHref="/reports"
        />
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-surface p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <FlaskConical className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatCategory(r.category)} · {formatDate(r.reportDate)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {r.fileUrl ? (
                  <Button asChild variant="ghost" size="icon" aria-label={`View ${r.title}`}>
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="size-4" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="ghost" size="icon" aria-label={`View ${r.title}`}>
                    <Link href="/reports">
                      <ChevronRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

/* ---------- upcoming appointments ---------- */

export function UpcomingAppointments() {
  return (
    <WidgetCard
      title="Upcoming Appointments"
      icon={CalendarCheck}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/doctors">
            <CalendarPlus className="size-4" aria-hidden="true" />
            Book
          </Link>
        </Button>
      }
    >
      <EmptyState
        icon={CalendarCheck}
        title="No upcoming appointments"
        body="Book consultations with verified doctors or schedule in-clinic visits."
        cta="Find a doctor"
        ctaHref="/doctors"
      />
    </WidgetCard>
  );
}

/* ---------- timeline preview ---------- */

export function TimelinePreviewWidget({
  timelinePreview,
}: {
  timelinePreview?: TimelinePreviewSummary;
}) {
  const events = timelinePreview?.recentEvents || [];

  return (
    <WidgetCard
      title="Health Timeline"
      icon={HeartPulse}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/timeline">
            Full timeline
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      }
    >
      {events.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="No health activity yet"
          body="Your medical timeline will automatically record uploads, prescriptions, and health events."
          cta="View timeline"
          ctaHref="/timeline"
        />
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-6">
          {events.map((t) => {
            const IconComponent = getEventIcon(t.eventType);
            return (
              <li key={t.id} className="relative">
                <span className="absolute -left-[2.05rem] grid size-7 place-items-center rounded-full border border-border bg-card text-primary">
                  <IconComponent className="size-3.5" aria-hidden="true" />
                </span>
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(t.date)} · {t.description || formatEventType(t.eventType)}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </WidgetCard>
  );
}

/* ---------- nearby hospitals ---------- */

export function NearbyHospitals() {
  const { coordinates, status: locationStatus } = useUserLocation(true);

  const { data, isLoading } = useNearbyHospitalsQuery(
    coordinates
      ? {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          radiusKm: 10,
          limit: 3,
        }
      : null,
    {
      enabled: locationStatus === "available" && Boolean(coordinates),
    }
  );

  const hospitals = data?.hospitals?.slice(0, 3) ?? [];

  return (
    <WidgetCard
      title="Nearby Healthcare"
      icon={MapPin}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/hospitals">
            <Navigation className="size-4" aria-hidden="true" />
            Explore
          </Link>
        </Button>
      }
    >
      {locationStatus !== "available" ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 p-5 text-center">
          <p className="text-xs text-muted-foreground">
            Discover verified hospitals, 24/7 clinics, and pharmacies near your location.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-3 gap-1.5 text-xs">
            <Link href="/hospitals">
              <MapPin className="size-3.5 text-primary" />
              Find Nearby Facilities
            </Link>
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      ) : hospitals.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No healthcare facilities found"
          body="No registered facilities found within 10 km of your current location."
          cta="Explore healthcare map"
          ctaHref="/hospitals"
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Showing nearest {hospitals.length} facilities within 10 km:
          </p>
          <ul className="space-y-2.5">
            {hospitals.map((h) => {
              const typeLabel = formatFacilityTypeName(h.facilityType);
              const distanceStr =
                h.distanceKm !== null && h.distanceKm !== undefined
                  ? `${h.distanceKm.toFixed(1)} km away`
                  : "Nearby";

              return (
                <li
                  key={h.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-surface p-3 border border-border/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{h.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {typeLabel}
                      {h.vicinity ? ` · ${h.vicinity}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-primary">{distanceStr}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </WidgetCard>
  );
}

/* ---------- family summary ---------- */

export function FamilySummary({
  profileSummary,
  totalReports = 0,
}: {
  profileSummary?: UserProfileSummary;
  totalReports?: number;
}) {
  const { user } = useAuth();
  const firstName = profileSummary?.firstName || user?.firstName || "You";
  const lastName = profileSummary?.lastName || user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "ME";

  const emergencyContact = profileSummary?.emergencyContact;

  return (
    <WidgetCard
      title="Family Health Vault"
      icon={Users}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/reports">
            <Plus className="size-4" aria-hidden="true" />
            Manage vault
          </Link>
        </Button>
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg bg-surface p-4">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              Primary Account · {totalReports} record{totalReports === 1 ? "" : "s"}
            </p>
          </div>
        </li>

        {emergencyContact?.name ? (
          <li className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg bg-surface p-4">
            <Avatar className="size-10 shrink-0">
              <AvatarFallback className="bg-accent-soft text-xs font-semibold text-accent-foreground">
                <UserIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{emergencyContact.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {emergencyContact.relationship || "Emergency Contact"}
                {emergencyContact.phone ? ` · ${emergencyContact.phone}` : ""}
              </p>
            </div>
          </li>
        ) : (
          <li className="flex items-center justify-center rounded-lg border border-dashed border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Add family members or emergency contacts in your profile settings.
            </p>
          </li>
        )}
      </ul>
    </WidgetCard>
  );
}

/* ---------- emergency QR ---------- */

export function EmergencyQrCard({
  profileSummary,
}: {
  profileSummary?: UserProfileSummary;
}) {
  const bloodGroup = profileSummary?.bloodGroup;
  const emergencyPhone = profileSummary?.emergencyContact?.phone;
  const emergencyName = profileSummary?.emergencyContact?.name;

  return (
    <section className="surface-calm flex h-full flex-col p-5 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="flex min-w-0 items-center gap-2 font-display text-base font-semibold">
          <QrCode className="size-4 shrink-0 text-emergency" aria-hidden="true" />
          <span className="min-w-0 leading-tight">Emergency QR Card</span>
        </h2>
        <Badge className="shrink-0 bg-emergency text-emergency-foreground">Active</Badge>
      </div>

      <div className="mt-5 flex flex-1 flex-col items-center gap-4 rounded-lg bg-surface p-5 text-center sm:flex-row sm:text-left">
        <div className="grid size-28 shrink-0 place-items-center rounded-lg bg-card p-2.5">
          <div
            className="grid size-full grid-cols-7 grid-rows-7 gap-0.5"
            aria-label="Emergency QR code preview"
          >
            {Array.from({ length: 49 }).map((_, i) => (
              <span
                key={i}
                className={
                  [
                    0, 1, 2, 5, 6, 7, 8, 12, 14, 16, 20, 22, 24, 27, 30, 33, 36, 40, 44, 48,
                  ].includes(i)
                    ? "rounded-[1px] bg-foreground"
                    : ""
                }
              />
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {bloodGroup ? `Blood Group: ${bloodGroup}` : "Blood group: Not specified"}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {emergencyName && emergencyPhone
              ? `Emergency Contact: ${emergencyName} (${emergencyPhone}).`
              : "Emergency responders can scan this to view your critical life-saving info."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/emergency">
                <QrCode className="size-4" aria-hidden="true" />
                View Emergency QR
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/emergency">Edit details</Link>
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
        Only emergency-critical fields are shared publicly.
      </p>
    </section>
  );
}

/* ---------- quick actions ---------- */

const quickActionItems = [
  { label: "Upload Report", icon: Upload, to: "/reports" },
  { label: "Book Appointment", icon: CalendarPlus, to: "/doctors" },
  { label: "Find Hospital", icon: MapPin, to: "/hospitals" },
  { label: "View Timeline", icon: HeartPulse, to: "/timeline" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {quickActionItems.map((a, i) => (
        <Reveal key={a.label} delay={i * 0.05} variant="scale" className="min-w-0">
          <Link
            href={a.to}
            className="surface-calm flex h-full min-h-20 items-center gap-3 p-4 transition-[box-shadow,transform] duration-200 ease-[var(--ease-calm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] active:translate-y-0 sm:min-h-24 sm:p-5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary sm:size-11">
              <a.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 text-sm leading-snug font-semibold">{a.label}</span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- notifications (in-page panel) ---------- */

export function NotificationsCard({
  items = [],
}: {
  items?: Array<{ title: string; body: string; time: string; unread: boolean }>;
}) {
  return (
    <WidgetCard
      title="Notifications"
      icon={Sparkles}
      action={
        items.length > 0 ? (
          <Button variant="ghost" size="sm">
            Mark all read
          </Button>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="You're all caught up"
          body="New AI summaries, reminders and scan alerts will show up here."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.title}
              data-unread={n.unread}
              className="rounded-lg bg-surface p-4 data-[unread=true]:bg-primary-soft/50"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <p className="min-w-0 truncate text-sm font-semibold">{n.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
