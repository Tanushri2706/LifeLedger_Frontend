"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Compass,
  MapPin,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NormalizedHospitalDto, UserCoordinates } from "../hospital-types";
import { OSM_RASTER_STYLE, createGeoJsonCircle, OSM_ATTRIBUTION } from "../osm-map-config";

// Ensure worker URL is set if supported by the bundler
if (typeof window !== "undefined") {
  try {
    const mgl = maplibregl as unknown as { setWorkerUrl?: (url: string) => void };
    if (typeof mgl.setWorkerUrl === "function") {
      mgl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
    }
  } catch {
    // Fall back to default worker configuration
  }
}

export interface OsmHospitalMapProps {
  userCoords: UserCoordinates | null;
  hospitals: NormalizedHospitalDto[];
  selectedHospitalId: string | null;
  onSelectHospital: (id: string) => void;
  radiusKm: number;
  onRecenter?: () => void;
  locationLabel?: string;
  backendAttribution?: string;
  totalFacilitiesCount?: number;
  currentPage?: number;
  className?: string;
}

function getFacilityCategoryIcon(facilityType: string) {
  switch (facilityType?.toLowerCase()) {
    case "hospital":
      return "🏥";
    case "clinic":
      return "🩺";
    case "pharmacy":
      return "💊";
    case "diagnostic_center":
      return "🔬";
    case "blood_bank":
      return "🩸";
    default:
      return "📍";
  }
}

function formatCategoryLabel(type: string): string {
  switch (type?.toLowerCase()) {
    case "hospital":
      return "Hospital";
    case "clinic":
      return "Clinic";
    case "pharmacy":
      return "Pharmacy";
    case "diagnostic_center":
      return "Diagnostic Center";
    case "blood_bank":
      return "Blood Bank";
    default:
      return type
        ? type
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "Healthcare";
  }
}

function getZoomForRadius(radiusKm: number): number {
  if (radiusKm <= 5) return 13.2;
  if (radiusKm <= 10) return 12.2;
  if (radiusKm <= 20) return 11.2;
  if (radiusKm <= 30) return 10.6;
  if (radiusKm <= 40) return 10.0;
  return 9.4;
}

function createHospitalPopupContent(
  hospital: NormalizedHospitalDto,
  onViewDetails: (id: string) => void
): HTMLDivElement {
  const categoryIcon = getFacilityCategoryIcon(hospital.facilityType);
  const categoryLabel = formatCategoryLabel(hospital.facilityType);
  const displayAddress = hospital.vicinity || hospital.address || "Address unavailable";
  const directionsLink = hospital.directionsUrl || hospital.googleMapsUrl;

  const container = document.createElement("div");
  container.className = "lifeledger-popup p-3 text-left space-y-2 font-sans";

  const ratingHtml =
    hospital.rating !== null && hospital.rating !== undefined
      ? `<span class="inline-flex items-center gap-1 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
           ★ ${hospital.rating.toFixed(1)}${
             hospital.reviewCount > 0 ? ` (${hospital.reviewCount.toLocaleString()})` : ""
           }
         </span>`
      : `<span class="text-[10px] text-muted-foreground italic">No rating</span>`;

  const distanceHtml =
    hospital.distanceKm !== null && hospital.distanceKm !== undefined
      ? `<span class="text-[11px] font-medium text-foreground">${hospital.distanceKm.toFixed(1)} km away</span>`
      : `<span class="text-[11px] text-muted-foreground">Nearby</span>`;

  const openStatusHtml =
    hospital.isOpen !== null && hospital.isOpen !== undefined
      ? `<span class="inline-flex items-center text-[10px] font-medium ${
          hospital.isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
        }">
           ● ${hospital.isOpen ? "Open Now" : "Closed"}
         </span>`
      : "";

  container.innerHTML = `
    <div class="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5">
      <span class="inline-flex items-center gap-1 rounded-md bg-primary-soft/80 px-2 py-0.5 text-[10px] font-semibold text-primary">
        ${categoryIcon} ${categoryLabel}
      </span>
      ${openStatusHtml}
    </div>

    <div>
      <h4 class="font-display text-sm font-bold text-foreground leading-snug">
        ${hospital.name}
      </h4>
      <p class="mt-0.5 text-xs text-muted-foreground line-clamp-2">
        ${displayAddress}
      </p>
    </div>

    <div class="flex items-center justify-between gap-2 pt-0.5">
      ${distanceHtml}
      ${ratingHtml}
    </div>

    <div class="flex items-center gap-1.5 pt-1.5 border-t border-border/40">
      ${
        directionsLink
          ? `<a
              href="${directionsLink}"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
             >
               Directions
             </a>`
          : ""
      }
      <button
        type="button"
        class="details-btn flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface transition shadow-sm"
      >
        Details
      </button>
    </div>
  `;

  const detailsBtn = container.querySelector<HTMLButtonElement>(".details-btn");
  if (detailsBtn) {
    detailsBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onViewDetails(hospital.id);
    };
  }

  return container;
}

