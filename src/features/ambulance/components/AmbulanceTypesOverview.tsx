"use client";

import { Ambulance } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAmbulanceTypesQuery } from "../ambulance-hooks";

export function AmbulanceTypesOverview() {
  const { data: types = [], isLoading, isError } = useAmbulanceTypesQuery();

  return (
    <section
      className="surface-calm rounded-2xl border border-border/60 p-5 sm:p-6"
      aria-label="Ambulance Types & Clinical Capabilities"
    >
      <div className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
            <Ambulance className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
              Ambulance Types & Specifications
            </h3>
            <p className="text-xs text-muted-foreground">
              Standard medical transport categories deployed by EMS services in India
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          <>
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </>
        ) : isError || types.length === 0 ? (
          <div className="sm:col-span-2 rounded-xl border border-border/60 bg-surface p-4 text-xs text-muted-foreground text-center">
            Standard EMS ambulance specifications are available via emergency helpline 108.
          </div>
        ) : (
          types.map((spec) => (
            <div
              key={spec.type}
              className="flex flex-col justify-between rounded-xl border border-border/60 bg-surface p-4 shadow-sm space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display font-semibold text-sm text-foreground">
                    {spec.name}
                  </h4>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-mono">
                    {spec.type.replace("_", " ")}
                  </Badge>
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {spec.description}
                </p>

                {/* Suitable For */}
                <div className="mt-3 rounded-lg bg-card/60 p-2.5 border border-border/40 text-[11px] text-muted-foreground">
                  <strong className="text-foreground block mb-0.5">Clinical Suitability:</strong>
                  {spec.suitableFor}
                </div>

                {/* Equipment Highlights */}
                {spec.equipment && spec.equipment.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Standard On-board Equipment:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {spec.equipment.map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[10px]">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <p className="text-[10px] text-muted-foreground italic border-t border-border/40 pt-2">
                {spec.dispatchNotice}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
