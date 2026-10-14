"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { aiApi } from "./ai-api";
import { REPORTS_QUERY_KEY, type MedicalReportData } from "@/features/reports";
import { DASHBOARD_QUERY_KEY } from "@/features/dashboard";
import { TIMELINE_QUERY_KEY } from "@/features/timeline";
import { HEALTH_INTELLIGENCE_QUERY_KEY } from "@/features/health-intelligence";
import type {
  ReportAnalysisResponseData,
  AnalyzeReportPayload,
} from "./ai-types";
import type { ApiError } from "@/lib/api-client";

export const AI_ANALYSIS_QUERY_KEY = ["ai-analysis"] as const;

export function useReportAnalysisQuery(reportId: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery<ReportAnalysisResponseData, Error>({
    queryKey: [...AI_ANALYSIS_QUERY_KEY, reportId],
    queryFn: async () => {
      const res = await aiApi.getReportAnalysis(reportId);
      return res.data;
    },
    enabled: isAuthenticated && !isAuthLoading && !!reportId,
    staleTime: 30 * 1000,
    retry: (failureCount, error) => {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 422) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useAnalyzeReportMutation() {
  const queryClient = useQueryClient();

  return useMutation<ReportAnalysisResponseData, Error, AnalyzeReportPayload>({
    mutationFn: async (payload: AnalyzeReportPayload) => {
      const res = await aiApi.analyzeReport(payload);
      return res.data;
    },
    onSuccess: (data) => {
      // Set query data for this report's analysis immediately
      queryClient.setQueryData([...AI_ANALYSIS_QUERY_KEY, data.reportId], data);
      queryClient.setQueryData<MedicalReportData | undefined>(
        [...REPORTS_QUERY_KEY, data.reportId],
        (old) => (old ? { ...old, processingStatus: data.processingStatus } : old)
      );
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [...REPORTS_QUERY_KEY, data.reportId] });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMELINE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HEALTH_INTELLIGENCE_QUERY_KEY });
    },
    onError: (error, variables) => {
      const apiErr = error as ApiError;
      const raw = apiErr?.raw as
        | { data?: Partial<ReportAnalysisResponseData>; message?: string }
        | undefined;
      const rawData = raw?.data;

      if (apiErr?.statusCode === 422 || rawData?.processingStatus === "unreadable") {
        const unreadableData: ReportAnalysisResponseData = {
          reportId: variables.reportId,
          processingStatus: "unreadable",
          analysis: null,
          errorMessage:
            rawData?.errorMessage ||
            apiErr?.message ||
            "We couldn't extract enough clinical information from this document to provide AI health insights.",
          disclaimer:
            rawData?.disclaimer ||
            "This AI analysis is for educational and organizational purposes only and does not constitute a medical diagnosis, prognosis, or treatment plan. Always consult a qualified healthcare professional for medical advice and before making healthcare decisions.",
        };

        // 1. Immediately set the AI analysis cache to unreadable state
        queryClient.setQueryData([...AI_ANALYSIS_QUERY_KEY, variables.reportId], unreadableData);

        // 2. Immediately update the report detail cache processingStatus to unreadable
        queryClient.setQueryData<MedicalReportData | undefined>(
          [...REPORTS_QUERY_KEY, variables.reportId],
          (old) => (old ? { ...old, processingStatus: "unreadable" } : old)
        );
      }

      // Invalidate queries so that latest backend data is refetched & synced
      queryClient.invalidateQueries({ queryKey: [...AI_ANALYSIS_QUERY_KEY, variables.reportId] });
      queryClient.invalidateQueries({ queryKey: [...REPORTS_QUERY_KEY, variables.reportId] });
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMELINE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HEALTH_INTELLIGENCE_QUERY_KEY });
    },
  });
}
