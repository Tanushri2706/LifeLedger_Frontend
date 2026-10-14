"use client";

import { DoctorShell } from "@/components/doctor/doctor-shell";
import {
  useDoctorDashboardQuery,
  useDoctorAppointmentsQuery,
  useDoctorProfileQuery,
  DoctorDashboardHeader,
  DoctorMetricsGrid,
  DoctorAppointmentsPreview,
  DoctorProfessionalSummary,
  DoctorQuickActions,
} from "@/features/doctor";

export default function DoctorDashboardPage() {
  const { data: dashboard, isLoading: isDashboardLoading } = useDoctorDashboardQuery();
  const { data: appointments = [], isLoading: isAppointmentsLoading } = useDoctorAppointmentsQuery();
  const { data: profile } = useDoctorProfileQuery();

  // Combine today's appointments from dashboard or full list filtered to today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppts =
    dashboard?.todayAppointments && dashboard.todayAppointments.length > 0
      ? dashboard.todayAppointments
      : appointments.filter((a) => a.date?.startsWith(todayStr) || a.date?.includes("Today"));

  const metrics = dashboard?.metrics || {
    todayAppointments: todayAppts.length,
    upcomingAppointments: appointments.filter((a) => a.status === "confirmed" || a.status === "pending").length,
    pendingAppointments: appointments.filter((a) => a.status === "pending").length,
    completedAppointments: appointments.filter((a) => a.status === "completed").length,
  };

  return (
    <DoctorShell>
      <div className="space-y-6 pt-2 pb-10">
        {/* Header Greeting */}
        <DoctorDashboardHeader />

        {/* Real Metrics Grid */}
        <DoctorMetricsGrid metrics={metrics} isLoading={isDashboardLoading} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left / Main Column: Today's Appointments Preview */}
          <div className="lg:col-span-2 space-y-6">
            <DoctorAppointmentsPreview
              appointments={todayAppts.length > 0 ? todayAppts : appointments.slice(0, 5)}
              isLoading={isDashboardLoading || isAppointmentsLoading}
            />
          </div>

          {/* Right Column: Professional Summary & Quick Actions */}
          <div className="space-y-6">
            <DoctorProfessionalSummary
              doctorProfile={dashboard?.doctor || profile}
            />

            <DoctorQuickActions />
          </div>
        </div>
      </div>
    </DoctorShell>
  );
}
