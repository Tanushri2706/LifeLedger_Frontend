export enum FamilyRelationship {
  MOTHER = "mother",
  FATHER = "father",
  SPOUSE = "spouse",
  SON = "son",
  DAUGHTER = "daughter",
  BROTHER = "brother",
  SISTER = "sister",
  GRANDMOTHER = "grandmother",
  GRANDFATHER = "grandfather",
  GUARDIAN = "guardian",
  DEPENDENT = "dependent",
  OTHER = "other",
}

export enum FamilyMemberStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export enum HealthSubjectType {
  USER = "user",
  FAMILY_MEMBER = "family_member",
}

export interface ISubjectContextDto {
  type: "user" | "family_member";
  id: string;
  displayName?: string;
  relationship?: string;
}

export interface FamilyMemberResponseDto {
  id: string;
  displayName: string;
  relationship: FamilyRelationship;
  dateOfBirth?: string | null;
  age?: number | null;
  gender?: string | null;
  bloodGroup?: string | null;
  phone?: string | null;
  emergencyNotes?: string | null;
  allergies: string[];
  medicalConditions: string[];
  managementAuthorizationConfirmed: boolean;
  managementAuthorizationConfirmedAt?: string | null;
  status: FamilyMemberStatus;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyMemberDto {
  displayName: string;
  relationship: FamilyRelationship;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  phone?: string;
  emergencyNotes?: string;
  allergies?: string[];
  medicalConditions?: string[];
  managementAuthorizationConfirmed: boolean;
}

export interface UpdateFamilyMemberDto {
  displayName?: string;
  relationship?: FamilyRelationship;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  phone?: string | null;
  emergencyNotes?: string | null;
  allergies?: string[];
  medicalConditions?: string[];
  managementAuthorizationConfirmed?: boolean;
}

export interface FamilyVaultSummaryDto {
  activeMemberCount: number;
  archivedMemberCount: number;
  totalMembers: number;
  relationshipsSummary: Record<string, number>;
}
