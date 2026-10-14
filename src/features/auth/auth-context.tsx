"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  UserProfile,
  DoctorProfile,
  UserRole,
  LoginDto,
  SignupUserDto,
  SignupDoctorDto,
  VerifyEmailDto,
  ResendOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseData,
} from "@/types";
import { setAccessToken, onSessionExpired } from "@/lib/api-client";
import { authApi } from "./auth-api";

interface AuthContextType {
  user: (UserProfile & { name?: string }) | (DoctorProfile & { name?: string }) | null;
  role: UserRole | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<AuthResponseData>;
  signup: (dto: SignupUserDto) => Promise<AuthResponseData>;
  signupDoctor: (dto: SignupDoctorDto) => Promise<AuthResponseData>;
  verifyEmail: (dto: VerifyEmailDto) => Promise<{ success: boolean }>;
  resendOtp: (dto: ResendOtpDto) => Promise<{ success: boolean }>;
  forgotPassword: (dto: ForgotPasswordDto) => Promise<{ success: boolean }>;
  resetPassword: (dto: ResetPasswordDto) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  setSession: (
    user: UserProfile | DoctorProfile | null,
    token: string | null
  ) => void;
  refreshSession: () => Promise<AuthResponseData | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatUser = (user: UserProfile | DoctorProfile | null) => {
  if (!user) return null;
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return {
    ...user,
    name: user.name || fullName || user.email,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<(UserProfile & { name?: string }) | (DoctorProfile & { name?: string }) | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const role = user?.role ?? null;
  const isAuthenticated = !!user;

  const setSession = useCallback(
    (newUser: UserProfile | DoctorProfile | null, token: string | null) => {
      const formatted = formatUser(newUser);
      setUser(formatted);
      setAccessTokenState(token);
      setAccessToken(token);
    },
    []
  );

  const refreshSession = useCallback(async (): Promise<AuthResponseData | null> => {
    try {
      const res = await authApi.refreshToken();
      if (res?.data?.user) {
        let profile: UserProfile | DoctorProfile = res.data.user;
        if (res.data.doctor) {
          profile = {
            ...profile,
            doctor: res.data.doctor,
            licenseNumber: res.data.doctor.licenseNumber,
            specialization: res.data.doctor.specialization,
            qualification: res.data.doctor.qualification,
            hospital: res.data.doctor.hospital,
            consultationFee: res.data.doctor.consultationFee,
            languages: res.data.doctor.languages,
            isDoctorVerified: res.data.doctor.verified,
          };
        }
        setSession(profile, res.data.accessToken || null);
        return res.data;
      }
      return null;
    } catch {
      setSession(null, null);
      return null;
    }
  }, [setSession]);

  // Restore session on initial application mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        await refreshSession();
      } catch {
        // Not logged in or expired
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for session expiration events from api-client
    const unsubscribe = onSessionExpired(() => {
      if (mounted) {
        queryClient.clear();
        setUser(null);
        setAccessTokenState(null);
      }
    });

    // Handle pageshow event (e.g. restoration from browser bfcache on Back/Forward navigation)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refreshSession().then((refreshed) => {
          if (!refreshed) {
            queryClient.clear();
            setSession(null, null);
          }
        });
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      mounted = false;
      unsubscribe();
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [refreshSession, setSession, queryClient]);

  const login = async (credentials: LoginDto): Promise<AuthResponseData> => {
    setIsLoading(true);
    try {
      // Clear any previous query cache before setting fresh session
      queryClient.clear();
      const res = await authApi.login(credentials);
      let profile: UserProfile | DoctorProfile = res.data.user;
      if (res.data.doctor) {
        profile = {
          ...profile,
          doctor: res.data.doctor,
          licenseNumber: res.data.doctor.licenseNumber,
          specialization: res.data.doctor.specialization,
          qualification: res.data.doctor.qualification,
          hospital: res.data.doctor.hospital,
          consultationFee: res.data.doctor.consultationFee,
          languages: res.data.doctor.languages,
          isDoctorVerified: res.data.doctor.verified,
        };
      }
      setSession(profile, res.data.accessToken || null);
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (dto: SignupUserDto): Promise<AuthResponseData> => {
    setIsLoading(true);
    try {
      const res = await authApi.signup(dto);
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const signupDoctor = async (dto: SignupDoctorDto): Promise<AuthResponseData> => {
    setIsLoading(true);
    try {
      const res = await authApi.signupDoctor(dto);
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (dto: VerifyEmailDto): Promise<{ success: boolean }> => {
    const res = await authApi.verifyEmail(dto);
    return res.data;
  };

  const resendOtp = async (dto: ResendOtpDto): Promise<{ success: boolean }> => {
    const res = await authApi.resendOtp(dto);
    return res.data;
  };

  const forgotPassword = async (dto: ForgotPasswordDto): Promise<{ success: boolean }> => {
    const res = await authApi.forgotPassword(dto);
    return res.data;
  };

  const resetPassword = async (dto: ResetPasswordDto): Promise<{ success: boolean }> => {
    const res = await authApi.resetPassword(dto);
    setSession(null, null);
    return res.data;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Clear local session even if backend call errors
    } finally {
      // Invalidate and wipe all cached private queries so no user data remains in memory
      queryClient.clear();
      setSession(null, null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        accessToken: accessTokenState,
        isAuthenticated,
        isLoading,
        login,
        signup,
        signupDoctor,
        verifyEmail,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
        setSession,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
