import type { ISubjectContextDto } from "@/features/family/family-types";

export type MedicalShareAccessMode = "one_time" | "time_limited";
export type MedicalShareStatus = "active" | "consumed" | "revoked" | "expired";

export interface CreateMedicalShareDto {
  subjectType?: "user" | "family_member";
  subjectId?: string;
  reportIds: string[];
  accessMode?: MedicalShareAccessMode;
  expiresInMinutes?: number; // 15 | 60
}

export interface MedicalShareCreatedResponseDto {
  shareId: string;
  rawToken: string;
  shareUrl: string;
  subject: ISubjectContextDto;
  selectedReportCount: number;
  accessMode: MedicalShareAccessMode;
  expiresAt: string;
  status: MedicalShareStatus;
  createdAt: string;
}

export interface SharedReportSummaryDto {
  id: string;
  title: string;
  category: string;
  reportType?: string;
  reportDate: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  originalFilename: string;
}

export interface MedicalShareOwnerResponseDto {
  id: string;
  subject: ISubjectContextDto;
  reportCount: number;
  selectedReports?: SharedReportSummaryDto[];
  accessMode: MedicalShareAccessMode;
  status: MedicalShareStatus;
  expiresAt: string;
  consumedAt?: string | null;
  revokedAt?: string | null;
  lastAccessedAt?: string | null;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
}

// Public Recipient DTOs
export interface PublicMedicalShareMetadataDto {
  shareId: string;
  subjectDisplayName: string;
  reportCount: number;
  accessMode: MedicalShareAccessMode;
  expiresAt: string;
  status: MedicalShareStatus;
  isReadyForAccess: boolean;
}

export interface PublicMedicalShareAccessSessionDto {
  sessionToken: string;
  sessionExpiresAt: string;
  subjectDisplayName: string;
  reports: SharedReportSummaryDto[];
}

export interface PublicMedicalShareDocumentDownloadDto {
  downloadUrl: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
}
