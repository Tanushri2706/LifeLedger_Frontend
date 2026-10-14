import type { UserRole, BloodGroup, IEmergencyContact } from "@/types";

export interface UserProfileSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  healthScore: number;
  bloodGroup?: BloodGroup;
  emergencyContact?: IEmergencyContact;
}

export interface UserAccountStatus {
  isVerified: boolean;
  isProfileComplete: boolean;
  memberSince: string | Date;
  lastUpdated: string | Date;
}

export interface UserVitals {
  height?: number;
  weight?: number;
  bmi: number | null;
}

export interface UserMetrics {
  healthScore: number;
  profileCompletionPercentage: number;
}

export interface RecentReportSummary {
  id: string;
  title: string;
  category: string;
  reportDate: string | Date;
  fileUrl: string;
}

export interface HealthVaultSummary {
  totalReports: number;
  recentReports: RecentReportSummary[];
}

export interface RecentTimelineEventSummary {
  id: string;
  eventType: string;
  title: string;
  description: string;
  date: string | Date;
  sourceType: string;
}

export interface TimelinePreviewSummary {
  totalEvents: number;
  recentEvents: RecentTimelineEventSummary[];
}

export interface IUserDashboardData {
  profileSummary: UserProfileSummary;
  accountStatus: UserAccountStatus;
  vitals: UserVitals;
  metrics: UserMetrics;
  healthVault?: HealthVaultSummary;
  timelinePreview?: TimelinePreviewSummary;
}

export interface DoctorProfileSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
}

export interface DoctorProfessionalSummary {
  doctorId: string;
  licenseNumber: string;
  specialization: string;
  experience: number;
  qualification: string;
  hospital: string;
  consultationFee: number;
  languages: string[];
  availabilitySlotCount: number;
  verified: boolean;
}

export interface DoctorAccountStatus {
  isVerified: boolean;
  licenseVerified: boolean;
  memberSince: string | Date;
  lastUpdated: string | Date;
}

export interface DoctorMetrics {
  rating: number;
  reviewCount: number;
  experienceYears: number;
}

export interface IDoctorDashboardData {
  profileSummary: DoctorProfileSummary;
  professionalSummary: DoctorProfessionalSummary;
  accountStatus: DoctorAccountStatus;
  metrics: DoctorMetrics;
}

export interface DashboardResponseData {
  dashboard: IUserDashboardData | IDoctorDashboardData;
}
