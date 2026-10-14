"use client";

import { CalendarCheck, CalendarClock, Clock, Stethoscope } from "lucide-react";
import type { DoctorDashboardMetricsDto } from "../doctor-types";

interface DoctorMetricsGridProps {
  metrics?: DoctorDashboardMetricsDto;
  isLoading?: boolean;
}

export function DoctorMetricsGrid({ metrics, isLoading }: DoctorMetricsGridProps) {
  const cards = [
    {
      label: "Today's Consultations",
      value: metrics?.todayAppointments ?? 0,
      icon: CalendarCheck,
      color: "text-primary bg-primary/10",
      description: "Scheduled for today",
    },
    {
      label: "Upcoming Appointments",
      value: metrics?.upcomingAppointments ?? 0,
      icon: CalendarClock,
      color: "text-accent-strong bg-accent-soft",
      description: "Next upcoming sessions",
    },
    {
      label: "Pending Approvals",
      value: metrics?.pendingAppointments ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
      description: "Awaiting your confirmation",
    },
    {
      label: "Completed Consultations",
      value: metrics?.completedAppointments ?? metrics?.totalAppointments ?? 0,
      icon: Stethoscope,
      color: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
      description: "Total completed on LifeLedger",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`flex size-9 items-center justify-center rounded-xl ${card.color}`}>
                <Icon className="size-4" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {isLoading ? "—" : card.value}
              </p>
              <p className="text-[11px] text-muted-foreground">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
