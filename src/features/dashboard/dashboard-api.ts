import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type { DashboardResponseData } from "./dashboard-types";

export const dashboardApi = {
  /**
   * Fetch authenticated user's or doctor's dashboard overview data
   */
  getDashboard: async (): Promise<ApiResponse<DashboardResponseData>> => {
    return http.get<ApiResponse<DashboardResponseData>>("/dashboard");
  },
};
