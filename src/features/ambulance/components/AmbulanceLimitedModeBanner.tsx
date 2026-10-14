"use client";

import { Ambulance, Phone, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INDIA_EMERGENCY_NUMBERS } from "@/features/emergency";

export function AmbulanceLimitedModeBanner() {
  const { NATIONAL_EMERGENCY, AMBULANCE } = INDIA_EMERGENCY_NUMBERS;

  return (
    <section
      className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6 backdrop-blur-sm"
      aria-label="Ambulance Service Notice"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <Ambulance className="size-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
                  Emergency Ambulance Services
                </h2>
                <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                  Telephony Mode
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-2xl">
                Real-time automated ambulance dispatch and live GPS vehicle tracking are not currently connected in LifeLedger.
                For urgent medical transport, dial <strong className="text-foreground">108</strong> (Ambulance) or <strong className="text-foreground">112</strong> (Unified Emergency) directly on your telephone.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Direct Calling Grid */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2">
          <Button
            asChild
            size="lg"
            className="w-full gap-2 text-sm font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
          >
            <a href={AMBULANCE.actionUrl} aria-label="Call 108 Ambulance Service">
              <Phone className="size-4" aria-hidden="true" />
              Call 108 (Ambulance Response)
            </a>
          </Button>

          <Button
            asChild
            size="lg"
            variant="default"
            className="w-full gap-2 text-sm font-bold shadow-md bg-emergency text-emergency-foreground hover:bg-emergency/90 active:scale-[0.98]"
          >
            <a href={NATIONAL_EMERGENCY.actionUrl} aria-label="Call 112 National Emergency">
              <PhoneCall className="size-4" aria-hidden="true" />
              Call 112 (National Emergency)
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
