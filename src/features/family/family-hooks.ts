import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { familyApi } from "./family-api";
import { reportsApi, type GetReportsQueryParams } from "@/features/reports";
import { healthIntelligenceApi } from "@/features/health-intelligence";
import { timelineApi, type GetTimelineQueryParams } from "@/features/timeline";
import type {
  CreateFamilyMemberDto,
  UpdateFamilyMemberDto,
} from "./family-types";

// ============================================================================
// FAMILY VAULT QUERY KEYS
// ============================================================================

export const familyKeys = {
  all: ["family"] as const,
  summary: () => [...familyKeys.all, "summary"] as const,
  members: (includeArchived = false) =>
    [...familyKeys.all, "members", { includeArchived }] as const,
  member: (memberId: string) => [...familyKeys.all, "member", memberId] as const,
  reports: (memberId: string, params?: GetReportsQueryParams) =>
    ["reports", "family", memberId, params] as const,
  healthIntelligence: (memberId: string) =>
    ["healthIntelligence", "family", memberId] as const,
  timeline: (memberId: string, params?: GetTimelineQueryParams) =>
    ["timeline", "family", memberId, params] as const,
};

// ============================================================================
// HOOKS: FAMILY VAULT SUMMARY & MEMBERS
// ============================================================================

export function useFamilyVaultSummaryQuery() {
  return useQuery({
    queryKey: familyKeys.summary(),
    queryFn: async () => {
      return familyApi.getVaultSummary();
    },
    staleTime: 60 * 1000,
  });
}

export function useFamilyMembersQuery(includeArchived: boolean = false) {
  return useQuery({
    queryKey: familyKeys.members(includeArchived),
    queryFn: async () => {
      const members = await familyApi.getMembers(includeArchived);
      return Array.isArray(members) ? members : [];
    },
    staleTime: 30 * 1000,
  });
}

export function useFamilyMemberDetailQuery(memberId: string) {
  return useQuery({
    queryKey: familyKeys.member(memberId),
    queryFn: async () => {
      if (!memberId) throw new Error("Member ID is required");
      return familyApi.getMemberById(memberId);
    },
    enabled: Boolean(memberId),
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// MUTATIONS: FAMILY PROFILES CRUD
// ============================================================================

export function useCreateFamilyMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateFamilyMemberDto) => {
      return familyApi.createMember(payload);
    },
    onSuccess: (newMember) => {
      toast.success(`${newMember?.displayName || "Family member"} added to Family Vault.`);
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
    },
    onError: (err: unknown) => {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create family profile.";
      toast.error(errorMsg);
    },
  });
}

export function useUpdateFamilyMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      payload,
    }: {
      memberId: string;
      payload: UpdateFamilyMemberDto;
    }) => {
      return familyApi.updateMember(memberId, payload);
    },
    onSuccess: (updated) => {
      toast.success(`${updated?.displayName || "Family member"} updated successfully.`);
      if (updated?.id) {
        queryClient.invalidateQueries({ queryKey: familyKeys.member(updated.id) });
      }
      queryClient.invalidateQueries({ queryKey: familyKeys.members(false) });
      queryClient.invalidateQueries({ queryKey: familyKeys.members(true) });
      queryClient.invalidateQueries({ queryKey: familyKeys.summary() });
    },
    onError: (err: unknown) => {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update family profile.";
      toast.error(errorMsg);
    },
  });
}

export function useArchiveFamilyMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      return familyApi.archiveMember(memberId);
    },
    onSuccess: (_, memberId) => {
      toast.success("Family member archived from active vault.");
      queryClient.invalidateQueries({ queryKey: familyKeys.member(memberId) });
      queryClient.invalidateQueries({ queryKey: familyKeys.members(false) });
      queryClient.invalidateQueries({ queryKey: familyKeys.members(true) });
      queryClient.invalidateQueries({ queryKey: familyKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ["medical-shares"] });
    },
    onError: (err: unknown) => {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to archive family member.";
      toast.error(errorMsg);
    },
  });
}

export function useRestoreFamilyMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      return familyApi.restoreMember(memberId);
    },
    onSuccess: (restored) => {
      toast.success(`${restored?.displayName || "Family member"} restored to active vault.`);
      if (restored?.id) {
        queryClient.invalidateQueries({ queryKey: familyKeys.member(restored.id) });
      }
      queryClient.invalidateQueries({ queryKey: familyKeys.members(false) });
      queryClient.invalidateQueries({ queryKey: familyKeys.members(true) });
      queryClient.invalidateQueries({ queryKey: familyKeys.summary() });
    },
    onError: (err: unknown) => {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to restore family member.";
      toast.error(errorMsg);
    },
  });
}

// ============================================================================
// SUBJECT-AWARE DATA HOOKS FOR FAMILY MEMBER TABS
// ============================================================================

export function useFamilyMemberReportsQuery(
  memberId: string,
  params?: GetReportsQueryParams
) {
  return useQuery({
    queryKey: familyKeys.reports(memberId, params),
    queryFn: async () => {
      if (!memberId) throw new Error("Member ID is required");
      const res = await reportsApi.getReports({
        ...params,
        subjectType: "family_member",
        subjectId: memberId,
      });
      return res.data;
    },
    enabled: Boolean(memberId),
    staleTime: 30 * 1000,
  });
}

export function useFamilyMemberHealthIntelligenceQuery(memberId: string) {
  return useQuery({
    queryKey: familyKeys.healthIntelligence(memberId),
    queryFn: async () => {
      if (!memberId) throw new Error("Member ID is required");
      const res = await healthIntelligenceApi.getAggregateHealthIntelligence({
        subjectType: "family_member",
        subjectId: memberId,
      });
      return res.data;
    },
    enabled: Boolean(memberId),
    staleTime: 60 * 1000,
  });
}

export function useFamilyMemberTimelineQuery(
  memberId: string,
  params?: GetTimelineQueryParams
) {
  return useQuery({
    queryKey: familyKeys.timeline(memberId, params),
    queryFn: async () => {
      if (!memberId) throw new Error("Member ID is required");
      const res = await timelineApi.getTimeline({
        ...params,
        subjectType: "family_member",
        subjectId: memberId,
      });
      return res.data;
    },
    enabled: Boolean(memberId),
    staleTime: 30 * 1000,
  });
}
