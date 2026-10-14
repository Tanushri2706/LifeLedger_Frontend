/**
 * Canonical Types & Contracts for Ambulance Discovery & Information
 * Aligned 1:1 with Backend Ambulance Module
 */

export enum AmbulanceType {
  BASIC = "basic",
  ADVANCED = "advanced",
  PATIENT_TRANSPORT = "patient_transport",
  NEONATAL = "neonatal",
}

export enum AmbulanceStatus {
  AVAILABLE = "available",
  ON_DUTY = "on_duty",
  MAINTENANCE = "maintenance",
  OFFLINE = "offline",
}

export interface IAmbulanceCapabilities {
  emergencyCallingAvailable: boolean;
  nearbyHospitalsAvailable: boolean;
  ambulanceDiscoveryAvailable: boolean;
  ambulanceDispatchAvailable: boolean;
  liveTrackingAvailable: boolean;
  etaAvailable: boolean;
  isRealProvider: boolean;
  providerName: string;
  emergencyNumbers: {
    ambulance: string;
    nationalEmergency: string;
  };
  disclaimer: string;
}

export interface IAmbulanceTypeSpec {
  type: AmbulanceType;
  name: string;
  description: string;
  equipment: string[];
  suitableFor: string;
  dispatchNotice: string;
}

export interface AmbulanceResponseDto {
  id: string;
  hospitalId?: string;
  hospitalName?: string;
  vehicleNumber?: string;
  type: AmbulanceType;
  driverName?: string;
  driverPhone?: string;
  status: AmbulanceStatus;
  currentLocation: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  distance?: number;
  isMock: boolean;
  dataSource: "database" | "mock_provider" | "live_provider";
  isLiveTracking: boolean;
  operatingHours?: string;
  contactNumber?: string;
  createdAt?: string | Date;
}

export interface GetNearbyAmbulancesQueryDto {
  latitude?: number;
  longitude?: number;
  radius?: number;
  type?: AmbulanceType | string;
  status?: AmbulanceStatus | string;
  city?: string;
  page?: number;
  limit?: number;
}

export interface AmbulanceListResponseDto {
  ambulances: AmbulanceResponseDto[];
  capabilities: IAmbulanceCapabilities;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
