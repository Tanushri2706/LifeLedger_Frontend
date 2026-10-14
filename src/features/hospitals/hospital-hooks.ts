"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { hospitalApi } from "./hospital-api";
import type {
  GetNearbyHospitalsParams,
  NearbyHospitalsResponseData,
  HospitalDetailsResponseData,
  HospitalDepartmentsResponseData,
  UserCoordinates,
  UserLocationState,
} from "./hospital-types";

export const HOSPITALS_QUERY_KEY = ["hospitals"] as const;

/**
 * Hook for discovering nearby healthcare facilities via backend location service
 */
export function useNearbyHospitalsQuery(
  params: GetNearbyHospitalsParams | null,
  options?: { enabled?: boolean }
) {
  const hasValidCoordinates =
    params !== null &&
    typeof params.latitude === "number" &&
    !isNaN(params.latitude) &&
    typeof params.longitude === "number" &&
    !isNaN(params.longitude);

  return useQuery<NearbyHospitalsResponseData, Error>({
    queryKey: [
      ...HOSPITALS_QUERY_KEY,
      "nearby",
      {
        latitude: params?.latitude,
        longitude: params?.longitude,
        radiusKm: params?.radiusKm ?? 5,
        type: params?.type || "all",
        sort: params?.sort || "distance",
        minRating: params?.minRating,
        openNow: params?.openNow,
        search: params?.search,
        page: params?.page ?? 1,
      },
    ],
    queryFn: async () => {
      if (!params || !hasValidCoordinates) {
        throw new Error("Valid coordinates (latitude and longitude) are required.");
      }
      const res = await hospitalApi.getNearbyHospitals(params);
      return res.data;
    },
    enabled: (options?.enabled ?? true) && hasValidCoordinates,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Lazy query hook for fetching full hospital details on-demand
 */
export function useHospitalDetailsQuery(
  hospitalId: string | null,
  options?: { enabled?: boolean }
) {
  const isValidId = Boolean(hospitalId && hospitalId.trim().length > 0);

  return useQuery<HospitalDetailsResponseData, Error>({
    queryKey: [...HOSPITALS_QUERY_KEY, "detail", hospitalId],
    queryFn: async () => {
      if (!hospitalId) {
        throw new Error("Hospital ID is required for fetching details.");
      }
      const res = await hospitalApi.getHospitalById(hospitalId);
      return res.data;
    },
    enabled: (options?.enabled ?? true) && isValidId,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to retrieve canonical hospital specialties & departments
 */
export function useHospitalDepartmentsQuery() {
  return useQuery<HospitalDepartmentsResponseData, Error>({
    queryKey: [...HOSPITALS_QUERY_KEY, "departments"],
    queryFn: async () => {
      const res = await hospitalApi.getDepartments();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to manage browser geolocation lifecycle safely without persisting
 * precise coordinates or retaining location history.
 */
export function useUserLocation(autoRequest: boolean = true) {
  const [locationState, setLocationState] = useState<UserLocationState>({
    status: "idle",
    coordinates: null,
    accuracy: null,
    errorMessage: null,
  });

  const requestedOnce = useRef(false);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationState({
        status: "unavailable",
        coordinates: null,
        accuracy: null,
        errorMessage: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setLocationState((prev) => ({
      ...prev,
      status: "requesting",
      errorMessage: null,
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          status: "available",
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          errorMessage: null,
        });
      },
      (error) => {
        let status: UserLocationState["status"] = "unavailable";
        let message = "Unable to retrieve your current location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            status = "denied";
            message =
              "Location access was denied. Please allow location permissions in your browser to discover nearby healthcare facilities.";
            break;
          case error.POSITION_UNAVAILABLE:
            status = "unavailable";
            message =
              "Location information is currently unavailable. Please check your device GPS or network connection.";
            break;
          case error.TIMEOUT:
            status = "timeout";
            message =
              "Location request timed out. Please retry with a stronger GPS or network signal.";
            break;
        }

        setLocationState({
          status,
          coordinates: null,
          accuracy: null,
          errorMessage: message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const setManualCoordinates = useCallback((coords: UserCoordinates) => {
    setLocationState({
      status: "available",
      coordinates: coords,
      accuracy: null,
      errorMessage: null,
    });
  }, []);

  useEffect(() => {
    if (autoRequest && !requestedOnce.current) {
      requestedOnce.current = true;
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  return {
    ...locationState,
    requestLocation,
    setManualCoordinates,
  };
}
