import axios from "axios";
import { http } from "@/lib/api-client";
import { env } from "@/lib/env";
import type { ApiResponse } from "@/types";
import type {
  CreateMedicalShareDto,
  MedicalShareCreatedResponseDto,
  MedicalShareOwnerResponseDto,
  PublicMedicalShareMetadataDto,
  PublicMedicalShareAccessSessionDto,
  PublicMedicalShareDocumentDownloadDto,
  SharedReportSummaryDto,
} from "./medical-share-types";

const PUBLIC_API_BASE = env.NEXT_PUBLIC_API_URL;

interface ListOwnerSharesBackendResponse {
  shares: MedicalShareOwnerResponseDto[];
  count: number;
}

interface SingleOwnerShareBackendResponse {
  share: MedicalShareOwnerResponseDto;
  message?: string;
}

interface SessionReportsBackendResponse {
  subjectDisplayName: string;
  reports: SharedReportSummaryDto[];
}

export const medicalShareApi = {
  // ==========================================================================
  // AUTHENTICATED OWNER ENDPOINTS
  // ==========================================================================

  /**
   * Create a fresh selective medical share (returns rawToken only once)
   */
  createShare: async (
    payload: CreateMedicalShareDto
  ): Promise<MedicalShareCreatedResponseDto> => {
    const res = await http.post<
      ApiResponse<MedicalShareCreatedResponseDto | { share: MedicalShareCreatedResponseDto }> | MedicalShareCreatedResponseDto | { share: MedicalShareCreatedResponseDto }
    >("/medical-shares", payload);

    if (!res) {
      throw new Error("Failed to create medical share");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;

    if (data && typeof data === "object" && "share" in data && data.share) {
      return data.share;
    }

    return data as MedicalShareCreatedResponseDto;
  },

  /**
   * List medical shares created by the user (optionally filtered by subject)
   * Unwraps { shares: [...], count: ... } into canonical MedicalShareOwnerResponseDto[]
   */
  listOwnerShares: async (params?: {
    subjectType?: string;
    subjectId?: string;
  }): Promise<MedicalShareOwnerResponseDto[]> => {
    const query = new URLSearchParams();
    if (params?.subjectType) query.append("subjectType", params.subjectType);
    if (params?.subjectId) query.append("subjectId", params.subjectId);

    const queryString = query.toString();
    const url = queryString ? `/medical-shares?${queryString}` : "/medical-shares";
    const res = await http.get<
      ApiResponse<ListOwnerSharesBackendResponse | MedicalShareOwnerResponseDto[]> | ListOwnerSharesBackendResponse | MedicalShareOwnerResponseDto[]
    >(url);

    if (!res) {
      return [];
    }

    const payload = "data" in res && res.data !== undefined ? res.data : res;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && typeof payload === "object" && "shares" in payload && Array.isArray(payload.shares)) {
      return payload.shares;
    }

    return [];
  },

  /**
   * Get single owner share detail
   */
  getOwnerShareDetail: async (
    shareId: string
  ): Promise<MedicalShareOwnerResponseDto> => {
    const res = await http.get<
      ApiResponse<SingleOwnerShareBackendResponse | MedicalShareOwnerResponseDto> | SingleOwnerShareBackendResponse | MedicalShareOwnerResponseDto
    >(`/medical-shares/${shareId}`);

    if (!res) {
      throw new Error("Medical share not found");
    }

    const payload = "data" in res && res.data !== undefined ? res.data : res;

    if (payload && typeof payload === "object" && "share" in payload && payload.share) {
      return payload.share;
    }

    return payload as MedicalShareOwnerResponseDto;
  },

  /**
   * Revoke an active medical share immediately
   */
  revokeShare: async (
    shareId: string
  ): Promise<MedicalShareOwnerResponseDto> => {
    const res = await http.post<
      ApiResponse<SingleOwnerShareBackendResponse | MedicalShareOwnerResponseDto> | SingleOwnerShareBackendResponse | MedicalShareOwnerResponseDto
    >(`/medical-shares/${shareId}/revoke`);

    if (!res) {
      throw new Error("Failed to revoke medical share");
    }

    const payload = "data" in res && res.data !== undefined ? res.data : res;

    if (payload && typeof payload === "object" && "share" in payload && payload.share) {
      return payload.share;
    }

    return payload as MedicalShareOwnerResponseDto;
  },

  // ==========================================================================
  // PUBLIC RECIPIENT ENDPOINTS (UNAUTHENTICATED)
  // ==========================================================================

  /**
   * Public landing metadata lookup (Non-consuming GET)
   */
  getPublicMetadata: async (
    token: string
  ): Promise<PublicMedicalShareMetadataDto> => {
    const res = await axios.get<ApiResponse<PublicMedicalShareMetadataDto>>(
      `${PUBLIC_API_BASE}/public/medical-shares/${token}`,
      {
        headers: { Accept: "application/json" },
        timeout: 15000,
      }
    );

    if (!res.data?.data) {
      throw new Error("Medical share not found or link is invalid");
    }

    return res.data.data;
  },

  /**
   * Explicit public activation (Consumes one-time share upon user click)
   */
  accessPublicShare: async (
    token: string
  ): Promise<PublicMedicalShareAccessSessionDto> => {
    const res = await axios.post<ApiResponse<PublicMedicalShareAccessSessionDto>>(
      `${PUBLIC_API_BASE}/public/medical-shares/${token}/access`,
      {},
      {
        headers: { Accept: "application/json" },
        timeout: 15000,
      }
    );

    if (!res.data?.data) {
      throw new Error("Failed to activate medical share session");
    }

    return res.data.data;
  },

  /**
   * Get shared reports for an active recipient session
   * Unwraps { reports: [...] } or direct array
   */
  getSessionReports: async (
    sessionToken: string
  ): Promise<SharedReportSummaryDto[]> => {
    const res = await axios.get<ApiResponse<SessionReportsBackendResponse | SharedReportSummaryDto[]>>(
      `${PUBLIC_API_BASE}/public/medical-shares/session/reports`,
      {
        headers: {
          Accept: "application/json",
          "x-share-session": sessionToken,
        },
        timeout: 15000,
      }
    );

    if (!res.data?.data) {
      return [];
    }

    if (Array.isArray(res.data.data)) {
      return res.data.data;
    }

    if ("reports" in res.data.data && Array.isArray(res.data.data.reports)) {
      return res.data.data.reports;
    }

    return [];
  },

  /**
   * Get short-lived signed download URL for a shared document in active session
   */
  getSessionReportDownload: async (
    sessionToken: string,
    reportId: string
  ): Promise<PublicMedicalShareDocumentDownloadDto> => {
    const res = await axios.get<ApiResponse<PublicMedicalShareDocumentDownloadDto>>(
      `${PUBLIC_API_BASE}/public/medical-shares/session/reports/${reportId}/download`,
      {
        headers: {
          Accept: "application/json",
          "x-share-session": sessionToken,
        },
        timeout: 15000,
      }
    );

    if (!res.data?.data) {
      throw new Error("Failed to generate secure download URL");
    }

    return res.data.data;
  },
};
