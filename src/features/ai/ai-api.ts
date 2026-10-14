import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  ReportAnalysisResponseData,
  AnalyzeReportPayload,
} from "./ai-types";

export const aiApi = {
  /**
   * Get existing AI analysis for a report (returns null analysis if not analyzed yet)
   */
  getReportAnalysis: async (reportId: string): Promise<ApiResponse<ReportAnalysisResponseData>> => {
    return http.get<ApiResponse<ReportAnalysisResponseData>>(`/reports/${reportId}/analysis`);
  },

  /**
   * Trigger real Gemini AI report analysis
   */
  analyzeReport: async (payload: AnalyzeReportPayload): Promise<ApiResponse<ReportAnalysisResponseData>> => {
    return http.post<ApiResponse<ReportAnalysisResponseData>>(`/reports/${payload.reportId}/analyze`, {
      forceReanalyze: payload.forceReanalyze,
    });
  },
};
