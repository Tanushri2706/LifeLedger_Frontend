import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  AggregateHealthIntelligenceData,
  GetHealthIntelligenceQueryParams,
} from "./health-intelligence-types";

export const healthIntelligenceApi = {
  /**
   * Get aggregate health intelligence across all valid clinical reports
   */
  getAggregateHealthIntelligence: async (
    params?: GetHealthIntelligenceQueryParams
  ): Promise<ApiResponse<AggregateHealthIntelligenceData>> => {
    const query = new URLSearchParams();
    if (params?.forceRefresh) {
      query.append("refresh", "true");
    }
    if (params?.subjectType) {
      query.append("subjectType", params.subjectType);
    }
    if (params?.subjectId) {
      query.append("subjectId", params.subjectId);
    }

    const queryString = query.toString();
    const url = queryString ? `/health-intelligence?${queryString}` : "/health-intelligence";
    return http.get<ApiResponse<AggregateHealthIntelligenceData>>(url);
  },
};
