import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { doctorApi } from "./doctor-api";
import { useAuth } from "@/hooks/use-auth";
import type { CreatePrescriptionDto, DayAvailabilityDto, UpdateDoctorProfileDto } from "./doctor-types";

export const doctorKeys = {
  all: ["doctor"] as const,
  dashboard: () => [...doctorKeys.all, "dashboard"] as const,
  appointments: () => [...doctorKeys.all, "appointments"] as const,
  appointmentDetail: (id: string) => [...doctorKeys.all, "appointment", id] as const,
  prescription: (appointmentId: string) => [...doctorKeys.all, "prescription", appointmentId] as const,
  availability: () => [...doctorKeys.all, "availability"] as const,
  profile: () => [...doctorKeys.all, "profile"] as const,
};

export function useDoctorDashboardQuery() {
  const { isAuthenticated, role } = useAuth();
  const isDoctor = isAuthenticated && role === "doctor";

  return useQuery({
    queryKey: doctorKeys.dashboard(),
    queryFn: async () => {
      return doctorApi.getDashboard();
    },
    enabled: isDoctor,
    staleTime: 30 * 1000,
  });
}

export function useDoctorAppointmentsQuery() {
  const { isAuthenticated, role } = useAuth();
  const isDoctor = isAuthenticated && role === "doctor";

  return useQuery({
    queryKey: doctorKeys.appointments(),
    queryFn: async () => {
      return doctorApi.getAppointments();
    },
    enabled: isDoctor,
    staleTime: 30 * 1000,
  });
}

export function useDoctorAppointmentDetailQuery(appointmentId: string | null | undefined) {
  const { isAuthenticated, role } = useAuth();
  const isDoctor = isAuthenticated && role === "doctor";

  return useQuery({
    queryKey: doctorKeys.appointmentDetail(appointmentId || ""),
    queryFn: async () => {
      if (!appointmentId) return null;
      return doctorApi.getAppointmentById(appointmentId);
    },
    enabled: Boolean(isDoctor && appointmentId),
    staleTime: 30 * 1000,
  });
}

export function useDoctorPrescriptionQuery(appointmentId: string | null | undefined) {
  const { isAuthenticated, role } = useAuth();
  const isDoctor = isAuthenticated && role === "doctor";

  return useQuery({
    queryKey: doctorKeys.prescription(appointmentId || ""),
    queryFn: async () => {
      if (!appointmentId) return null;
      return doctorApi.getPrescription(appointmentId);
    },
    enabled: Boolean(isDoctor && appointmentId),
    staleTime: 30 * 1000,
  });
}

export function useAcceptAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      return doctorApi.acceptAppointment(appointmentId);
    },
    onSuccess: (_, appointmentId) => {
      toast.success("Appointment accepted successfully.");
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointmentDetail(appointmentId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.dashboard() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept appointment. Please try again.");
    },
  });
}

export function useRejectAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, reason }: { appointmentId: string; reason: string }) => {
      return doctorApi.rejectAppointment(appointmentId, reason);
    },
    onSuccess: (_, variables) => {
      toast.success("Appointment request declined.");
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointmentDetail(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.dashboard() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject appointment. Please try again.");
    },
  });
}

export function useCompleteAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      return doctorApi.completeAppointment(appointmentId);
    },
    onSuccess: (_, appointmentId) => {
      toast.success("Appointment marked as completed.");
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointmentDetail(appointmentId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.dashboard() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete appointment. Please try again.");
    },
  });
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, reason }: { appointmentId: string; reason?: string }) => {
      return doctorApi.cancelAppointment(appointmentId, reason);
    },
    onSuccess: (_, variables) => {
      toast.success("Appointment cancelled.");
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointmentDetail(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.dashboard() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel appointment. Please try again.");
    },
  });
}

export function useCreatePrescriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      dto,
    }: {
      appointmentId: string;
      dto: CreatePrescriptionDto;
    }) => {
      return doctorApi.createPrescription(appointmentId, dto);
    },
    onSuccess: (_, variables) => {
      toast.success("Prescription saved successfully.");
      queryClient.invalidateQueries({ queryKey: doctorKeys.prescription(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointmentDetail(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointments() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save prescription. Please try again.");
    },
  });
}

export function useDoctorAvailabilityQuery() {
  const { isAuthenticated, role } = useAuth();
  const isDoctor = isAuthenticated && role === "doctor";

  return useQuery({
    queryKey: doctorKeys.availability(),
    queryFn: async () => {
      return doctorApi.getAvailability();
    },
    enabled: isDoctor,
    staleTime: 30 * 1000,
  });
}

export function useUpdateDoctorAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (availability: DayAvailabilityDto[]) => {
      return doctorApi.updateAvailability(availability);
    },
    onSuccess: () => {
      toast.success("Working hours schedule saved successfully.");
      queryClient.invalidateQueries({ queryKey: doctorKeys.availability() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.dashboard() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save availability schedule. Please try again.");
    },
  });
}

export function useDoctorProfileQuery() {
  const { isAuthenticated, role } = useAuth();
  const isDoctor = isAuthenticated && role === "doctor";

  return useQuery({
    queryKey: doctorKeys.profile(),
    queryFn: async () => {
      return doctorApi.getProfile();
    },
    enabled: isDoctor,
    staleTime: 60 * 1000,
  });
}

export function useUpdateDoctorProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateDoctorProfileDto) => {
      return doctorApi.updateProfile(dto);
    },
    onSuccess: () => {
      toast.success("Professional profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: doctorKeys.profile() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.dashboard() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile. Please try again.");
    },
  });
}



