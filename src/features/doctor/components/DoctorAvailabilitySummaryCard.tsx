"use client";

import { Calendar, Clock, Globe, ShieldCheck } from "lucide-react";
import type { DayAvailabilityDto } from "../doctor-types";

interface DoctorAvailabilitySummaryCardProps {
  schedule: DayAvailabilityDto[];
}

function computeWeeklyMetrics(schedule: DayAvailabilityDto[]) {
  let activeDays = 0;
  let totalWindows = 0;
  let totalMinutes = 0;

  for (const day of schedule) {
    if (day.slots && day.slots.length > 0) {
      activeDays += 1;
      totalWindows += day.slots.length;

      for (const slot of day.slots) {
        if (slot.start && slot.end) {
          const [startH, startM] = slot.start.split(":").map(Number);
          const [endH, endM] = slot.end.split(":").map(Number);

          if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
            const startTotal = startH * 60 + startM;
            const endTotal = endH * 60 + endM;
            if (endTotal > startTotal) {
              totalMinutes += endTotal - startTotal;
            }
          }
        }
      }
    }
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const hoursFormatted = remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hrs`;

  return {
    activeDays,
    totalWindows,
    hoursFormatted,
  };
}

export function DoctorAvailabilitySummaryCard({ schedule }: DoctorAvailabilitySummaryCardProps) {
  const { activeDays, totalWindows, hoursFormatted } = computeWeeklyMetrics(schedule);

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Working Days</span>
            <Calendar className="size-4 text-primary" />
          </div>
          <p className="font-display text-2xl font-bold text-foreground">
            {activeDays} <span className="text-xs font-normal text-muted-foreground">/ 7 days</span>
          </p>
          <p className="text-[11px] text-muted-foreground">Days with active consultation hours</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Operating Windows</span>
            <Clock className="size-4 text-accent-strong" />
          </div>
          <p className="font-display text-2xl font-bold text-foreground">
            {totalWindows} <span className="text-xs font-normal text-muted-foreground">windows</span>
          </p>
          <p className="text-[11px] text-muted-foreground">Daily morning, afternoon & evening shifts</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Weekly Hours</span>
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-display text-2xl font-bold text-foreground">{hoursFormatted}</p>
          <p className="text-[11px] text-muted-foreground">Total weekly patient consultation capacity</p>
        </div>
      </div>

      {/* Timezone Information Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Globe className="size-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground">
              Timezone: India Standard Time (IST / Asia/Kolkata)
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              All schedule windows operate on local clinic wall-clock time. Backend dynamically generates patient booking slots based on your saved windows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
