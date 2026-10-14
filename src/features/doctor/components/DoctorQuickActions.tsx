"use client";

import Link from "next/link";
import {
  CalendarHeart,
  CalendarClock,
  UserCheck,
  Settings,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DoctorQuickActions() {
  const actions = [
    {
      title: "Appointments Schedule",
      description: "Review today's appointments and upcoming patient consultations.",
      href: "/doctor/appointments",
      icon: CalendarHeart,
      primary: true,
    },
    {
      title: "Slot Availability",
      description: "Configure weekly working days, in-clinic hours, and consultation slots.",
      href: "/doctor/availability",
      icon: CalendarClock,
    },
    {
      title: "Profile & Credentials",
      description: "Update clinic address, consultation fees, and spoken languages.",
      href: "/doctor/profile",
      icon: UserCheck,
    },
    {
      title: "Doctor Settings",
      description: "Manage workspace appearance and portal security preferences.",
      href: "/doctor/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8 space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Practice Actions
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Quick shortcuts to manage your clinic schedule, availability, and credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.href}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-surface/50 hover:bg-surface transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Icon className="size-5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground">{act.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{act.description}</p>
                </div>
              </div>

              <Button
                asChild
                variant={act.primary ? "default" : "outline"}
                size="sm"
                className="text-xs font-semibold h-9 shrink-0 gap-1.5 self-start sm:self-center"
              >
                <Link href={act.href}>
                  Open
                  <ChevronRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