export function OsmHospitalMap({
  userCoords,
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  radiusKm,
  onRecenter,
  locationLabel = "Your Location",
  backendAttribution,
  totalFacilitiesCount,
  currentPage,
  className = "",
}: OsmHospitalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const activePopupRef = useRef<maplibregl.Popup | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const isMapLoadedRef = useRef(false);

  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Keep ref to latest onSelectHospital callback
  const onSelectHospitalRef = useRef(onSelectHospital);
  useEffect(() => {
    onSelectHospitalRef.current = onSelectHospital;
  }, [onSelectHospital]);

  // Recenter handler
  const handleRecenter = useCallback(() => {
    if (mapRef.current && userCoords) {
      mapRef.current.flyTo({
        center: [userCoords.longitude, userCoords.latitude],
        zoom: getZoomForRadius(radiusKm),
        duration: 900,
        essential: true,
      });
    }
    if (onRecenter) {
      onRecenter();
    }
  }, [userCoords, radiusKm, onRecenter]);

  // Helper to open a single popup for a given hospital
  const openSinglePopup = useCallback((hospital: NormalizedHospitalDto, map: maplibregl.Map) => {
    if (activePopupRef.current) {
      activePopupRef.current.remove();
      activePopupRef.current = null;
    }

    const popupContent = createHospitalPopupContent(hospital, (id) => {
      onSelectHospitalRef.current(id);
    });

    const popup = new maplibregl.Popup({
      offset: 16,
      closeButton: true,
      closeOnClick: false,
      maxWidth: "280px",
      className: "lifeledger-maplibre-popup",
    })
      .setLngLat([hospital.longitude, hospital.latitude])
      .setDOMContent(popupContent)
      .addTo(map);

    popup.on("close", () => {
      if (activePopupRef.current === popup) {
        activePopupRef.current = null;
      }
    });

    activePopupRef.current = popup;
  }, []);

  // 1. Initialize MapLibre instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    try {
      const initialCenter: [number, number] = userCoords
        ? [userCoords.longitude, userCoords.latitude]
        : [77.209, 28.6139]; // Default coordinates
      const initialZoom = userCoords ? getZoomForRadius(radiusKm) : 11;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: OSM_RASTER_STYLE,
        center: initialCenter,
        zoom: initialZoom,
        maxZoom: 18,
        minZoom: 3,
        attributionControl: false, // Custom attribution added below
      });

      // Add navigation controls (zoom, compass)
      const navControl = new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false,
      });
      map.addControl(navControl, "top-right");

      // Add attribution control with OSM attribution
      const attribControl = new maplibregl.AttributionControl({
        compact: true,
        customAttribution: backendAttribution || OSM_ATTRIBUTION,
      });
      map.addControl(attribControl, "bottom-right");

      // Close popup when clicking on empty map area
      map.on("click", (e) => {
        const target = e.originalEvent.target as HTMLElement | null;
        if (!target?.closest(".lifeledger-facility-marker") && !target?.closest(".maplibregl-popup")) {
          if (activePopupRef.current) {
            activePopupRef.current.remove();
            activePopupRef.current = null;
          }
        }
      });

      map.on("load", () => {
        isMapLoadedRef.current = true;
        setIsMapReady(true);
      });

      map.on("error", (e: { error?: { message?: string } }) => {
        // Non-fatal tile errors can happen, log only critical failures
        if (e.error?.message?.includes("WebGL")) {
          setMapError("WebGL initialization error. Map acceleration unavailable.");
        }
      });

      mapRef.current = map;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initialize interactive map.";
      console.error("[OsmHospitalMap] Initialization error:", err);
      setMapError(errorMsg);
    }

    return () => {
      isMapLoadedRef.current = false;
      if (activePopupRef.current) {
        activePopupRef.current.remove();
        activePopupRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // 2. ResizeObserver for responsive container resizing
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 3. Sync User Location Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    if (!userMarkerRef.current) {
      // Create compact DOM element for user location marker
      const el = document.createElement("div");
      el.className = "lifeledger-user-marker group";
      el.setAttribute("role", "button");
      el.setAttribute("title", `Your position: ${locationLabel}`);
      el.setAttribute("aria-label", `Your position: ${locationLabel}`);
      el.style.cursor = "pointer";
      el.style.zIndex = "10";

      el.innerHTML = `
        <div class="relative flex flex-col items-center">
          <div class="relative flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20">
            <svg class="size-3.5 rotate-45 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <polygon points="3 11 22 2 13 21 11 13 3 11" fill="currentColor"></polygon>
            </svg>
            <span class="absolute inset-0 animate-ping rounded-full bg-primary/30"></span>
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([userCoords.longitude, userCoords.latitude])
        .addTo(map);

      userMarkerRef.current = marker;
    } else {
      userMarkerRef.current.setLngLat([userCoords.longitude, userCoords.latitude]);
    }
  }, [userCoords, locationLabel, isMapReady]);

  // 4. Sync Radius GeoJSON Circle Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userCoords || !isMapReady) return;

    const sourceId = "radius-circle-source";
    const fillLayerId = "radius-circle-fill";
    const lineLayerId = "radius-circle-line";

    const circleGeoJson = createGeoJsonCircle([userCoords.longitude, userCoords.latitude], radiusKm);

    try {
      const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
      if (existingSource) {
        existingSource.setData(circleGeoJson);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: circleGeoJson,
        });

        if (!map.getLayer(fillLayerId)) {
          map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": "#2563EB",
              "fill-opacity": 0.07,
            },
          });
        }

        if (!map.getLayer(lineLayerId)) {
          map.addLayer({
            id: lineLayerId,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": "#2563EB",
              "line-width": 1.5,
              "line-opacity": 0.45,
              "line-dasharray": [3, 2],
            },
          });
        }
      }
    } catch (e) {
      console.warn("[OsmHospitalMap] Error updating radius circle:", e);
    }
  }, [userCoords, radiusKm, isMapReady]);

  // 5. Sync Hospital Markers (compact pins only)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const currentMarkers = markersRef.current;
    const newHospitalIds = new Set(hospitals.map((h) => h.id));

    // Remove markers that are no longer in the hospital list
    currentMarkers.forEach((marker, id) => {
      if (!newHospitalIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Add or update markers
    hospitals.forEach((hospital) => {
      if (
        typeof hospital.latitude !== "number" ||
        typeof hospital.longitude !== "number" ||
        isNaN(hospital.latitude) ||
        isNaN(hospital.longitude)
      ) {
        return;
      }

      const isSelected = selectedHospitalId === hospital.id;
      const categoryIcon = getFacilityCategoryIcon(hospital.facilityType);

      let marker = currentMarkers.get(hospital.id);

      if (!marker) {
        // Create compact circular pin DOM element
        const el = document.createElement("div");
        el.className = "lifeledger-facility-marker cursor-pointer focus:outline-none";
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("title", hospital.name);
        el.setAttribute("aria-label", `Healthcare Facility: ${hospital.name}`);

        el.innerHTML = `
          <div class="relative flex items-center justify-center size-8 rounded-full shadow-md transition-transform duration-200 ${
            isSelected
              ? "bg-primary text-primary-foreground scale-125 ring-4 ring-primary/30 z-30"
              : "bg-card text-foreground border border-border/80 hover:scale-115 z-10"
          }">
            <span class="text-sm select-none leading-none pointer-events-none">${categoryIcon}</span>
          </div>
        `;

        // Click and Keyboard handlers: opens single popup & selects hospital
        const handleMarkerClick = (e: MouseEvent | KeyboardEvent) => {
          e.stopPropagation();
          onSelectHospitalRef.current(hospital.id);
          openSinglePopup(hospital, map);
        };

        el.addEventListener("click", handleMarkerClick);
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleMarkerClick(e);
          }
        });

        marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([hospital.longitude, hospital.latitude])
          .addTo(map);

        currentMarkers.set(hospital.id, marker);
      } else {
        // Update marker position and appearance
        marker.setLngLat([hospital.longitude, hospital.latitude]);

        const el = marker.getElement();
        el.setAttribute("title", hospital.name);
        const innerBadge = el.querySelector("div");
        if (innerBadge) {
          innerBadge.className = `relative flex items-center justify-center size-8 rounded-full shadow-md transition-transform duration-200 ${
            isSelected
              ? "bg-primary text-primary-foreground scale-125 ring-4 ring-primary/30 z-30"
              : "bg-card text-foreground border border-border/80 hover:scale-115 z-10"
          }`;
        }
      }
    });
  }, [hospitals, selectedHospitalId, isMapReady, openSinglePopup]);

  // 6. Camera flyTo and single popup display when selectedHospitalId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedHospitalId || !isMapReady) return;

    const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId);
    if (
      selectedHospital &&
      typeof selectedHospital.latitude === "number" &&
      typeof selectedHospital.longitude === "number"
    ) {
      map.flyTo({
        center: [selectedHospital.longitude, selectedHospital.latitude],
        zoom: Math.max(map.getZoom(), 14.5),
        duration: 800,
        essential: true,
      });

      // Display the single popup for the selected hospital
      openSinglePopup(selectedHospital, map);
    }
  }, [selectedHospitalId, hospitals, isMapReady, openSinglePopup]);

  // 7. Auto-fit camera when userCoords or radiusKm change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady || !userCoords) return;

    // Center on user with optimal radius zoom
    map.flyTo({
      center: [userCoords.longitude, userCoords.latitude],
      zoom: getZoomForRadius(radiusKm),
      duration: 600,
      essential: true,
    });
  }, [userCoords, radiusKm, isMapReady]);

  return (
    <div
      className={`surface-calm relative overflow-hidden rounded-2xl border border-border/60 shadow-sm transition-all ${className}`}
      data-map-container="ready"
      role="region"
      aria-label="Interactive OpenStreetMap of nearby healthcare facilities"
    >
      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        className="relative h-72 w-full sm:h-96 bg-muted/40"
        tabIndex={0}
        aria-label="Map Canvas"
      />

      {/* Loading Skeleton */}
      {!isMapReady && !mapError ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="size-6 animate-spin text-primary" aria-hidden="true" />
            <span className="text-xs font-medium text-muted-foreground">
              Initializing OpenStreetMap engine...
            </span>
          </div>
        </div>
      ) : null}

      {/* Map Error Fallback */}
      {mapError ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-destructive/5 p-6 text-center backdrop-blur-sm">
          <AlertCircle className="size-8 text-destructive mb-2" aria-hidden="true" />
          <h4 className="font-semibold text-foreground text-sm">Interactive Map Unavailable</h4>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {mapError}. You can still discover and navigate healthcare facilities using the list below.
          </p>
        </div>
      ) : null}

      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 right-14 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <Badge variant="secondary" className="gap-1.5 shadow-sm backdrop-blur bg-card/90 text-xs">
          <Compass className="size-3 text-primary" aria-hidden="true" />
          <span>
            {totalFacilitiesCount && totalFacilitiesCount > hospitals.length
              ? `Plotting page ${currentPage ?? 1} (${hospitals.length} of ${totalFacilitiesCount.toLocaleString()} facilities)`
              : `${hospitals.length} ${hospitals.length === 1 ? "facility" : "facilities"} within ${radiusKm} km`}
          </span>
        </Badge>

        <Badge variant="outline" className="hidden sm:inline-flex text-[11px] shadow-sm backdrop-blur bg-card/90">
          OpenStreetMap &bull; MapLibre GL
        </Badge>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="pointer-events-auto rounded-lg bg-card/90 px-2.5 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur border border-border/40">
          {backendAttribution || "© OpenStreetMap contributors"}
        </div>

        {onRecenter && userCoords ? (
          <Button
            size="sm"
            variant="secondary"
            className="pointer-events-auto h-8 gap-1.5 shrink-0 shadow-sm backdrop-blur bg-card/95 hover:bg-card"
            onClick={handleRecenter}
            aria-label="Recenter map to your location"
          >
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            Recenter
          </Button>
        ) : null}
      </div>
    </div>
  );
}
