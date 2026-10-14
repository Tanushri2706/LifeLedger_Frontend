"use client";

import { useAuth } from "@/hooks/use-auth";
import { Stethoscope } from "lucide-react";

export function DoctorDashboardHeader() {
  const { user } = useAuth();

  const doctorName = user
    ? `Dr. ${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Doctor"
    : "Doctor";

  const specialization =
    user && "specialization" in user && user.specialization
      ? user.specialization
      : "Medical Practice";

  const hospital =
    user && "hospital" in user && user.hospital ? ` · ${user.hospital}` : "";

  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-1.5 pt-2 pb-1">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {doctorName}
        </h1>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-medium text-foreground flex items-center gap-1">
          <Stethoscope className="size-3.5 text-primary" />
          {specialization}
          {hospital}
        </span>
        <span className="text-muted-foreground/60 hidden sm:inline">|</span>
        <span>{todayFormatted}</span>
      </p>
    </div>
  );
}
