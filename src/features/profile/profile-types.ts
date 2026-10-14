import type { Gender, BloodGroup, UserRole } from "@/types";

export interface UserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  bloodGroup?: BloodGroup;
  profilePhoto?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup | "";
}

export interface AvatarUploadResponseDto {
  profilePhoto?: string;
  avatar?: string;
  user?: UserProfileDto;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface RequestEmailChangeDto {
  newEmail: string;
}

export interface VerifyEmailChangeDto {
  newEmail: string;
  otp: string;
}
