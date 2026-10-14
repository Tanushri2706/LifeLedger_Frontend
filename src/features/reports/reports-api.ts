import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  ReportsListResponseData,
  ReportDetailResponseData,
  ReportDownloadResponseData,
  UploadReportPayload,
  UpdateReportPayload,
  GetReportsQueryParams,
} from "./reports-types";

export const reportsApi = {
  /**
   * List medical reports with pagination, category filter, date filter, search
   */
  getReports: async (params?: GetReportsQueryParams): Promise<ApiResponse<ReportsListResponseData>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.category && params.category !== "all") query.append("category", params.category);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.search && params.search.trim()) query.append("search", params.search.trim());
    if (params?.subjectType) query.append("subjectType", params.subjectType);
    if (params?.subjectId) query.append("subjectId", params.subjectId);

    const queryString = query.toString();
    const url = queryString ? `/reports?${queryString}` : "/reports";
    return http.get<ApiResponse<ReportsListResponseData>>(url);
  },

  /**
   * Get single report by ID
   */
  getReportById: async (reportId: string): Promise<ApiResponse<ReportDetailResponseData>> => {
    return http.get<ApiResponse<ReportDetailResponseData>>(`/reports/${reportId}`);
  },

  /**
   * Upload report with multipart/form-data
   */
  uploadReport: async (
    payload: UploadReportPayload,
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<ReportDetailResponseData>> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    if (payload.title) formData.append("title", payload.title);
    if (payload.category) formData.append("category", payload.category);
    if (payload.reportType) formData.append("reportType", payload.reportType);
    if (payload.hospital) formData.append("hospital", payload.hospital);
    if (payload.doctor) formData.append("doctor", payload.doctor);
    if (payload.reportDate) formData.append("reportDate", payload.reportDate);
    if (payload.subjectType) formData.append("subjectType", payload.subjectType);
    if (payload.subjectId) formData.append("subjectId", payload.subjectId);

    return http.post<ApiResponse<ReportDetailResponseData>>("/reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  /**
   * Update report metadata
   */
  updateReport: async (
    reportId: string,
    payload: UpdateReportPayload
  ): Promise<ApiResponse<ReportDetailResponseData>> => {
    return http.patch<ApiResponse<ReportDetailResponseData>>(`/reports/${reportId}`, payload);
  },

  /**
   * Delete report (soft deletes in MongoDB, removes file from storage, cascades timeline)
   */
  deleteReport: async (reportId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return http.delete<ApiResponse<{ success: boolean }>>(`/reports/${reportId}`);
  },

  /**
   * Get secure signed download URL
   */
  getDownloadUrl: async (reportId: string): Promise<ApiResponse<ReportDownloadResponseData>> => {
    return http.get<ApiResponse<ReportDownloadResponseData>>(`/reports/${reportId}/download`);
  },
};
