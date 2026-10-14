import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  IAmbulanceCapabilities,
  IAmbulanceTypeSpec,
  AmbulanceListResponseDto,
  GetNearbyAmbulancesQueryDto,
} from "./ambulance-types";

export const ambulanceApi = {
  /**
   * Get ambulance fleet capabilities & real/mock provider status
   * GET /api/v1/ambulances/capabilities
   */
  getCapabilities: async (): Promise<ApiResponse<IAmbulanceCapabilities>> => {
    return http.get<ApiResponse<IAmbulanceCapabilities>>("/ambulances/capabilities");
  },

  /**
   * Get supported ambulance types and equipment specifications
   * GET /api/v1/ambulances/types
   */
  getSupportedTypes: async (): Promise<
    ApiResponse<{ types: IAmbulanceTypeSpec[]; count: number }>
  > => {
    return http.get<ApiResponse<{ types: IAmbulanceTypeSpec[]; count: number }>>(
      "/ambulances/types"
    );
  },

  /**
   * Retrieve nearby ambulance records (Simulated / developer inspection)
   * GET /api/v1/ambulances
   */
  getNearbyAmbulances: async (
    params?: GetNearbyAmbulancesQueryDto
  ): Promise<ApiResponse<AmbulanceListResponseDto>> => {
    const query = new URLSearchParams();
    if (params?.latitude !== undefined) query.append("latitude", String(params.latitude));
    if (params?.longitude !== undefined) query.append("longitude", String(params.longitude));
    if (params?.radius !== undefined) query.append("radius", String(params.radius));
    if (params?.type) query.append("type", params.type);
    if (params?.city) query.append("city", params.city);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    const url = qs ? `/ambulances?${qs}` : "/ambulances";
    return http.get<ApiResponse<AmbulanceListResponseDto>>(url);
  },
};
