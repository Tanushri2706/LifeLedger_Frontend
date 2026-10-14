"use client";

import { Phone, PhoneCall, Siren, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INDIA_EMERGENCY_NUMBERS } from "../emergency-types";

interface EmergencyCallingBannerProps {
  className?: string;
}

export function EmergencyCallingBanner({ className = "" }: EmergencyCallingBannerProps) {
  const { NATIONAL_EMERGENCY, AMBULANCE } = INDIA_EMERGENCY_NUMBERS;

  return (
    <section
      className={`rounded-2xl border border-emergency/30 bg-emergency/10 p-5 sm:p-6 backdrop-blur-sm ${className}`}
      aria-label="Direct Emergency Helpline Actions"
    >
      <div className="flex flex-col gap-4">
        {/* Header note */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-emergency text-emergency-foreground shadow-sm">
              <Siren className="size-4 animate-pulse" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
                Emergency Helplines (India)
              </h2>
              <p className="text-xs text-muted-foreground">
                Direct device telephony links for immediate life-saving response
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emergency/20 text-emergency border-emergency/40 text-xs font-semibold">
            24×7 Active
          </Badge>
        </div>

        {/* Primary Helpline Calling Buttons Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* 112 National Unified Helpline */}
          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-emergency sm:text-3xl">
                  {NATIONAL_EMERGENCY.number}
                </span>
                <Badge variant="secondary" className="text-[11px] font-medium">
                  Unified National
                </Badge>
              </div>
              <h3 className="mt-1 font-semibold text-sm text-foreground">
                {NATIONAL_EMERGENCY.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {NATIONAL_EMERGENCY.description}
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="mt-4 w-full gap-2 bg-emergency text-emergency-foreground hover:bg-emergency/90 text-sm font-bold shadow-md active:scale-[0.98] transition-transform"
            >
              <a href={NATIONAL_EMERGENCY.actionUrl} aria-label="Call 112 National Emergency Helpline">
                <PhoneCall className="size-4" aria-hidden="true" />
                Call 112 (National Emergency)
              </a>
            </Button>
          </div>

          {/* 108 Ambulance / Emergency Medical Response */}
          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-primary sm:text-3xl">
                  {AMBULANCE.number}
                </span>
                <Badge variant="secondary" className="text-[11px] font-medium">
                  Medical Response
                </Badge>
              </div>
              <h3 className="mt-1 font-semibold text-sm text-foreground">
                {AMBULANCE.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {AMBULANCE.description}
              </p>
              <div className="mt-2 flex items-start gap-1 text-[11px] text-muted-foreground">
                <AlertCircle className="size-3 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{AMBULANCE.regionalNote}</span>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              variant="default"
              className="mt-4 w-full gap-2 text-sm font-bold shadow-md active:scale-[0.98] transition-transform"
            >
              <a href={AMBULANCE.actionUrl} aria-label="Call 108 Ambulance Emergency Helpline">
                <Phone className="size-4" aria-hidden="true" />
                Call 108 (Ambulance Response)
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
