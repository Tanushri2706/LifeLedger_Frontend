"use client";

import {
  Building2,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Star,
  Activity,
  Pill,
  Stethoscope,
  Microscope,
  Droplet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NormalizedHospitalDto } from "../hospital-types";

interface FacilityCardProps {
  hospital: NormalizedHospitalDto;
  onViewDetails: (id: string) => void;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

export function getFacilityTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "hospital":
      return Building2;
    case "clinic":
      return Stethoscope;
    case "pharmacy":
      return Pill;
    case "diagnostic_center":
      return Microscope;
    case "blood_bank":
      return Droplet;
    default:
      return Activity;
  }
}

export function formatFacilityTypeName(type: string): string {
  switch (type.toLowerCase()) {
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
    case "other":
      return "Healthcare";
    default:
      return type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

export function FacilityCard({ hospital, onViewDetails, onSelect, isSelected }: FacilityCardProps) {
  const IconComponent = getFacilityTypeIcon(hospital.facilityType);
  const typeLabel = formatFacilityTypeName(hospital.facilityType);

  // Address line resolution
  const displayAddress = hospital.vicinity || hospital.address;

  return (
    <article
      onClick={() => onSelect?.(hospital.id)}
      className={`surface-calm lift flex h-full flex-col justify-between overflow-hidden rounded-xl border p-5 transition-all sm:p-6 cursor-pointer ${
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border/60"
      }`}
    >
      <div>
        {/* Header Badges & Open Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="grid size-7 place-items-center rounded-md bg-primary-soft text-primary">
              <IconComponent className="size-4" aria-hidden="true" />
            </span>
            <Badge variant="secondary" className="font-medium text-xs">
              {typeLabel}
            </Badge>
          </div>

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
              {hospital.isOpen ? "Open now" : "Closed"}
            </Badge>
          ) : hospital.businessStatus === "CLOSED_TEMPORARILY" ? (
            <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30">
              Temp. Closed
            </Badge>
          ) : null}
        </div>

        {/* Facility Name & Rating */}
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold leading-snug text-foreground sm:text-lg">
              {hospital.name}
            </h3>
            <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground sm:text-sm">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/80" aria-hidden="true" />
              <span className="line-clamp-2">{displayAddress}</span>
            </p>
          </div>

          {/* Rating */}
          {hospital.rating !== null && hospital.rating !== undefined ? (
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                <Star className="size-3.5 fill-accent text-accent" aria-hidden="true" />
                {hospital.rating.toFixed(1)}
              </span>
              {hospital.reviewCount > 0 ? (
                <span className="mt-0.5 text-[11px] text-muted-foreground">
                  ({hospital.reviewCount.toLocaleString("en-IN")})
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">No rating</span>
          )}
        </div>

        {/* Key Attributes: Distance & Category */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-surface px-3 py-2">
            <dt className="text-[11px] font-medium text-muted-foreground">Straight-line distance</dt>
            <dd className="mt-0.5 font-semibold text-foreground">
              {hospital.distanceKm !== null && hospital.distanceKm !== undefined
                ? `${hospital.distanceKm.toFixed(1)} km away`
                : "Nearby"}
            </dd>
          </div>

          <div className="rounded-lg bg-surface px-3 py-2">
            <dt className="text-[11px] font-medium text-muted-foreground">Facility Category</dt>
            <dd className="mt-0.5 truncate font-semibold text-foreground">{typeLabel}</dd>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex flex-col gap-2 pt-2 sm:flex-row">
        {hospital.directionsUrl || hospital.googleMapsUrl ? (
          <Button
            asChild
            variant="default"
            size="sm"
            className="flex-1 gap-1.5 shadow-sm"
          >
            <a
              href={hospital.directionsUrl || hospital.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get directions to ${hospital.name}`}
            >
              <Navigation className="size-3.5" aria-hidden="true" />
              Directions
            </a>
          </Button>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onViewDetails(hospital.id)}
          aria-label={`View full details for ${hospital.name}`}
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          View details
        </Button>
      </div>
    </article>
  );
}
