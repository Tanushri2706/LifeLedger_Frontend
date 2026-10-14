import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { doctorDiscoveryApi } from "./doctor-discovery-api";
import type {
  CreatePatientAppointmentDto,
  DoctorFilterParams,
  AppointmentTimeSlotDto,
} from "./doctor-discovery-types";
import { useAuth } from "@/hooks/use-auth";

export const patientDoctorKeys = {
  all: ["patient-doctors"] as const,
  list: (params?: DoctorFilterParams) => [...patientDoctorKeys.all, "list", params] as const,
  specializations: () => [...patientDoctorKeys.all, "specializations"] as const,
  detail: (doctorId: string) => [...patientDoctorKeys.all, "detail", doctorId] as const,
  slots: (doctorId: string, date: string) => [...patientDoctorKeys.all, "slots", doctorId, date] as const,
  appointments: () => ["patient", "appointments"] as const,
};

export function useDoctorsQuery(params?: DoctorFilterParams) {
  return useQuery({
    queryKey: patientDoctorKeys.list(params),
    queryFn: async () => {
      return doctorDiscoveryApi.getDoctors(params);
    },
    staleTime: 60 * 1000,
  });
}

export function useDoctorSpecializationsQuery() {
  return useQuery({
    queryKey: patientDoctorKeys.specializations(),
    queryFn: async () => {
      return doctorDiscoveryApi.getSpecializations();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDoctorPublicDetailQuery(doctorId: string | null | undefined) {
  return useQuery({
    queryKey: patientDoctorKeys.detail(doctorId || ""),
    queryFn: async () => {
      if (!doctorId) return null;
      return doctorDiscoveryApi.getDoctorById(doctorId);
    },
    enabled: Boolean(doctorId),
    staleTime: 60 * 1000,
  });
}

export function useDoctorSlotsQuery(doctorId: string | null | undefined, date: string) {
  return useQuery({
    queryKey: patientDoctorKeys.slots(doctorId || "", date),
    queryFn: async () => {
      if (!doctorId || !date) return null;
      return doctorDiscoveryApi.getDoctorSlots(doctorId, date);
    },
    enabled: Boolean(doctorId && date),
    staleTime: 15 * 1000,
  });
}

export function usePatientAppointmentsQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: patientDoctorKeys.appointments(),
    queryFn: async () => {
      return doctorDiscoveryApi.getPatientAppointments();
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useBookAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePatientAppointmentDto) => {
      return doctorDiscoveryApi.bookAppointment(dto);
    },
    onSuccess: (_, variables) => {
      toast.success("Appointment request placed successfully.");
      queryClient.invalidateQueries({ queryKey: patientDoctorKeys.appointments() });
      if (variables.doctorId && (variables.appointmentDate || variables.date)) {
        queryClient.invalidateQueries({
          queryKey: patientDoctorKeys.slots(
            variables.doctorId,
            variables.appointmentDate || variables.date || ""
          ),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: Error, variables) => {
      const msg = error.message || "";
      if (msg.includes("409") || msg.toLowerCase().includes("slot") || msg.toLowerCase().includes("conflict") || msg.toLowerCase().includes("booked")) {
        toast.error("This time slot is no longer available. Please select another slot.");
      } else {
        toast.error(msg || "Failed to book appointment. Please try again.");
      }
      if (variables.doctorId && (variables.appointmentDate || variables.date)) {
        queryClient.invalidateQueries({
          queryKey: patientDoctorKeys.slots(
            variables.doctorId,
            variables.appointmentDate || variables.date || ""
          ),
        });
      }
    },
  });
}

export function useCancelPatientAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, reason }: { appointmentId: string; reason?: string }) => {
      return doctorDiscoveryApi.cancelAppointment(appointmentId, reason);
    },
    onSuccess: () => {
      toast.success("Appointment cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: patientDoctorKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ["patient-doctors", "slots"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel appointment. Please try again.");
    },
  });
}

export function useReschedulePatientAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      date,
      timeSlot,
    }: {
      appointmentId: string;
      date: string;
      timeSlot: string | AppointmentTimeSlotDto;
    }) => {
      return doctorDiscoveryApi.rescheduleAppointment(appointmentId, { date, timeSlot });
    },
    onSuccess: () => {
      toast.success("Appointment rescheduled successfully.");
      queryClient.invalidateQueries({ queryKey: patientDoctorKeys.appointments() });
      queryClient.invalidateQueries({ queryKey: ["patient-doctors", "slots"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reschedule appointment. Please try again.");
    },
  });
}

export function usePatientPrescriptionQuery(appointmentId: string | null | undefined) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["patient", "prescription", appointmentId || ""],
    queryFn: async () => {
      if (!appointmentId) return null;
      return doctorDiscoveryApi.getPrescription(appointmentId);
    },
    enabled: Boolean(isAuthenticated && appointmentId),
    staleTime: 60 * 1000,
  });
}

