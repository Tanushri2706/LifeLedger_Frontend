"use client";

import { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";
import { DashboardShell, notifications } from "@/components/dashboard/dashboard-shell";
import {
  EmergencyQrCard,
  FamilySummary,
  HealthScoreCard,
  NearbyHospitals,
  NotificationsCard,
  QuickActions,
  RecentReports,
  TimelinePreviewWidget,
  UpcomingAppointments,
  WelcomeHeader,
  WidgetSkeleton,
} from "@/components/dashboard/widgets";
import {
  AbnormalMarkersCard,
  DoctorDiscussionAndWellnessCard,
  DocumentedDiagnosesAndMedicationsCard,
  HealthIntelligenceError,
  HealthIntelligenceSkeleton,
  HealthOverviewHeroCard,
  HistoricalFindingsCard,
  KeyObservationsCard,
  LongitudinalTrendsCard,
  MandatoryDisclaimerCard,
  NoAnalyzedReportsIntelligenceCard,
  NoReportsIntelligenceCard,
} from "@/components/dashboard/health-intelligence-widgets";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardQuery, isUserDashboard } from "@/features/dashboard";
import { useHealthIntelligenceQuery } from "@/features/health-intelligence";
import {
  ActiveSharesList,
  CreateMedicalShareDialog,
} from "@/features/medical-share/components";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isPersonalShareOpen, setIsPersonalShareOpen] = useState(false);

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
    isFetching: isDashboardFetching,
  } = useDashboardQuery();

  const {
    data: healthIntelData,
    isLoading: isHealthIntelLoading,
    isError: isHealthIntelError,
    error: healthIntelError,
    refetch: refetchHealthIntel,
    isFetching: isHealthIntelFetching,
  } = useHealthIntelligenceQuery();

  const userDashboardData = isUserDashboard(dashboardData) ? dashboardData : undefined;

  return (
    <DashboardShell>
      {isDashboardLoading ? (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-3 pt-6 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
              <div className="h-8 w-64 rounded bg-muted animate-pulse" />
              <div className="h-4 w-80 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-28 rounded bg-muted animate-pulse" />
              <div className="h-10 w-32 rounded bg-muted animate-pulse" />
            </div>
          </div>

          <QuickActions />

          <div className="space-y-6">
            <WidgetSkeleton tall lines={4} />
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <WidgetSkeleton lines={3} />
              <WidgetSkeleton lines={3} />
            </div>
          </div>
        </div>
      ) : isDashboardError ? (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-card p-10 text-center shadow-sm">
            <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold">
              Unable to load your dashboard
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              {dashboardError instanceof Error
                ? dashboardError.message
                : "We could not connect to the health ledger service. Please verify your connection and try again."}
            </p>
            <Button
              onClick={() => refetchDashboard()}
              disabled={isDashboardFetching}
              className="mt-6 gap-2"
              variant="outline"
            >
              <RefreshCw className={`size-4 ${isDashboardFetching ? "animate-spin" : ""}`} />
              {isDashboardFetching ? "Retrying..." : "Try again"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <WelcomeHeader
            profileSummary={userDashboardData?.profileSummary}
            totalReports={userDashboardData?.healthVault?.totalReports}
          />

          <div className="mt-6 space-y-8 pb-8">
            <QuickActions />

            {/* ========================================================= */}
            {/* PRIMARY SECTION: AGGREGATE HEALTH INTELLIGENCE            */}
            {/* ========================================================= */}
            <div className="space-y-6" id="health-intelligence">
              {isHealthIntelLoading ? (
                <HealthIntelligenceSkeleton />
              ) : isHealthIntelError ? (
                <HealthIntelligenceError
                  error={healthIntelError}
                  onRetry={() => refetchHealthIntel()}
                  isFetching={isHealthIntelFetching}
                />
              ) : !healthIntelData || healthIntelData.status === "no_reports" ? (
                <Reveal>
                  <NoReportsIntelligenceCard />
                </Reveal>
              ) : healthIntelData.status === "no_analyzed_reports" ? (
                <Reveal>
                  <NoAnalyzedReportsIntelligenceCard coverage={healthIntelData.coverage} />
                </Reveal>
              ) : (
                <>
                  {/* Main Health Overview Hero Card */}
                  <Reveal>
                    <HealthOverviewHeroCard
                      data={healthIntelData}
                      onRefresh={() => refetchHealthIntel()}
                      isRefreshing={isHealthIntelFetching}
                    />
                  </Reveal>

                  {/* Key Observations & Current Abnormal Values */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Reveal>
                      <KeyObservationsCard
                        observations={healthIntelData.aiSynthesis?.keyObservations}
                        currentObservations={healthIntelData.currentObservations}
                      />
                    </Reveal>
                    <Reveal delay={0.05}>
                      <AbnormalMarkersCard
                        currentFlaggedMarkers={healthIntelData.currentFlaggedMarkers}
                        markers={healthIntelData.abnormalMarkers}
                      />
                    </Reveal>
                  </div>

                  {/* Historical Findings & Prior Records (Dedicated Section) */}
                  {(Boolean(healthIntelData.historicalFindings?.length) ||
                    Boolean(healthIntelData.historicalFlaggedMarkers?.length) ||
                    Boolean(healthIntelData.historicalDiagnoses?.length) ||
                    Boolean(healthIntelData.aiSynthesis?.historicalFindings?.length)) && (
                    <Reveal delay={0.06}>
                      <HistoricalFindingsCard
                        findings={healthIntelData.historicalFindings ?? healthIntelData.aiSynthesis?.historicalFindings}
                        historicalFlaggedMarkers={healthIntelData.historicalFlaggedMarkers}
                        historicalDiagnoses={healthIntelData.historicalDiagnoses}
                      />
                    </Reveal>
                  )}

                  {/* Longitudinal Trends (Changes over time) */}
                  <Reveal delay={0.08}>
                    <LongitudinalTrendsCard trends={healthIntelData.longitudinalTrends} />
                  </Reveal>

                  {/* Doctor Discussion Points & General Wellness Guidance */}
                  <Reveal delay={0.1}>
                    <DoctorDiscussionAndWellnessCard
                      areasToDiscuss={healthIntelData.aiSynthesis?.areasToDiscussWithDoctor}
                      wellnessGuidance={healthIntelData.aiSynthesis?.generalWellnessGuidance}
                    />
                  </Reveal>

                  {/* Documented Diagnoses & Medications */}
                  <Reveal delay={0.12}>
                    <DocumentedDiagnosesAndMedicationsCard
                      currentDiagnoses={healthIntelData.currentDiagnoses}
                      historicalDiagnoses={healthIntelData.historicalDiagnoses}
                      diagnoses={healthIntelData.documentedDiagnoses}
                      medications={healthIntelData.activeMedications}
                    />
                  </Reveal>

                  {/* Mandatory Clinical Disclaimer */}
                  <Reveal delay={0.14}>
                    <MandatoryDisclaimerCard disclaimer={healthIntelData.disclaimer} />
                  </Reveal>
                </>
              )}
            </div>

            {/* ========================================================= */}
            {/* SECONDARY CLINICAL & RECORD MANAGEMENT SECTIONS           */}
            {/* ========================================================= */}
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Reveal>
                <HealthScoreCard
                  vitals={userDashboardData?.vitals}
                  metrics={userDashboardData?.metrics}
                />
              </Reveal>
              <Reveal delay={0.08}>
                <RecentReports healthVault={userDashboardData?.healthVault} />
              </Reveal>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Reveal>
                <UpcomingAppointments />
              </Reveal>
              <Reveal delay={0.08}>
                <NearbyHospitals />
              </Reveal>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Reveal>
                <TimelinePreviewWidget timelinePreview={userDashboardData?.timelinePreview} />
              </Reveal>
              <Reveal delay={0.08}>
                <NotificationsCard items={notifications} />
              </Reveal>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Reveal id="family-vault">
                <FamilySummary
                  profileSummary={userDashboardData?.profileSummary}
                  totalReports={userDashboardData?.healthVault?.totalReports}
                />
              </Reveal>
              <Reveal delay={0.08} id="emergency-qr">
                <EmergencyQrCard profileSummary={userDashboardData?.profileSummary} />
              </Reveal>
            </div>

            {/* ========================================================= */}
            {/* PERSONAL MEDICAL SHARES MANAGEMENT SECTION                 */}
            {/* ========================================================= */}
            <Reveal id="medical-shares">
              <section className="surface-calm flex h-full flex-col p-5 sm:p-6 rounded-2xl">
                <ActiveSharesList
                  subjectType="user"
                  subjectId={user?.id}
                  subjectDisplayName="your personal vault"
                  onCreateNewShare={() => setIsPersonalShareOpen(true)}
                />
              </section>
            </Reveal>

            <CreateMedicalShareDialog
              subjectType="user"
              subjectId={user?.id}
              memberDisplayName={user?.name || user?.firstName || "Your Personal Health Vault"}
              open={isPersonalShareOpen}
              onOpenChange={setIsPersonalShareOpen}
            />
          </div>
        </>
      )}
    </DashboardShell>
  );
}
