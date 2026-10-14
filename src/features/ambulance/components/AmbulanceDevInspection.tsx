"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Code, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNearbyAmbulancesQuery } from "../ambulance-hooks";

export function AmbulanceDevInspection() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, isError } = useNearbyAmbulancesQuery(
    { latitude: 28.6139, longitude: 77.209 },
    { enabled: isOpen }
  );

  return (
    <section className="rounded-2xl border border-dashed border-border/80 bg-surface/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Code className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Developer Inspection (Simulated DTOs)
          </span>
          <Badge variant="outline" className="text-[10px] bg-muted">
            Dev Only
          </Badge>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-8 gap-1.5 text-xs text-muted-foreground"
        >
          {isOpen ? "Hide Mock DTOs" : "Inspect Backend DTOs"}
          {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-2 rounded-lg bg-surface p-2.5 text-xs text-muted-foreground border border-border/60">
            <Info className="size-3.5 text-primary shrink-0" />
            <span>
              These entries represent simulated backend DTO contracts for integration testing. They are isolated from normal patient emergency flows.
            </span>
          </div>

          {isLoading ? (
            <p className="text-xs text-muted-foreground">Loading test records...</p>
          ) : isError ? (
            <p className="text-xs text-destructive">Failed to fetch mock ambulance DTOs.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto rounded-lg bg-card p-3 font-mono text-[11px] border border-border/60">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
