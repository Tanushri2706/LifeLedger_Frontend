"use client";

import {
  ArrowUpDown,
  RotateCcw,
  Search,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  HealthcareFacilityType,
  FacilitySortOption,
  RadiusOptionKm,
} from "../hospital-types";

interface HospitalFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  radiusKm: RadiusOptionKm;
  onRadiusChange: (radius: RadiusOptionKm) => void;
  facilityType: HealthcareFacilityType | string;
  onFacilityTypeChange: (type: HealthcareFacilityType | string) => void;
  minRating: number;
  onMinRatingChange: (minRating: number) => void;
  openNow: boolean;
  onOpenNowChange: (openNow: boolean) => void;
  sort: FacilitySortOption;
  onSortChange: (sort: FacilitySortOption) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const RADIUS_OPTIONS: { value: RadiusOptionKm; label: string }[] = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
  { value: 30, label: "30 km" },
  { value: 40, label: "40 km" },
  { value: 50, label: "50 km" },
];

const FACILITY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Facilities" },
  { value: "hospital", label: "Hospitals" },
  { value: "clinic", label: "Clinics" },
  { value: "pharmacy", label: "Pharmacies" },
  { value: "diagnostic_center", label: "Diagnostic Centers" },
  { value: "blood_bank", label: "Blood Banks" },
];

const RATING_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Any rating" },
  { value: 3, label: "3.0+ Stars" },
  { value: 4, label: "4.0+ Stars" },
  { value: 4.5, label: "4.5+ Stars" },
];

export function HospitalFilters({
  searchQuery,
  onSearchChange,
  radiusKm,
  onRadiusChange,
  facilityType,
  onFacilityTypeChange,
  minRating,
  onMinRatingChange,
  openNow,
  onOpenNowChange,
  sort,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
}: HospitalFiltersProps) {
  return (
    <section
      className="surface-calm rounded-xl border border-border/60 p-5 sm:p-6"
      aria-label="Healthcare facility discovery search and filters"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by facility name, specialty, or vicinity..."
          className="h-11 pl-9 pr-9"
          aria-label="Search healthcare facilities"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search input"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Main Filter Controls Grid */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search Radius */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Search Radius</Label>
          <Select
            value={String(radiusKm)}
            onValueChange={(val) => onRadiusChange(Number(val) as RadiusOptionKm)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select radius" />
            </SelectTrigger>
            <SelectContent>
              {RADIUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  Within {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Facility Category */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Facility Category</Label>
          <Select value={facilityType} onValueChange={onFacilityTypeChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {FACILITY_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Rating */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Minimum Rating</Label>
          <Select
            value={String(minRating)}
            onValueChange={(val) => onMinRatingChange(Number(val))}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              {RATING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.value > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-accent text-accent" />
                      {opt.label}
                    </span>
                  ) : (
                    opt.label
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sorting */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Sort By</Label>
          <Select
            value={sort}
            onValueChange={(val) => onSortChange(val as FacilitySortOption)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">
                <span className="inline-flex items-center gap-1.5">
                  <ArrowUpDown className="size-3.5 text-primary" />
                  Nearest First (Distance)
                </span>
              </SelectItem>
              <SelectItem value="rating">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-3.5 fill-accent text-accent" />
                  Highest Rating
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Secondary Bar: Open Now Toggle & Reset Button */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-1.5 border border-border/40">
            <Switch
              id="hospitals-open-only"
              checked={openNow}
              onCheckedChange={onOpenNowChange}
            />
            <Label
              htmlFor="hospitals-open-only"
              className="text-xs font-medium cursor-pointer"
            >
              Open now only
            </Label>
          </div>
        </div>

        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Reset all filters
          </Button>
        ) : null}
      </div>
    </section>
  );
}
