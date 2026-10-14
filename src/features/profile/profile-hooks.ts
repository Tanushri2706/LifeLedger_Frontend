import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { profileApi } from "./profile-api";
import { useAuth } from "@/hooks/use-auth";
import type {
  UpdateProfileDto,
  ChangePasswordDto,
  RequestEmailChangeDto,
  VerifyEmailChangeDto,
} from "./profile-types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

// ============================================================================
// PROFILE QUERY
// ============================================================================

export function useProfileQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      return profileApi.getProfile();
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// PROFILE MUTATIONS
// ============================================================================

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { user, accessToken, setSession } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdateProfileDto) => {
      return profileApi.updateProfile(payload);
    },
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully.");
      queryClient.setQueryData(profileKeys.detail(), updatedUser);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      // Synchronize global auth state so navbar and sidebar update immediately
      if (user) {
        setSession({ ...user, ...updatedUser }, accessToken);
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      toast.error(msg);
    },
  });
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();
  const { user, accessToken, setSession } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      return profileApi.uploadAvatar(file);
    },
    onSuccess: (data) => {
      toast.success("Profile photo updated.");
      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      const photoUrl = data.profilePhoto || data.avatar;
      if (user && photoUrl) {
        setSession({ ...user, profilePhoto: photoUrl, avatar: photoUrl }, accessToken);
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to upload photo.";
      toast.error(msg);
    },
  });
}

export function useRemoveAvatarMutation() {
  const queryClient = useQueryClient();
  const { user, accessToken, setSession } = useAuth();

  return useMutation({
    mutationFn: async () => {
      return profileApi.removeAvatar();
    },
    onSuccess: () => {
      toast.success("Profile photo removed.");
      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      if (user) {
        setSession({ ...user, profilePhoto: undefined, avatar: undefined }, accessToken);
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to remove photo.";
      toast.error(msg);
    },
  });
}

// ============================================================================
// SECURITY & SESSION REVOKING MUTATIONS
// ============================================================================

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: async (payload: ChangePasswordDto) => {
      return profileApi.changePassword(payload);
    },
    onSuccess: async () => {
      toast.success("Password changed successfully. Please sign in again.");
      try {
        await logout();
      } catch {
        queryClient.clear();
      }
      router.replace("/signin");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to change password.";
      toast.error(msg);
    },
  });
}

export function useRequestEmailChangeMutation() {
  return useMutation({
    mutationFn: async (payload: RequestEmailChangeDto) => {
      return profileApi.requestEmailChange(payload);
    },
    onSuccess: () => {
      toast.success("Verification code dispatched to your new email address.");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to request email change.";
      toast.error(msg);
    },
  });
}

export function useVerifyEmailChangeMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: async (payload: VerifyEmailChangeDto) => {
      return profileApi.verifyEmailChange(payload);
    },
    onSuccess: async () => {
      toast.success("Email changed successfully. Please sign in again with your new email.");
      try {
        await logout();
      } catch {
        queryClient.clear();
      }
      router.replace("/signin");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to verify email change.";
      toast.error(msg);
    },
  });
}
