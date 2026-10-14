import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  GetNearbyHospitalsParams,
  NearbyHospitalsResponseData,
  HospitalDetailsResponseData,
  HospitalDepartmentsResponseData,
  SearchHospitalsParams,
} from "./hospital-types";

export const hospitalApi = {
  /**
   * Discover nearby healthcare facilities by GPS coordinates
   * GET /api/v1/hospitals
   */
  getNearbyHospitals: async (
    params: GetNearbyHospitalsParams
  ): Promise<ApiResponse<NearbyHospitalsResponseData>> => {
    const query = new URLSearchParams();
    query.append("latitude", String(params.latitude));
    query.append("longitude", String(params.longitude));

    if (params.radiusKm !== undefined) {
      query.append("radiusKm", String(params.radiusKm));
    }
    if (params.type && params.type !== "all") {
      query.append("type", params.type);
    }
    if (params.sort) {
      query.append("sort", params.sort);
    }
    if (params.minRating !== undefined && params.minRating > 0) {
      query.append("minRating", String(params.minRating));
    }
    if (params.openNow) {
      query.append("openNow", "true");
    }
    if (params.search && params.search.trim()) {
      query.append("search", params.search.trim());
    }
    if (params.page !== undefined) {
      query.append("page", String(params.page));
    }
    if (params.limit !== undefined) {
      query.append("limit", String(params.limit));
    }
    if (params.pageToken) {
      query.append("pageToken", params.pageToken);
    }

    const queryString = query.toString();
    const url = queryString ? `/hospitals?${queryString}` : "/hospitals";
    return http.get<ApiResponse<NearbyHospitalsResponseData>>(url);
  },

  /**
   * Fetch full details for a single healthcare facility by Place ID or Mongo ID
   * GET /api/v1/hospitals/:id
   */
  getHospitalById: async (
    id: string
  ): Promise<ApiResponse<HospitalDetailsResponseData>> => {
    return http.get<ApiResponse<HospitalDetailsResponseData>>(`/hospitals/${encodeURIComponent(id)}`);
  },

  /**
   * Search healthcare facilities with city geocoding or keyword search
   * GET /api/v1/hospitals/search
   */
  searchHospitals: async (
    params: SearchHospitalsParams
  ): Promise<ApiResponse<NearbyHospitalsResponseData>> => {
    const query = new URLSearchParams();
    if (params.city && params.city.trim()) {
      query.append("city", params.city.trim());
    }
    if (params.search && params.search.trim()) {
      query.append("search", params.search.trim());
    }
    if (params.latitude !== undefined) {
      query.append("latitude", String(params.latitude));
    }
    if (params.longitude !== undefined) {
      query.append("longitude", String(params.longitude));
    }
    if (params.radiusKm !== undefined) {
      query.append("radiusKm", String(params.radiusKm));
    }
    if (params.sort) {
      query.append("sort", params.sort);
    }
    if (params.page !== undefined) {
      query.append("page", String(params.page));
    }
    if (params.limit !== undefined) {
      query.append("limit", String(params.limit));
    }

    const queryString = query.toString();
    const url = queryString ? `/hospitals/search?${queryString}` : "/hospitals/search";
    return http.get<ApiResponse<NearbyHospitalsResponseData>>(url);
  },

  /**
   * Get supported canonical medical departments
   * GET /api/v1/hospitals/departments
   */
  getDepartments: async (): Promise<ApiResponse<HospitalDepartmentsResponseData>> => {
    return http.get<ApiResponse<HospitalDepartmentsResponseData>>("/hospitals/departments");
  },
};
