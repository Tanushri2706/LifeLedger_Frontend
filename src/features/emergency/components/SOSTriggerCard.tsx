"use client";

import { useState, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useTriggerSOSMutation } from "../emergency-hooks";
import type { TriggerSOSResponseDto } from "../emergency-types";
import { INDIA_EMERGENCY_NUMBERS } from "../emergency-types";

export function SOSTriggerCard() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sosNotes, setSosNotes] = useState("");
  const [locating, setLocating] = useState(false);
  const [sosResult, setSosResult] = useState<TriggerSOSResponseDto | null>(null);

  const triggerMutation = useTriggerSOSMutation();

  const handleInitiateSOS = () => {
    setIsConfirmOpen(true);
  };

  const handleExecuteSOS = useCallback(async () => {
    setLocating(true);

    let coords: { latitude?: number; longitude?: number } = {};

    // Attempt point-in-time location capture with quick timeout
    if (typeof window !== "undefined" && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 4000,
            maximumAge: 10000,
          });
        });
        coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch {
        // Location denied or timed out — SOS still proceeds cleanly
        coords = {};
      }
    }

    setLocating(false);

    try {
      const response = await triggerMutation.mutateAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
        notes: sosNotes.trim() || undefined,
      });

      setSosResult(response);
      setIsConfirmOpen(false);
      setSosNotes("");
    } catch {
      // Error handled by mutation toast
    }
  }, [sosNotes, triggerMutation]);

  return (
    <>
      <section
        className="surface-calm rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6"
        aria-label="Intentional Emergency SOS Trigger"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
              <ShieldAlert className="size-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
                  Emergency SOS Safety Audit
                </h3>
                <Badge variant="outline" className="text-[11px] text-destructive border-destructive/30">
                  Audit Log
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground max-w-xl leading-relaxed">
                Records a timestamped safety distress event in your personal ledger with optional GPS coordinates.
                To request physical emergency dispatch, immediately dial <strong className="text-foreground">112</strong> or <strong className="text-foreground">108</strong>.
              </p>
            </div>
          </div>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleInitiateSOS}
            className="w-full sm:w-auto shrink-0 gap-2 font-bold shadow-md bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]"
            aria-label="Record SOS Safety Event"
          >
            <Siren className="size-4" aria-hidden="true" />
            Trigger SOS Audit
          </Button>
        </div>

        {/* Successful SOS Event Resolution Box */}
        {sosResult ? (
          <div className="mt-5 rounded-xl border border-success/30 bg-success/10 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground">
                  Emergency Safety Event Recorded
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {sosResult.sosRecord.disclaimer}
                </p>

                {/* Instructions */}
                <div className="mt-3 rounded-lg bg-card/80 p-3 border border-border/60 text-xs space-y-1.5">
                  <span className="font-semibold text-foreground block">
                    Immediate Action Instructions:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    {sosResult.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>

                {/* Quick Call Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" className="bg-emergency text-emergency-foreground gap-1.5">
                    <a href={INDIA_EMERGENCY_NUMBERS.NATIONAL_EMERGENCY.actionUrl}>
                      <PhoneCall className="size-3.5" aria-hidden="true" />
                      Dial 112 (National Emergency)
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="default" className="gap-1.5">
                    <a href={INDIA_EMERGENCY_NUMBERS.AMBULANCE.actionUrl}>
                      <PhoneCall className="size-3.5" aria-hidden="true" />
                      Dial 108 (Ambulance Response)
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSosResult(null)}
                    className="text-xs"
                  >
                    Dismiss Notice
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* SOS Trigger Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-destructive/15 text-destructive">
                <AlertTriangle className="size-4" aria-hidden="true" />
              </span>
              <DialogTitle className="font-display text-lg">Confirm SOS Safety Record</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              This action logs a permanent safety distress entry in your LifeLedger account and captures your point-in-time coordinates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-surface p-3 border border-border/60 text-xs text-muted-foreground">
              <strong className="text-foreground block mb-1">Important Safety Notice:</strong>
              Software SOS does not automatically dispatch physical emergency personnel. If you require immediate police, medical, or fire assistance, dial <strong>112</strong> or <strong>108</strong> directly.
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sos-notes" className="text-xs font-semibold text-muted-foreground">
                Optional Emergency Notes (e.g. location details, symptoms):
              </label>
              <Textarea
                id="sos-notes"
                value={sosNotes}
                onChange={(e) => setSosNotes(e.target.value)}
                placeholder="e.g. Near metro station gate 2, experiencing chest tightness..."
                className="h-20 text-xs"
                maxLength={300}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={triggerMutation.isPending || locating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleExecuteSOS}
              disabled={triggerMutation.isPending || locating}
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {triggerMutation.isPending || locating ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" />
                  Recording SOS...
                </>
              ) : (
                <>
                  <Siren className="size-3.5" aria-hidden="true" />
                  Confirm & Record SOS
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
