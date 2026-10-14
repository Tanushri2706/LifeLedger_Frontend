"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { reportsApi } from "./reports-api";
import { DASHBOARD_QUERY_KEY } from "@/features/dashboard";
import { TIMELINE_QUERY_KEY } from "@/features/timeline";
import { HEALTH_INTELLIGENCE_QUERY_KEY } from "@/features/health-intelligence";
import type {
  GetReportsQueryParams,
  UploadReportPayload,
  UpdateReportPayload,
  MedicalReportData,
  ReportsListResponseData,
} from "./reports-types";

export const REPORTS_QUERY_KEY = ["reports"] as const;

export function useReportsQuery(params?: GetReportsQueryParams) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery<ReportsListResponseData, Error>({
    queryKey: [...REPORTS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await reportsApi.getReports(params);
      return res.data;
    },
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 30 * 1000,
  });
}

export function useReportDetailQuery(reportId: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery<MedicalReportData, Error>({
    queryKey: [...REPORTS_QUERY_KEY, reportId],
    queryFn: async () => {
      const res = await reportsApi.getReportById(reportId);
      return res.data.report;
    },
    enabled: isAuthenticated && !isAuthLoading && !!reportId,
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      if ((error as { statusCode?: number })?.statusCode === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useUploadReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      onProgress,
    }: {
      payload: UploadReportPayload;
      onProgress?: (percent: number) => void;
    }) => {
      const res = await reportsApi.uploadReport(payload, onProgress);
      return res.data.report;
    },
    onSuccess: () => {
      // Invalidate reports list, dashboard, timeline, and health intelligence queries
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMELINE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HEALTH_INTELLIGENCE_QUERY_KEY });
    },
  });
}

export function useUpdateReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      payload,
    }: {
      reportId: string;
      payload: UpdateReportPayload;
    }) => {
      const res = await reportsApi.updateReport(reportId, payload);
      return res.data.report;
    },
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      queryClient.setQueryData([...REPORTS_QUERY_KEY, updatedReport.id], updatedReport);
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMELINE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HEALTH_INTELLIGENCE_QUERY_KEY });
    },
  });
}

export function useDeleteReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      const res = await reportsApi.deleteReport(reportId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMELINE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HEALTH_INTELLIGENCE_QUERY_KEY });
    },
  });
}
