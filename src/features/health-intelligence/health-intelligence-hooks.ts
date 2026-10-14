"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { healthIntelligenceApi } from "./health-intelligence-api";
import type {
  AggregateHealthIntelligenceData,
  GetHealthIntelligenceQueryParams,
} from "./health-intelligence-types";

export const HEALTH_INTELLIGENCE_QUERY_KEY = ["health-intelligence"] as const;

export function useHealthIntelligenceQuery(params?: GetHealthIntelligenceQueryParams) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery<AggregateHealthIntelligenceData, Error>({
    queryKey: [...HEALTH_INTELLIGENCE_QUERY_KEY, params],
    queryFn: async () => {
      const res = await healthIntelligenceApi.getAggregateHealthIntelligence(params);
      return res.data;
    },
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 60 * 1000,
  });
}
