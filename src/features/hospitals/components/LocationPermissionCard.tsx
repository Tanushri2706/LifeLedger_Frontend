"use client";

import {
  Compass,
  Lock,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeolocationStatus, UserCoordinates } from "../hospital-types";

interface LocationPermissionCardProps {
  status: GeolocationStatus;
  errorMessage?: string | null;
  onRequestLocation: () => void;
  onSelectCityPreset: (coords: UserCoordinates, cityName: string) => void;
}

// Canonical city coordinates for zero-GPS fallback browsing
const POPULAR_CITY_PRESETS: { name: string; state: string; coords: UserCoordinates }[] = [
  { name: "New Delhi", state: "Delhi NCR", coords: { latitude: 28.6139, longitude: 77.209 } },
  { name: "Mumbai", state: "Maharashtra", coords: { latitude: 19.076, longitude: 72.8777 } },
  { name: "Bengaluru", state: "Karnataka", coords: { latitude: 12.9716, longitude: 77.5946 } },
  { name: "Chennai", state: "Tamil Nadu", coords: { latitude: 13.0827, longitude: 80.2707 } },
  { name: "Pune", state: "Maharashtra", coords: { latitude: 18.5204, longitude: 73.8567 } },
  { name: "Hyderabad", state: "Telangana", coords: { latitude: 17.385, longitude: 78.4867 } },
];

export function LocationPermissionCard({
  status,
  errorMessage,
  onRequestLocation,
  onSelectCityPreset,
}: LocationPermissionCardProps) {
  if (status === "requesting") {
    return (
      <div className="surface-calm flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary-soft/30 p-8 sm:p-12 text-center">
        <div className="relative mb-4 grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
          <LocateFixed className="size-8 animate-pulse" aria-hidden="true" />
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        </div>
        <h3 className="font-display text-lg font-semibold sm:text-xl text-foreground">
          Locating your position...
        </h3>
        <p className="mt-1.5 max-w-md text-xs sm:text-sm text-muted-foreground">
          LifeLedger is requesting your current GPS coordinates to calculate straight-line distances to nearby healthcare facilities.
        </p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="surface-calm rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Lock className="size-6" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Location permission required for automatic nearby discovery
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {errorMessage ||
                "Your browser has blocked location access. To find hospitals and clinics around you, enable location permissions in your browser's address bar."}
            </p>

            <div className="mt-4 rounded-xl bg-surface/80 p-3.5 border border-border/60 text-xs text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground block">How to enable location:</span>
              <p>1. Click the lock or tune icon on the left side of your browser address bar.</p>
              <p>2. Set &ldquo;Location&rdquo; permissions to &ldquo;Allow&rdquo;.</p>
              <p>3. Click the &ldquo;Retry Location Permission&rdquo; button below.</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button onClick={onRequestLocation} className="gap-2 shadow-sm">
                <RefreshCw className="size-4" aria-hidden="true" />
                Retry Location Permission
              </Button>
            </div>

            {/* City Preset Selection Fallback */}
            <div className="mt-6 border-t border-border/40 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Or explore healthcare facilities by region:
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CITY_PRESETS.map((city) => (
                  <Button
                    key={city.name}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => onSelectCityPreset(city.coords, city.name)}
                  >
                    <MapPin className="size-3 text-primary" aria-hidden="true" />
                    {city.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unavailable" || status === "timeout") {
    return (
      <div className="surface-calm rounded-2xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {status === "timeout" ? "Location request timed out" : "Location currently unavailable"}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {errorMessage || "Unable to acquire current GPS coordinates. Please check your connection or choose a region."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button onClick={onRequestLocation} className="gap-2 shadow-sm">
                <RefreshCw className="size-4" aria-hidden="true" />
                Try Acquiring Location Again
              </Button>
            </div>

            {/* City Preset Selection Fallback */}
            <div className="mt-6 border-t border-border/40 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Or browse healthcare facilities in major centers:
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CITY_PRESETS.map((city) => (
                  <Button
                    key={city.name}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => onSelectCityPreset(city.coords, city.name)}
                  >
                    <MapPin className="size-3 text-primary" aria-hidden="true" />
                    {city.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Idle state
  return (
    <div className="surface-calm flex flex-col items-center justify-center rounded-2xl border border-border/60 p-8 sm:p-12 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
        <Compass className="size-8" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-semibold sm:text-xl text-foreground">
        Discover healthcare facilities near you
      </h3>
      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-muted-foreground">
        Allow location access to find verified hospitals, 24/7 clinics, diagnostic laboratories, and pharmacies.
      </p>

      <Button onClick={onRequestLocation} className="mt-6 gap-2 shadow-sm" size="lg">
        <Navigation className="size-4" aria-hidden="true" />
        Use My Current Location
      </Button>

      {/* City Presets */}
      <div className="mt-8 border-t border-border/40 pt-6 w-full max-w-md">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
          Or select a metropolitan region:
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_CITY_PRESETS.map((city) => (
            <Button
              key={city.name}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => onSelectCityPreset(city.coords, city.name)}
            >
              <MapPin className="size-3 text-primary" aria-hidden="true" />
              {city.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
