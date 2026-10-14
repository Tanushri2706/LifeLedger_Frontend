import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { medicalShareApi } from "./medical-share-api";
import type {
  CreateMedicalShareDto,
  MedicalShareCreatedResponseDto,
} from "./medical-share-types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const medicalShareKeys = {
  all: ["medical-shares"] as const,
  list: (params?: { subjectType?: string; subjectId?: string }) =>
    [...medicalShareKeys.all, "list", params] as const,
  detail: (shareId: string) => [...medicalShareKeys.all, "detail", shareId] as const,
};

export const publicShareKeys = {
  metadata: (token: string) => ["public-medical-share", "metadata", token] as const,
  sessionReports: (sessionToken: string) =>
    ["public-medical-share", "session-reports", sessionToken] as const,
};

// ============================================================================
// OWNER HOOKS
// ============================================================================

export function useOwnerMedicalSharesQuery(params?: {
  subjectType?: string;
  subjectId?: string;
}) {
  return useQuery({
    queryKey: medicalShareKeys.list(params),
    queryFn: async () => {
      const shares = await medicalShareApi.listOwnerShares(params);
      return Array.isArray(shares) ? shares : [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateMedicalShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateMedicalShareDto
    ): Promise<MedicalShareCreatedResponseDto> => {
      return await medicalShareApi.createShare(payload);
    },
    onSuccess: () => {
      toast.success("Secure medical share created successfully.");
      queryClient.invalidateQueries({ queryKey: medicalShareKeys.all });
    },
    onError: (err: unknown) => {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create medical share.";
      toast.error(errorMsg);
    },
  });
}

export function useRevokeMedicalShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareId: string) => {
      return await medicalShareApi.revokeShare(shareId);
    },
    onSuccess: () => {
      toast.success("Medical share revoked. Access has stopped immediately.");
      queryClient.invalidateQueries({ queryKey: medicalShareKeys.all });
    },
    onError: (err: unknown) => {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to revoke medical share.";
      toast.error(errorMsg);
    },
  });
}

// ============================================================================
// PUBLIC RECIPIENT HOOKS
// ============================================================================

export function usePublicMedicalShareMetadataQuery(token: string) {
  return useQuery({
    queryKey: publicShareKeys.metadata(token),
    queryFn: async () => {
      if (!token) throw new Error("Share token is required");
      return await medicalShareApi.getPublicMetadata(token);
    },
    enabled: Boolean(token),
    retry: false, // Don't retry on 404/410 expired
    staleTime: 60 * 1000,
  });
}

export function useAccessPublicShareMutation() {
  return useMutation({
    mutationFn: async (token: string) => {
      return await medicalShareApi.accessPublicShare(token);
    },
  });
}

export function useSessionReportsQuery(sessionToken: string | null) {
  return useQuery({
    queryKey: publicShareKeys.sessionReports(sessionToken || ""),
    queryFn: async () => {
      if (!sessionToken) throw new Error("Active session token required");
      const reports = await medicalShareApi.getSessionReports(sessionToken);
      return Array.isArray(reports) ? reports : [];
    },
    enabled: Boolean(sessionToken),
    staleTime: 60 * 1000,
  });
}
