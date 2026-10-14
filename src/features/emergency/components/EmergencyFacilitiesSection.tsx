"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Compass,
  MapPin,
  Navigation,
  RefreshCw,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNearbyHospitalsQuery,
  useUserLocation,
  FacilityDetailsSheet,
} from "@/features/hospitals";

export function EmergencyFacilitiesSection() {
  const { status: locationStatus, coordinates, requestLocation } = useUserLocation(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useNearbyHospitalsQuery(
    coordinates
      ? {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          radiusKm: 20,
          type: "hospital",
          sort: "distance",
          openNow: true,
        }
      : null,
    {
      enabled: locationStatus === "available" && Boolean(coordinates),
    }
  );

  const hospitals = data?.hospitals ?? [];

  return (
    <section
      className="surface-calm rounded-2xl border border-border/60 p-5 sm:p-6"
      aria-label="Nearby Emergency Healthcare Facilities"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
              Nearby Emergency Healthcare Facilities
            </h3>
            <p className="text-xs text-muted-foreground">
              Proximity-sorted hospitals with 24/7 casualty and emergency care
            </p>
          </div>
        </div>

        <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
          <Link href="/hospitals">
            Explore All Facilities
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      {/* Facilities List or Location Prompt */}
      <div className="mt-5">
        {locationStatus !== "available" ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface/40 p-6 text-center">
            <Compass className="size-7 text-muted-foreground mb-2" aria-hidden="true" />
            <p className="text-xs font-semibold text-foreground">
              Enable location to discover emergency facilities closest to you
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={requestLocation}
              className="mt-3 gap-1.5 text-xs"
            >
              <MapPin className="size-3.5 text-primary" />
              Acquire GPS Location
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border/60 bg-surface p-4 text-center text-xs text-muted-foreground">
            <p>Could not retrieve nearby facilities at this moment.</p>
            <Button size="sm" variant="ghost" onClick={() => refetch()} className="mt-2 text-xs">
              <RefreshCw className="size-3.5 mr-1" /> Retry
            </Button>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-surface p-6 text-center text-xs text-muted-foreground">
            No 24/7 hospitals found within 20 km of your current coordinates.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hospitals.slice(0, 3).map((hospital) => (
              <div
                key={hospital.id}
                className="flex flex-col justify-between rounded-xl border border-border/60 bg-surface p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      Hospital
                    </Badge>
                    {hospital.rating !== null && hospital.rating !== undefined ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold">
                        <Star className="size-3 fill-accent text-accent" />
                        {hospital.rating.toFixed(1)}
                      </span>
                    ) : null}
                  </div>

                  <h4 className="mt-2 font-display text-sm font-semibold text-foreground leading-snug line-clamp-1">
                    {hospital.name}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {hospital.vicinity || hospital.address}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {hospital.distanceKm !== null ? `${hospital.distanceKm.toFixed(1)} km away` : "Nearby"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {hospital.directionsUrl || hospital.googleMapsUrl ? (
                      <Button asChild size="sm" variant="default" className="h-7 px-2.5 text-xs gap-1">
                        <a
                          href={hospital.directionsUrl || hospital.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Navigation className="size-3" />
                          Directions
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setSelectedHospitalId(hospital.id)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Place Details Sheet */}
      <FacilityDetailsSheet
        hospitalId={selectedHospitalId}
        isOpen={Boolean(selectedHospitalId)}
        onClose={() => setSelectedHospitalId(null)}
      />
    </section>
  );
}
