import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  UserProfileDto,
  UpdateProfileDto,
  AvatarUploadResponseDto,
  ChangePasswordDto,
  RequestEmailChangeDto,
  VerifyEmailChangeDto,
} from "./profile-types";

interface ProfileBackendResponse {
  user: UserProfileDto;
}

export const profileApi = {
  /**
   * Get current authenticated user profile
   * Unwraps { user: ... } into canonical UserProfileDto
   */
  getProfile: async (): Promise<UserProfileDto> => {
    const res = await http.get<ApiResponse<ProfileBackendResponse | UserProfileDto> | ProfileBackendResponse | UserProfileDto>(
      "/auth/profile"
    );

    if (!res) {
      throw new Error("Failed to load user profile");
    }

    const payload = "data" in res && res.data !== undefined ? res.data : res;

    if (payload && typeof payload === "object" && "user" in payload && payload.user) {
      return payload.user;
    }

    return payload as UserProfileDto;
  },

  /**
   * Update profile fields (Full Name, Phone, Date of Birth, Gender, Blood Group)
   * Unwraps { user: ... } into canonical UserProfileDto
   */
  updateProfile: async (payload: UpdateProfileDto): Promise<UserProfileDto> => {
    const res = await http.patch<ApiResponse<ProfileBackendResponse | UserProfileDto> | ProfileBackendResponse | UserProfileDto>(
      "/auth/profile",
      payload
    );

    if (!res) {
      throw new Error("Failed to update profile");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;

    if (data && typeof data === "object" && "user" in data && data.user) {
      return data.user;
    }

    return data as UserProfileDto;
  },

  /**
   * Upload user avatar / profile photo
   */
  uploadAvatar: async (file: File): Promise<AvatarUploadResponseDto> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await http.post<ApiResponse<AvatarUploadResponseDto> | AvatarUploadResponseDto>(
      "/auth/profile/avatar",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (!res) {
      throw new Error("Failed to upload avatar image");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;
    return data as AvatarUploadResponseDto;
  },

  /**
   * Remove / delete user avatar photo
   */
  removeAvatar: async (): Promise<{ success: boolean; message?: string }> => {
    const res = await http.delete<ApiResponse<{ success: boolean; message?: string }> | { success: boolean; message?: string }>(
      "/auth/profile/avatar"
    );

    if (!res) {
      throw new Error("Failed to remove avatar image");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;
    return data as { success: boolean; message?: string };
  },

  /**
   * Change account password (revokes all refresh sessions upon success)
   */
  changePassword: async (payload: ChangePasswordDto): Promise<{ success: boolean; message?: string }> => {
    const res = await http.post<ApiResponse<{ success: boolean; message?: string }> | { success: boolean; message?: string }>(
      "/auth/change-password",
      payload
    );

    if (!res) {
      throw new Error("Failed to change password");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;
    return data as { success: boolean; message?: string };
  },

  /**
   * Request email change verification OTP to new email address
   */
  requestEmailChange: async (payload: RequestEmailChangeDto): Promise<{ success: boolean; message?: string }> => {
    const res = await http.post<ApiResponse<{ success: boolean; message?: string }> | { success: boolean; message?: string }>(
      "/auth/email/request-change",
      payload
    );

    if (!res) {
      throw new Error("Failed to request email change code");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;
    return data as { success: boolean; message?: string };
  },

  /**
   * Verify email change OTP and update email (revokes all refresh sessions upon success)
   */
  verifyEmailChange: async (payload: VerifyEmailChangeDto): Promise<{ success: boolean; message?: string }> => {
    const res = await http.post<ApiResponse<{ success: boolean; message?: string }> | { success: boolean; message?: string }>(
      "/auth/email/verify-change",
      payload
    );

    if (!res) {
      throw new Error("Failed to verify email change code");
    }

    const data = "data" in res && res.data !== undefined ? res.data : res;
    return data as { success: boolean; message?: string };
  },
};
