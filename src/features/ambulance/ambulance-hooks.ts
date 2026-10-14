"use client";

import { useQuery } from "@tanstack/react-query";
import { ambulanceApi } from "./ambulance-api";
import type {
  IAmbulanceCapabilities,
  IAmbulanceTypeSpec,
  AmbulanceListResponseDto,
  GetNearbyAmbulancesQueryDto,
} from "./ambulance-types";

export const AMBULANCES_QUERY_KEY = ["ambulances"] as const;

/**
 * Hook to retrieve ambulance capabilities (fleet status, dispatch availability)
 */
export function useAmbulanceCapabilitiesQuery() {
  return useQuery<IAmbulanceCapabilities, Error>({
    queryKey: [...AMBULANCES_QUERY_KEY, "capabilities"],
    queryFn: async () => {
      const res = await ambulanceApi.getCapabilities();
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to retrieve supported ambulance equipment specifications and types
 */
export function useAmbulanceTypesQuery() {
  return useQuery<IAmbulanceTypeSpec[], Error>({
    queryKey: [...AMBULANCES_QUERY_KEY, "types"],
    queryFn: async () => {
      const res = await ambulanceApi.getSupportedTypes();
      return res.data.types;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to retrieve simulated ambulance data (for developer inspection only)
 */
export function useNearbyAmbulancesQuery(
  params?: GetNearbyAmbulancesQueryDto,
  options?: { enabled?: boolean }
) {
  return useQuery<AmbulanceListResponseDto, Error>({
    queryKey: [...AMBULANCES_QUERY_KEY, "nearby", params],
    queryFn: async () => {
      const res = await ambulanceApi.getNearbyAmbulances(params);
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
  });
}
