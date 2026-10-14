"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { dashboardApi } from "./dashboard-api";
import type {
  IUserDashboardData,
  IDoctorDashboardData,
  DashboardResponseData,
} from "./dashboard-types";

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

export function useDashboardQuery() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();

  return useQuery<DashboardResponseData["dashboard"], Error>({
    queryKey: [...DASHBOARD_QUERY_KEY, user?.id],
    queryFn: async () => {
      const response = await dashboardApi.getDashboard();
      return response.data.dashboard;
    },
    enabled: isAuthenticated && !isAuthLoading && !!user,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Do not retry on 401 unauthorized errors (handled by api-client refresh)
      if ((error as { statusCode?: number })?.statusCode === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Type guard for User (Patient) Dashboard Data
 */
export function isUserDashboard(
  data: IUserDashboardData | IDoctorDashboardData | undefined | null
): data is IUserDashboardData {
  if (!data) return false;
  return "vitals" in data || "healthVault" in data || "timelinePreview" in data;
}

/**
 * Type guard for Doctor Dashboard Data
 */
export function isDoctorDashboard(
  data: IUserDashboardData | IDoctorDashboardData | undefined | null
): data is IDoctorDashboardData {
  if (!data) return false;
  return "professionalSummary" in data;
}
