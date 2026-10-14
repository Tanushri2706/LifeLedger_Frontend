"use client";

import { useState, useMemo, useCallback } from "react";
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Map as MapIcon,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/widgets";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useNearbyHospitalsQuery,
  useUserLocation,
  FacilityCard,
  FacilityDetailsSheet,
  HospitalFilters,
  HospitalMapPreview,
  LocationPermissionCard,
  ProviderNotice,
  HospitalGridSkeleton,
  type RadiusOptionKm,
  type HealthcareFacilityType,
  type FacilitySortOption,
  type UserCoordinates,
} from "@/features/hospitals";

export default function HospitalsPage() {
  // Geolocation state
  const {
    status: locationStatus,
    coordinates,
    errorMessage: locationErrorMessage,
    requestLocation,
    setManualCoordinates,
  } = useUserLocation(true);

  // Filter & Query States
  const [radiusKm, setRadiusKm] = useState<RadiusOptionKm>(5);
  const [facilityType, setFacilityType] = useState<HealthcareFacilityType | string>("all");
  const [sort, setSort] = useState<FacilitySortOption>("distance");
  const [minRating, setMinRating] = useState<number>(0);
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [locationLabel, setLocationLabel] = useState<string>("Current GPS Location");
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  // Selected place for details sheet & map highlight
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(true);

  // TanStack Query for nearby hospitals
  const queryParams = useMemo(() => {
    if (!coordinates) return null;
    return {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      radiusKm,
      type: facilityType,
      sort,
      minRating: minRating > 0 ? minRating : undefined,
      openNow: openNow ? true : undefined,
      search: searchQuery.trim() || undefined,
      page,
      limit,
    };
  }, [coordinates, radiusKm, facilityType, sort, minRating, openNow, searchQuery, page]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useNearbyHospitalsQuery(queryParams, {
    enabled: locationStatus === "available" && Boolean(coordinates),
  });

  const hospitals = data?.hospitals ?? [];
  const pagination = data?.pagination;
  const provider = data?.provider;
  const coverageWarning = data?.warning;

  const totalFacilities = pagination?.total ?? hospitals.length;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(totalFacilities / limit));
  const currentPage = pagination?.page ?? page;

  const startItem = totalFacilities === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalFacilities);

  // Handlers
  const handleSelectCity = useCallback(
    (coords: UserCoordinates, cityName: string) => {
      setManualCoordinates(coords);
      setLocationLabel(cityName);
      setPage(1);
    },
    [setManualCoordinates]
  );

  const handleRecenter = useCallback(() => {
    setLocationLabel("Current GPS Location");
    requestLocation();
    setPage(1);
  }, [requestLocation]);

  const handleRadiusChange = useCallback((newRadius: RadiusOptionKm) => {
    setRadiusKm(newRadius);
    setPage(1);
  }, []);

  const handleFacilityTypeChange = useCallback((newType: HealthcareFacilityType | string) => {
    setFacilityType(newType);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: FacilitySortOption) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const handleMinRatingChange = useCallback((newRating: number) => {
    setMinRating(newRating);
    setPage(1);
  }, []);

  const handleOpenNowChange = useCallback((newOpenNow: boolean) => {
    setOpenNow(newOpenNow);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearchQuery(newSearch);
    setPage(1);
  }, []);

  const handleViewDetails = useCallback((id: string) => {
    setSelectedHospitalId(id);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setRadiusKm(5);
    setFacilityType("all");
    setSort("distance");
    setMinRating(0);
    setOpenNow(false);
    setSearchQuery("");
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    if (typeof window !== "undefined") {
      const resultsEl = document.getElementById("facilities-results");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  const hasActiveFilters =
    radiusKm !== 5 ||
    facilityType !== "all" ||
    sort !== "distance" ||
    minRating !== 0 ||
    openNow ||
    searchQuery.trim().length > 0;

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-6xl py-6 space-y-6">
        {/* Page Header */}
        <Reveal>
          <header className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Nearby Healthcare Facilities
                </h1>
                {isFetching && !isLoading ? (
                  <Badge variant="secondary" className="gap-1 text-xs animate-pulse">
                    <RefreshCw className="size-3 animate-spin text-primary" />
                    Updating
                  </Badge>
                ) : null}
              </div>

              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  {locationStatus === "available"
                    ? `Showing healthcare facilities around ${locationLabel}`
                    : "Discover verified hospitals, clinics, and diagnostic centers"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap((prev) => !prev)}
                className="gap-1.5 text-xs flex-1 sm:flex-initial"
              >
                <MapIcon className="size-3.5" aria-hidden="true" />
                {showMap ? "Hide Map" : "Show Map"}
              </Button>

              {locationStatus === "available" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRecenter}
                  className="gap-1.5 text-xs flex-1 sm:flex-initial"
                >
                  <Compass className="size-3.5 text-primary" aria-hidden="true" />
                  Locate Me
                </Button>
              ) : null}
            </div>
          </header>
        </Reveal>

        {/* Development Provider Transparency Notice */}
        <Reveal delay={0.04}>
          <ProviderNotice provider={provider} attribution={data?.attribution} />
        </Reveal>

        {/* Geolocation Gate & Flow */}
        {locationStatus !== "available" ? (
          <Reveal delay={0.08}>
            <LocationPermissionCard
              status={locationStatus}
              errorMessage={locationErrorMessage}
              onRequestLocation={requestLocation}
              onSelectCityPreset={handleSelectCity}
            />
          </Reveal>
        ) : (
          <>
            {/* Map Preview Container */}
            {showMap ? (
              <Reveal delay={0.06}>
                <HospitalMapPreview
                  userCoords={coordinates}
                  hospitals={hospitals}
                  selectedHospitalId={selectedHospitalId}
                  onSelectHospital={handleViewDetails}
                  radiusKm={radiusKm}
                  onRecenter={handleRecenter}
                  locationLabel={locationLabel}
                  backendAttribution={data?.attribution}
                  totalFacilitiesCount={totalFacilities}
                  currentPage={currentPage}
                />
              </Reveal>
            ) : null}

            {/* Filter Controls Bar */}
            <Reveal delay={0.1}>
              <HospitalFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                radiusKm={radiusKm}
                onRadiusChange={handleRadiusChange}
                facilityType={facilityType}
                onFacilityTypeChange={handleFacilityTypeChange}
                minRating={minRating}
                onMinRatingChange={handleMinRatingChange}
                openNow={openNow}
                onOpenNowChange={handleOpenNowChange}
                sort={sort}
                onSortChange={handleSortChange}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </Reveal>

            {/* Wide-Radius Coverage Disclaimer / Warning */}
            {coverageWarning || radiusKm >= 40 ? (
              <Reveal delay={0.12}>
                <Alert className="border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200">
                  <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-xs font-semibold">
                    Wide-Radius Search Advisory
                  </AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground mt-0.5">
                    {coverageWarning ||
                      "Searches across wide radiuses (40–50 km) return top-ranked facilities within the radius according to provider coverage limits rather than an exhaustive census."}
                  </AlertDescription>
                </Alert>
              </Reveal>
            ) : null}

            {/* Backend / Network Error State */}
            {isError ? (
              <div className="surface-calm flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center sm:p-12">
                <AlertCircle className="size-10 text-destructive mb-3" aria-hidden="true" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Healthcare Discovery Service Unavailable
                </h3>
                <p className="mt-1.5 max-w-md text-xs sm:text-sm text-muted-foreground">
                  {error?.message ||
                    "We encountered an issue communicating with the location provider service. Please try again."}
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="mt-5 gap-2 shadow-sm"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Retry Healthcare Search
                </Button>
              </div>
            ) : isLoading ? (
              /* Loading Skeletons */
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Searching for healthcare facilities within {radiusKm} km...</span>
                </div>
                <HospitalGridSkeleton count={4} />
              </div>
            ) : hospitals.length === 0 ? (
              /* Empty Results State */
              <div className="surface-calm rounded-2xl border border-border/60 p-6 sm:p-10">
                <EmptyState
                  icon={Building2}
                  title="No healthcare facilities found"
                  body={
                    hasActiveFilters
                      ? `No facilities matched your current filter criteria within ${radiusKm} km. Try widening the search radius, choosing "All Facilities", or clearing the rating/open filter.`
                      : `No registered healthcare facilities were found within ${radiusKm} km of your selected coordinates. Try selecting a wider radius (up to 50 km).`
                  }
                />
                {hasActiveFilters ? (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="gap-1.5"
                    >
                      <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                      Clear all active filters
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              /* Results List */
              <div className="space-y-4" id="facilities-results">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground px-1">
                  <span>
                    Showing <strong className="font-semibold text-foreground">{startItem}–{endItem}</strong> of{" "}
                    <strong className="font-semibold text-foreground">{totalFacilities.toLocaleString()}</strong>{" "}
                    {totalFacilities === 1 ? "facility" : "facilities"} within{" "}
                    <strong className="font-semibold text-foreground">{radiusKm} km</strong>{" "}
                    (straight-line distance)
                  </span>

                  <span className="hidden sm:inline">
                    Page {currentPage} of {totalPages} &bull; Sorted by {sort === "distance" ? "nearest distance" : "highest rating"}
                  </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {hospitals.map((hospital, index) => (
                    <Reveal key={hospital.id || `hosp-${index}`} delay={index * 0.03}>
                      <FacilityCard
                        hospital={hospital}
                        onViewDetails={handleViewDetails}
                        onSelect={setSelectedHospitalId}
                        isSelected={selectedHospitalId === hospital.id}
                      />
                    </Reveal>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-5 mt-4">
                    <p className="text-xs text-muted-foreground">
                      Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                      <span className="font-semibold text-foreground">{totalPages}</span> ({totalFacilities.toLocaleString()} total facilities)
                    </p>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1 || isFetching}
                        className="h-8 gap-1 text-xs"
                        aria-label="Go to previous page"
                      >
                        <ChevronLeft className="size-3.5" />
                        Previous
                      </Button>

                      {/* Numbered Page Buttons */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          const isActive = pageNum === currentPage;
                          return (
                            <Button
                              key={pageNum}
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isFetching}
                              className={`h-8 w-8 p-0 text-xs ${isActive ? "shadow-sm font-bold" : ""}`}
                              aria-label={`Go to page ${pageNum}`}
                              aria-current={isActive ? "page" : undefined}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages || !pagination?.hasMore || isFetching}
                        className="h-8 gap-1 text-xs"
                        aria-label="Go to next page"
                      >
                        Next
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}

        {/* Lazy Loaded Place Details Slide-over Sheet */}
        <FacilityDetailsSheet
          hospitalId={selectedHospitalId}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
        />
      </div>
    </DashboardShell>
  );
}
