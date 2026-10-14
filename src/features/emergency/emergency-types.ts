/**
 * Canonical Types and DTOs for LifeLedger Emergency Feature
 * Aligned 1:1 with Backend Emergency Module (Part 10A)
 */

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-"
  | "UNKNOWN";

export const BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "UNKNOWN",
];

// ============================================================================
// 1. INDIA EMERGENCY HELPLINE NUMBERS
// ============================================================================

export const INDIA_EMERGENCY_NUMBERS = {
  NATIONAL_EMERGENCY: {
    number: "112",
    name: "National Emergency Helpline (Unified)",
    description: "Single all-India emergency response number for Police, Fire, and Medical emergencies.",
    actionUrl: "tel:112",
    priority: "critical" as const,
    telephonyOnly: true,
  },
  AMBULANCE: {
    number: "108",
    name: "Ambulance / Emergency Medical Response",
    description: "Emergency medical response and ambulance dispatch service in participating Indian states/UTs.",
    actionUrl: "tel:108",
    priority: "critical" as const,
    telephonyOnly: true,
    regionalNote: "Operational in supported Indian states/UTs. In areas where 108 is unreachable, dial 112.",
  },
} as const;

// ============================================================================
// 2. EMERGENCY CONTACTS
// ============================================================================

export interface IEmergencyContact {
  id: string;
  _id?: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateEmergencyContactDto {
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface UpdateEmergencyContactDto {
  name?: string;
  relationship?: string;
  phone?: string;
  isPrimary?: boolean;
  notes?: string;
}

// ============================================================================
// 3. EMERGENCY PROFILE & INFORMATION
// ============================================================================

export interface IEmergencyInfo {
  userId: string;
  userName?: string;
  bloodGroup?: BloodGroup;
  allergies: string[];
  medicalConditions: string[];
  criticalNotes?: string;
  emergencyContacts: IEmergencyContact[];
  lastUpdated?: string | Date;
}

export interface UpdateEmergencyInfoDto {
  bloodGroup?: BloodGroup;
  allergies?: string[];
  medicalConditions?: string[];
  criticalNotes?: string;
}

// ============================================================================
// 4. EMERGENCY QR & PUBLIC FIRST RESPONDER SCANNER
// ============================================================================

export interface IEmergencyQR {
  id: string;
  userId: string;
  qrToken: string;
  qrCode: string;
  bloodGroup?: BloodGroup;
  allergies?: string[];
  medicalConditions?: string[];
  criticalNotes?: string;
  emergencyContacts?: IEmergencyContact[];
  isActive: boolean;
  lastAccessedAt?: string | Date;
  accessCount: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IPublicEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

export interface IPublicEmergencyInfo {
  userName: string;
  bloodGroup?: BloodGroup;
  allergies: string[];
  medicalConditions: string[];
  criticalNotes?: string;
  emergencyContacts: IPublicEmergencyContact[];
  verifiedAt: string | Date;
  disclaimer: string;
}

// ============================================================================
// 5. EMERGENCY CAPABILITIES
// ============================================================================

export interface IEmergencyCapabilities {
  emergencyCallingAvailable: boolean;
  nearbyHospitalsAvailable: boolean;
  ambulanceDiscoveryAvailable: boolean;
  ambulanceDispatchAvailable: boolean;
  liveTrackingAvailable: boolean;
  etaAvailable: boolean;
  providerStatus: {
    locationProvider: "google" | "mock";
    ambulanceProvider: "mock_provider" | "none" | "live_provider";
    isRealAmbulanceProvider: boolean;
  };
  emergencyNumbers: {
    nationalEmergency: string;
    ambulance: string;
  };
  disclaimer: string;
}

// ============================================================================
// 6. SOS EVENT & SAFETY LOG
// ============================================================================

export type SOSStatus = "triggered" | "acknowledged" | "resolved" | "cancelled";

export interface TriggerSOSDto {
  latitude?: number;
  longitude?: number;
  notes?: string;
  batteryLevel?: number;
  networkStatus?: string;
}

export interface ISOSRecord {
  id: string;
  userId: string;
  status: SOSStatus;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  notes?: string;
  contactsNotifiedCount: number;
  dispatchedRealEmergency: boolean;
  disclaimer: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TriggerSOSResponseDto {
  sosRecord: ISOSRecord;
  emergencyNumbers: {
    nationalEmergency: string;
    ambulance: string;
  };
  capabilities: IEmergencyCapabilities;
  instructions: string[];
}

export interface ShareEmergencyPayloadDto {
  recipientEmail?: string;
  recipientPhone?: string;
  message?: string;
  includeVitals?: boolean;
  latitude?: number;
  longitude?: number;
}
