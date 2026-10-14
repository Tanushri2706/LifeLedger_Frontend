/**
 * Types & Contracts for LifeLedger Nearby Hospitals Discovery Module
 * Aligned 1:1 with canonical backend contract (Part 9A)
 */

export type HealthcareFacilityType =
  | "hospital"
  | "clinic"
  | "diagnostic_center"
  | "pharmacy"
  | "blood_bank"
  | "all"
  | "other";

export type FacilitySortOption = "distance" | "rating" | "relevance";

export type RadiusOptionKm = 5 | 10 | 20 | 30 | 40 | 50;

export interface IGeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface HospitalPhoto {
  photoReference: string;
  width: number;
  height: number;
  attributions: string[];
}

export interface HospitalOpeningHours {
  openNow?: boolean | null;
  weekdayText?: string[];
}

export interface NormalizedHospitalDto {
  id: string; // Place ID
  providerPlaceId: string;
  name: string;
  facilityType: string;
  types: string[];
  address: string;
  vicinity?: string;
  location: IGeoLocation;
  latitude: number;
  longitude: number;
  distanceKm: number | null; // Geodesic / straight-line geographic distance in km
  distanceMeters: number | null;
  rating: number | null; // Real rating or null (never fabricated)
  userRatingsTotal: number;
  reviewCount: number;
  isOpen: boolean | null; // Real opening status from provider if available
  businessStatus?: string | null;
  phone?: string | null;
  website?: string | null;
  googleMapsUrl: string;
  directionsUrl: string; // Provider navigation link
  icon?: string | null;
  photos?: HospitalPhoto[];
}

export interface HospitalDetailsDto extends NormalizedHospitalDto {
  formattedAddress: string;
  formattedPhone?: string | null;
  internationalPhone?: string | null;
  openingHours?: HospitalOpeningHours;
  editorialSummary?: string | null;
  url?: string | null;
}

export interface NearbyHospitalsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  nextPageToken?: string | null;
}

export interface NearbyHospitalsResponseData {
  provider: "google" | "mock" | "osm" | string;
  count: number;
  searchRadiusKm: number;
  distanceCalculation: "geodesic_haversine";
  disclaimer?: string;
  warning?: string;
  attribution?: string;
  hospitals: NormalizedHospitalDto[];
  pagination: NearbyHospitalsPagination;
}

export interface HospitalDetailsResponseData {
  hospital: HospitalDetailsDto;
}

export interface HospitalDepartmentsResponseData {
  departments: string[];
  count: number;
}

export interface GetNearbyHospitalsParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  type?: HealthcareFacilityType | string;
  sort?: FacilitySortOption;
  minRating?: number;
  openNow?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  pageToken?: string;
}

export interface SearchHospitalsParams {
  city?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sort?: FacilitySortOption;
  page?: number;
  limit?: number;
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export type GeolocationStatus =
  | "idle"
  | "requesting"
  | "available"
  | "denied"
  | "unavailable"
  | "timeout";

export interface UserLocationState {
  status: GeolocationStatus;
  coordinates: UserCoordinates | null;
  accuracy: number | null;
  errorMessage: string | null;
}
