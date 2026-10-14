import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  FamilyMemberResponseDto,
  CreateFamilyMemberDto,
  UpdateFamilyMemberDto,
  FamilyVaultSummaryDto,
} from "./family-types";

interface GetMembersBackendResponse {
  members: FamilyMemberResponseDto[];
  count: number;
}

interface SingleMemberBackendResponse {
  member: FamilyMemberResponseDto;
  message?: string;
}

export const familyApi = {
  /**
   * Get summary metrics for the user's Family Vault
   */
  getVaultSummary: async (): Promise<FamilyVaultSummaryDto> => {
    const res = await http.get<
      ApiResponse<FamilyVaultSummaryDto | { summary: FamilyVaultSummaryDto }> | FamilyVaultSummaryDto | { summary: FamilyVaultSummaryDto }
    >("/family/summary");

    if (!res) {
      throw new Error("Failed to retrieve Family Vault summary");
    }

    const payload = "data" in res && res.data !== undefined ? res.data : res;

    if (payload && typeof payload === "object" && "summary" in payload && payload.summary) {
      return payload.summary;
    }

    return payload as FamilyVaultSummaryDto;
  },

  /**
   * List all managed family profiles (active or including archived)
   * Unwraps { members: [...], count: ... } into canonical FamilyMemberResponseDto[]
   */
  getMembers: async (
    includeArchived: boolean = false
  ): Promise<FamilyMemberResponseDto[]> => {
    const url = includeArchived ? "/family/members?includeArchived=true" : "/family/members";
    const res = await http.get<
      ApiResponse<GetMembersBackendResponse | FamilyMemberResponseDto[]> | GetMembersBackendResponse | FamilyMemberResponseDto[]
    >(url);

    if (!res) {
      return [];
    }

    const payload = "data" in res && res.data !== undefined ? res.data : res;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && typeof payload === "object" && "members" in payload && Array.isArray(payload.members)) {
      return payload.members;
    }

    return [];
  },

  /**
   * Get single family profile by ID
   * Unwraps { member: ... } into canonical FamilyMemberResponseDto
   */
  getMemberById: async (
    memberId: string
  ): Promise<FamilyMemberResponseDto> => {
    const res = await http.get<
      ApiResponse<SingleMemberBackendResponse | FamilyMemberResponseDto> | SingleMemberBackendResponse | FamilyMemberResponseDto
    >(`/family/members/${memberId}`);

    if (!res) {
      throw new Error("Family member not found");
    }

    const payload = "data" in res && res.data !== undefined ? res.data : res;

    if (payload && typeof payload === "object" && "member" in payload && payload.member) {
      return payload.member;
    }

    return payload as FamilyMemberResponseDto;
  },

  /**
   * Create a new managed family member profile
   * Unwraps { member: ... } into canonical FamilyMemberResponseDto
   */
  createMember: async (
    payload: CreateFamilyMemberDto
  ): Promise<FamilyMemberResponseDto> => {
    const res = await http.post<
      ApiResponse<SingleMemberBackendResponse | FamilyMemberResponseDto> | SingleMemberBackendResponse | FamilyMemberResponseDto
    >("/family/members", payload);

    if (!res) {
      throw new Error("Failed to create family member profile");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;

    if (data && typeof data === "object" && "member" in data && data.member) {
      return data.member;
    }

    return data as FamilyMemberResponseDto;
  },

  /**
   * Update fields for a managed family profile
   * Unwraps { member: ... } into canonical FamilyMemberResponseDto
   */
  updateMember: async (
    memberId: string,
    payload: UpdateFamilyMemberDto
  ): Promise<FamilyMemberResponseDto> => {
    const res = await http.patch<
      ApiResponse<SingleMemberBackendResponse | FamilyMemberResponseDto> | SingleMemberBackendResponse | FamilyMemberResponseDto
    >(`/family/members/${memberId}`, payload);

    if (!res) {
      throw new Error("Failed to update family member profile");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;

    if (data && typeof data === "object" && "member" in data && data.member) {
      return data.member;
    }

    return data as FamilyMemberResponseDto;
  },

  /**
   * Archive / remove a managed family profile from the active Family Vault
   * Unwraps { member: ... } into canonical FamilyMemberResponseDto
   */
  archiveMember: async (
    memberId: string
  ): Promise<FamilyMemberResponseDto> => {
    const res = await http.delete<
      ApiResponse<SingleMemberBackendResponse | FamilyMemberResponseDto> | SingleMemberBackendResponse | FamilyMemberResponseDto
    >(`/family/members/${memberId}`);

    if (!res) {
      throw new Error("Failed to archive family member profile");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;

    if (data && typeof data === "object" && "member" in data && data.member) {
      return data.member;
    }

    return data as FamilyMemberResponseDto;
  },

  /**
   * Restore an archived family profile back to active status
   * Unwraps { member: ... } into canonical FamilyMemberResponseDto
   */
  restoreMember: async (
    memberId: string
  ): Promise<FamilyMemberResponseDto> => {
    const res = await http.post<
      ApiResponse<SingleMemberBackendResponse | FamilyMemberResponseDto> | SingleMemberBackendResponse | FamilyMemberResponseDto
    >(`/family/members/${memberId}/restore`);

    if (!res) {
      throw new Error("Failed to restore family member profile");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;

    if (data && typeof data === "object" && "member" in data && data.member) {
      return data.member;
    }

    return data as FamilyMemberResponseDto;
  },
};
