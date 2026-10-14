import { http } from "@/lib/api-client";
import type {
  ApiResponse,
  AuthResponseData,
  SignupUserDto,
  SignupDoctorDto,
  LoginDto,
  VerifyEmailDto,
  ResendOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UserProfile,
  DoctorProfileData,
} from "@/types";

export const authApi = {
  /**
   * User (Patient) signup
   */
  signup: async (dto: SignupUserDto): Promise<ApiResponse<AuthResponseData>> => {
    return http.post<ApiResponse<AuthResponseData>>("/auth/signup", dto);
  },

  /**
   * Doctor signup
   */
  signupDoctor: async (dto: SignupDoctorDto): Promise<ApiResponse<AuthResponseData>> => {
    return http.post<ApiResponse<AuthResponseData>>("/auth/signup/doctor", dto);
  },

  /**
   * Verify email via 6-digit OTP
   */
  verifyEmail: async (dto: VerifyEmailDto): Promise<ApiResponse<{ success: boolean }>> => {
    return http.post<ApiResponse<{ success: boolean }>>("/auth/verify-email", dto);
  },

  /**
   * Resend OTP for email verification or password reset
   */
  resendOtp: async (dto: ResendOtpDto): Promise<ApiResponse<{ success: boolean }>> => {
    return http.post<ApiResponse<{ success: boolean }>>("/auth/resend-otp", dto);
  },

  /**
   * User or Doctor login
   */
  login: async (dto: LoginDto): Promise<ApiResponse<AuthResponseData>> => {
    return http.post<ApiResponse<AuthResponseData>>("/auth/login", dto);
  },

  /**
   * Refresh session using HttpOnly refreshToken cookie
   */
  refreshToken: async (): Promise<ApiResponse<AuthResponseData>> => {
    return http.post<ApiResponse<AuthResponseData>>("/auth/refresh-token", {});
  },

  /**
   * Logout user (clears backend refresh token and HttpOnly cookie)
   */
  logout: async (): Promise<ApiResponse<Record<string, never>>> => {
    return http.post<ApiResponse<Record<string, never>>>("/auth/logout", {});
  },

  /**
   * Request password reset code
   */
  forgotPassword: async (dto: ForgotPasswordDto): Promise<ApiResponse<{ success: boolean }>> => {
    return http.post<ApiResponse<{ success: boolean }>>("/auth/forgot-password", dto);
  },

  /**
   * Reset password with verification code
   */
  resetPassword: async (dto: ResetPasswordDto): Promise<ApiResponse<{ success: boolean }>> => {
    return http.post<ApiResponse<{ success: boolean }>>("/auth/reset-password", dto);
  },

  /**
   * Get current authenticated user profile
   */
  getProfile: async (): Promise<ApiResponse<{ user: UserProfile; doctor?: DoctorProfileData }>> => {
    return http.get<ApiResponse<{ user: UserProfile; doctor?: DoctorProfileData }>>("/auth/profile");
  },
};
