"use client";

import {
  Building2,
  Clock,
  ExternalLink,
  Globe,
  Info,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Star,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHospitalDetailsQuery } from "../hospital-hooks";
import { formatFacilityTypeName, getFacilityTypeIcon } from "./FacilityCard";

interface FacilityDetailsSheetProps {
  hospitalId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FacilityDetailsSheet({
  hospitalId,
  isOpen,
  onClose,
}: FacilityDetailsSheetProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useHospitalDetailsQuery(hospitalId, {
    enabled: isOpen && Boolean(hospitalId),
  });

  const hospital = data?.hospital;
  const typeLabel = hospital ? formatFacilityTypeName(hospital.facilityType) : "";
  const IconComponent = hospital ? getFacilityTypeIcon(hospital.facilityType) : Building2;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 overflow-hidden bg-card"
      >
        {/* Header */}
        <div className="border-b border-border/60 p-6 pb-4">
          <SheetHeader className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 font-medium text-xs">
                <IconComponent className="size-3 text-primary" aria-hidden="true" />
                {typeLabel || "Facility Details"}
              </Badge>
              {hospital?.businessStatus ? (
                <Badge
                  variant="outline"
                  className={
                    hospital.businessStatus === "OPERATIONAL"
                      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {hospital.businessStatus === "OPERATIONAL" ? "Operational" : hospital.businessStatus}
                </Badge>
              ) : null}
            </div>

            <SheetTitle className="font-display text-xl font-bold leading-snug sm:text-2xl pt-1">
              {isLoading ? (
                <Skeleton className="h-7 w-3/4" />
              ) : (
                hospital?.name || "Healthcare Facility"
              )}
            </SheetTitle>

            <SheetDescription className="text-xs text-muted-foreground">
              Real-time healthcare facility profile and contact information
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
            </div>
          ) : isError ? (
            <div className="surface-calm flex flex-col items-center justify-center rounded-xl p-8 text-center border border-destructive/20 bg-destructive/5">
              <Info className="size-8 text-destructive mb-2" aria-hidden="true" />
              <h4 className="font-semibold text-foreground">Failed to load facility details</h4>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                {error?.message || "Could not retrieve details for this facility from the provider."}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4 gap-1.5"
                onClick={() => refetch()}
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Retry
              </Button>
            </div>
          ) : hospital ? (
            <>
              {/* Rating & Distance Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-surface p-3.5">
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    Rating & Reviews
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    {hospital.rating !== null && hospital.rating !== undefined ? (
                      <>
                        <span className="flex items-center gap-1 text-base font-bold text-foreground">
                          <Star className="size-4 fill-accent text-accent" aria-hidden="true" />
                          {hospital.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({hospital.reviewCount.toLocaleString("en-IN")} reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No ratings listed</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-surface p-3.5">
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    Straight-Line Distance
                  </span>
                  <p className="mt-1 text-base font-bold text-foreground">
                    {hospital.distanceKm !== null && hospital.distanceKm !== undefined
                      ? `${hospital.distanceKm.toFixed(1)} km`
                      : "Nearby"}
                  </p>
                  <span className="text-[10px] text-muted-foreground block">
                    Geodesic distance from your coordinates
                  </span>
                </div>
              </div>

              {/* Editorial Summary */}
              {hospital.editorialSummary ? (
                <div className="rounded-xl border border-primary/20 bg-primary-soft/40 p-4">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Facility Overview
                  </h4>
                  <p className="mt-1 text-sm text-foreground leading-relaxed">
                    {hospital.editorialSummary}
                  </p>
                </div>
              ) : null}

              {/* Address Section */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Address & Vicinity
                </h4>
                <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-surface p-3.5">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {hospital.formattedAddress || hospital.address}
                    </p>
                    {hospital.vicinity && hospital.vicinity !== hospital.address ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Vicinity: {hospital.vicinity}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact & Online Presence
                </h4>

                <div className="space-y-2">
                  {hospital.phone || hospital.formattedPhone || hospital.internationalPhone ? (
                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-surface p-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Phone className="size-4 text-primary shrink-0" aria-hidden="true" />
                        <span className="text-sm font-medium text-foreground truncate">
                          {hospital.formattedPhone || hospital.phone || hospital.internationalPhone}
                        </span>
                      </div>
                      <Button asChild size="sm" variant="secondary" className="gap-1.5 shrink-0">
                        <a href={`tel:${(hospital.phone || hospital.formattedPhone || "").replace(/\s/g, "")}`}>
                          <Phone className="size-3.5" aria-hidden="true" />
                          Call
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-surface/50 p-3 text-xs text-muted-foreground italic">
                      <Phone className="size-3.5" aria-hidden="true" />
                      No direct telephone number listed by provider
                    </div>
                  )}

                  {hospital.website ? (
                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-surface p-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Globe className="size-4 text-primary shrink-0" aria-hidden="true" />
                        <span className="text-sm font-medium text-foreground truncate">
                          {hospital.website.replace(/^https?:\/\//, "")}
                        </span>
                      </div>
                      <Button asChild size="sm" variant="outline" className="gap-1.5 shrink-0">
                        <a href={hospital.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                          Visit
                        </a>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Operating Hours
                  </h4>
                  {hospital.isOpen !== null && hospital.isOpen !== undefined ? (
                    <Badge
                      className={
                        hospital.isOpen
                          ? "bg-emerald-600/15 text-emerald-700 border-emerald-600/30 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }
                      variant="outline"
                    >
                      <Clock className="mr-1 size-3" aria-hidden="true" />
                      {hospital.isOpen ? "Open Now" : "Closed"}
                    </Badge>
                  ) : null}
                </div>

                {hospital.openingHours?.weekdayText && hospital.openingHours.weekdayText.length > 0 ? (
                  <div className="rounded-xl border border-border/60 bg-surface p-3.5">
                    <ul className="space-y-1.5 text-xs text-foreground">
                      {hospital.openingHours.weekdayText.map((schedule, idx) => (
                        <li key={idx} className="flex justify-between border-b border-border/40 pb-1 last:border-0 last:pb-0">
                          <span className="font-medium text-muted-foreground">
                            {schedule.split(": ")[0]}
                          </span>
                          <span className="font-semibold text-right">
                            {schedule.split(": ").slice(1).join(": ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="rounded-xl border border-border/40 bg-surface/50 p-3 text-xs text-muted-foreground italic">
                    Operating schedule is not published for this facility.
                  </p>
                )}
              </div>

              {/* Provider Metadata Note */}
              <div className="rounded-lg bg-surface/60 p-3 text-[11px] text-muted-foreground">
                <span className="font-medium">Provider ID:</span> {hospital.providerPlaceId || hospital.id}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        {hospital ? (
          <div className="border-t border-border/60 p-4 bg-surface/40 flex gap-2">
            {hospital.directionsUrl || hospital.googleMapsUrl ? (
              <Button asChild className="flex-1 gap-2 shadow-sm" size="lg">
                <a
                  href={hospital.directionsUrl || hospital.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open navigation directions"
                >
                  <Navigation className="size-4" aria-hidden="true" />
                  Get Navigation Directions
                </a>
              </Button>
            ) : null}
            <Button variant="outline" size="lg" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
