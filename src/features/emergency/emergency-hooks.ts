"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { emergencyApi } from "./emergency-api";
import type {
  IEmergencyCapabilities,
  IEmergencyInfo,
  UpdateEmergencyInfoDto,
  IEmergencyContact,
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
  IEmergencyQR,
  IPublicEmergencyInfo,
  TriggerSOSDto,
  TriggerSOSResponseDto,
} from "./emergency-types";

export const EMERGENCY_QUERY_KEY = ["emergency"] as const;

/**
 * Hook to retrieve emergency service capabilities (112/108 status, provider status)
 */
export function useEmergencyCapabilitiesQuery() {
  return useQuery<IEmergencyCapabilities, Error>({
    queryKey: [...EMERGENCY_QUERY_KEY, "capabilities"],
    queryFn: async () => {
      const res = await emergencyApi.getCapabilities();
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to retrieve authenticated user's emergency medical profile
 */
export function useEmergencyProfileQuery() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery<IEmergencyInfo, Error>({
    queryKey: [...EMERGENCY_QUERY_KEY, "profile"],
    queryFn: async () => {
      const res = await emergencyApi.getEmergencyProfile();
      return res.data.emergencyInfo;
    },
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to retrieve user's emergency contacts list
 */
export function useEmergencyContactsQuery() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery<IEmergencyContact[], Error>({
    queryKey: [...EMERGENCY_QUERY_KEY, "contacts"],
    queryFn: async () => {
      const res = await emergencyApi.getContacts();
      return res.data.contacts;
    },
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to retrieve user's Emergency QR
 */
export function useEmergencyQRQuery() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery<IEmergencyQR, Error>({
    queryKey: [...EMERGENCY_QUERY_KEY, "qr"],
    queryFn: async () => {
      const res = await emergencyApi.getEmergencyQR();
      return res.data.qr;
    },
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook for public first-responder scanner lookup (No auth required)
 */
export function usePublicEmergencyInfoQuery(token: string | null) {
  const isValidToken = Boolean(token && token.trim().length > 0);

  return useQuery<IPublicEmergencyInfo, Error>({
    queryKey: [...EMERGENCY_QUERY_KEY, "public-info", token],
    queryFn: async () => {
      if (!token) throw new Error("Emergency token is required.");
      const res = await emergencyApi.getPublicEmergencyInfo(token);
      return res.data.emergencyInfo;
    },
    enabled: isValidToken,
    staleTime: 10 * 1000,
    retry: 1,
  });
}

/**
 * Mutation to update emergency medical profile
 */
export function useUpdateEmergencyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ emergencyInfo: IEmergencyInfo }, Error, UpdateEmergencyInfoDto>({
    mutationFn: async (dto) => {
      const res = await emergencyApi.updateEmergencyProfile(dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Emergency profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "profile"] });
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "qr"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update emergency profile.");
    },
  });
}

/**
 * Mutation to add a new emergency contact
 */
export function useCreateEmergencyContactMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ contact: IEmergencyContact }, Error, CreateEmergencyContactDto>({
    mutationFn: async (dto) => {
      const res = await emergencyApi.createContact(dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Emergency contact added successfully.");
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "contacts"] });
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "profile"] });
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "qr"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create emergency contact.");
    },
  });
}

/**
 * Mutation to update an existing emergency contact
 */
export function useUpdateEmergencyContactMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { contact: IEmergencyContact },
    Error,
    { contactId: string; dto: UpdateEmergencyContactDto }
  >({
    mutationFn: async ({ contactId, dto }) => {
      const res = await emergencyApi.updateContact(contactId, dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Emergency contact updated.");
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "contacts"] });
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "profile"] });
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "qr"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update contact.");
    },
  });
}

/**
 * Mutation to delete an emergency contact
 */
export function useDeleteEmergencyContactMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (contactId) => {
      await emergencyApi.deleteContact(contactId);
    },
    onSuccess: () => {
      toast.success("Emergency contact removed.");
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "contacts"] });
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "profile"] });
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "qr"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete contact.");
    },
  });
}

/**
 * Mutation to rotate Emergency QR token
 */
export function useRotateEmergencyQRMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ qr: IEmergencyQR }, Error, void>({
    mutationFn: async () => {
      const res = await emergencyApi.rotateEmergencyQR();
      return res.data;
    },
    onSuccess: () => {
      toast.success("Emergency QR regenerated. Previous code is now inactive.");
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "qr"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to rotate Emergency QR.");
    },
  });
}

/**
 * Mutation to trigger an intentional SOS event
 */
export function useTriggerSOSMutation() {
  const queryClient = useQueryClient();

  return useMutation<TriggerSOSResponseDto, Error, TriggerSOSDto>({
    mutationFn: async (dto) => {
      const res = await emergencyApi.triggerSOS(dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Emergency event recorded in safety log.");
      queryClient.invalidateQueries({ queryKey: [...EMERGENCY_QUERY_KEY, "sos"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to record SOS event.");
    },
  });
}
