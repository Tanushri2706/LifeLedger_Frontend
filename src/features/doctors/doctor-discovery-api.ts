import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import type {
  PublicDoctorDto,
  DoctorFilterParams,
  DoctorSlotsResponseDto,
  DoctorSlotDto,
  AppointmentTimeSlotDto,
  CreatePatientAppointmentDto,
  PatientAppointmentDto,
} from "./doctor-discovery-types";
import type { PrescriptionDto } from "../doctor/doctor-types";

export { formatTimeSlot } from "@/lib/utils";

/**
 * Parses and validates timeSlot inputs into canonical { start: "HH:mm", end: "HH:mm" } object
 */
export function parseTimeSlot(
  input: string | AppointmentTimeSlotDto | null | undefined
): AppointmentTimeSlotDto {

  if (!input) {
    throw new Error("Appointment time slot is required.");
  }

  if (typeof input === "object" && input !== null) {
    const start = input.start?.trim();
    const end = input.end?.trim();
    if (start && end) {
      return { start, end };
    }
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    // Handles "09:00 - 09:30", "09:00–09:30", "09:00 to 09:30"
    const parts = trimmed.split(/\s*[-–—]\s*|\s+to\s+/i);
    if (parts.length >= 2) {
      const start = parts[0]?.trim();
      const end = parts[1]?.trim();
      if (start && end) {
        return { start, end };
      }
    }
  }

  throw new Error(`Invalid appointment time slot: ${typeof input === "string" ? input : JSON.stringify(input)}`);
}

/**
 * Normalizes user-facing or frontend consultation type strings to backend enum format ("in_person")
 */
export function normalizeConsultationType(type?: string): string {
  if (!type) return "in_person";
  const lower = type.toLowerCase().trim();
  if (lower === "in-person" || lower === "inperson" || lower === "in_person") {
    return "in_person";
  }
  if (lower === "video") return "video";
  if (lower === "audio") return "audio";
  return lower.replace(/-/g, "_");
}

export const doctorDiscoveryApi = {
  /**
   * List doctors with optional search/filters
   */
  getDoctors: async (params?: DoctorFilterParams): Promise<PublicDoctorDto[]> => {
    const query = new URLSearchParams();
    if (params?.search?.trim()) query.append("search", params.search.trim());
    if (params?.specialization && params.specialization !== "all") query.append("specialization", params.specialization);
    if (params?.hospital?.trim()) query.append("hospital", params.hospital.trim());
    if (params?.city && params.city !== "all") query.append("city", params.city.trim());
    if (params?.maxFee && params.maxFee > 0) query.append("maxFee", params.maxFee.toString());

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await http.get<ApiResponse<{ doctors: PublicDoctorDto[] }> | { doctors: PublicDoctorDto[] }>(
      `/doctors${queryString}`
    );

    const raw = res as unknown as Record<string, unknown>;
    const data =
      typeof raw === "object" && raw !== null && "data" in raw && raw.data !== undefined
        ? raw.data
        : raw;

    if (data && typeof data === "object") {
      const rec = data as Record<string, unknown>;
      if ("doctors" in rec && Array.isArray(rec.doctors)) {
        return rec.doctors as PublicDoctorDto[];
      }
      if (Array.isArray(data)) {
        return data as PublicDoctorDto[];
      }
    }
    return [];
  },

  /**
   * Get available specializations
   */
  getSpecializations: async (): Promise<string[]> => {
    try {
      const res = await http.get<ApiResponse<{ specializations: string[] }> | { specializations: string[] }>(
        "/doctors/specializations"
      );
      const raw = res as unknown as Record<string, unknown>;
      const data =
        typeof raw === "object" && raw !== null && "data" in raw && raw.data !== undefined
          ? raw.data
          : raw;

      if (data && typeof data === "object") {
        const rec = data as Record<string, unknown>;
        if ("specializations" in rec && Array.isArray(rec.specializations)) {
          return rec.specializations as string[];
        }
        if (Array.isArray(data)) {
          return data as string[];
        }
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Get public doctor detail by ID
   */
  getDoctorById: async (doctorId: string): Promise<PublicDoctorDto | null> => {
    const res = await http.get<ApiResponse<{ doctor: PublicDoctorDto }> | { doctor: PublicDoctorDto }>(
      `/doctors/${doctorId}`
    );
    const raw = res as unknown as Record<string, unknown>;
    const data =
      typeof raw === "object" && raw !== null && "data" in raw && raw.data !== undefined
        ? raw.data
        : raw;

    if (data && typeof data === "object") {
      const rec = data as Record<string, unknown>;
      if ("doctor" in rec && rec.doctor) {
        return rec.doctor as PublicDoctorDto;
      }
      return data as unknown as PublicDoctorDto;
    }
    return null;
  },

  /**
   * Get real available slots for doctor on a specific date (YYYY-MM-DD)
   * Normalizes backend `isAvailable` -> canonical `available` boolean on each slot
   */
  getDoctorSlots: async (doctorId: string, date: string): Promise<DoctorSlotsResponseDto> => {
    const res = await http.get<ApiResponse<DoctorSlotsResponseDto> | DoctorSlotsResponseDto>(
      `/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`
    );
    const raw = res as unknown as Record<string, unknown>;
    const data =
      typeof raw === "object" && raw !== null && "data" in raw && raw.data !== undefined
        ? raw.data
        : raw;

    let responseObj = data as Record<string, unknown>;
    if (
      responseObj &&
      typeof responseObj === "object" &&
      "data" in responseObj &&
      responseObj.data &&
      typeof responseObj.data === "object"
    ) {
      responseObj = responseObj.data as Record<string, unknown>;
    }

    const rawSlots = Array.isArray(responseObj?.slots) ? responseObj.slots : [];
    const normalizedSlots: DoctorSlotDto[] = rawSlots.map((slot: Record<string, unknown>) => {
      const start = String(slot.start || "").trim();
      const end = String(slot.end || "").trim();
      const isAvailableRaw = slot.isAvailable ?? slot.available;
      const available = typeof isAvailableRaw === "boolean" ? isAvailableRaw : false;

      return {
        start,
        end,
        formatted: typeof slot.formatted === "string" ? slot.formatted : `${start} - ${end}`,
        available,
        isAvailable: available,
        isPast: typeof slot.isPast === "boolean" ? slot.isPast : undefined,
        isBooked: typeof slot.isBooked === "boolean" ? slot.isBooked : undefined,
        reason: typeof slot.reason === "string" ? slot.reason : undefined,
      };
    });

    const totalSlots =
      typeof responseObj?.totalSlots === "number" ? responseObj.totalSlots : normalizedSlots.length;
    const availableSlotsCount =
      typeof responseObj?.availableSlotsCount === "number"
        ? responseObj.availableSlotsCount
        : normalizedSlots.filter((s) => s.available).length;

    return {
      doctorId: String(responseObj?.doctorId || doctorId),
      doctorName: String(responseObj?.doctorName || ""),
      specialization: String(responseObj?.specialization || ""),
      hospital: String(responseObj?.hospital || ""),
      date: String(responseObj?.date || date),
      dayOfWeek: String(responseObj?.dayOfWeek || ""),
      slotDurationMinutes: Number(responseObj?.slotDurationMinutes || 30),
      totalSlots,
      availableSlotsCount,
      slots: normalizedSlots,
    };
  },

  /**
   * Book appointment with normalized timeSlot { start, end } and consultationType ("in_person")
   */
  bookAppointment: async (dto: CreatePatientAppointmentDto): Promise<PatientAppointmentDto> => {
    const timeSlot = parseTimeSlot(dto.timeSlot);
    const consultationType = normalizeConsultationType(dto.consultationType);
    const appointmentDate = dto.appointmentDate || dto.date;

    if (!appointmentDate) {
      throw new Error("Appointment date is required.");
    }

    const payload = {
      doctorId: dto.doctorId,
      appointmentDate,
      timeSlot,
      consultationType,
      hospital: dto.hospital,
      notes: dto.notes || dto.reason || "General Consultation",
    };

    const res = await http.post<ApiResponse<{ appointment: PatientAppointmentDto }> | { appointment: PatientAppointmentDto }>(
      "/appointments",
      payload
    );

    const raw = res as unknown as Record<string, unknown>;
    const data =
      typeof raw === "object" && raw !== null && "data" in raw && raw.data !== undefined
        ? raw.data
        : raw;

    if (data && typeof data === "object") {
      const rec = data as Record<string, unknown>;
      if ("appointment" in rec && rec.appointment) {
        return rec.appointment as PatientAppointmentDto;
      }
      return data as unknown as PatientAppointmentDto;
    }
    return data as unknown as PatientAppointmentDto;
  },

  /**
   * Get prescription for an appointment
   */
  getPrescription: async (appointmentId: string): Promise<PrescriptionDto | null> => {
    try {
      const res = await http.get<ApiResponse<{ prescription: PrescriptionDto }> | { prescription: PrescriptionDto }>(
        `/appointments/${appointmentId}/prescription`
      );
      const raw = res as unknown as Record<string, unknown>;
      const data =
        typeof raw === "object" && raw !== null && "data" in raw && raw.data !== undefined
          ? raw.data
          : raw;

      if (data && typeof data === "object") {
        const rec = data as Record<string, unknown>;
        if ("prescription" in rec && rec.prescription) {
          return rec.prescription as PrescriptionDto;
        }
        return data as unknown as PrescriptionDto;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Get patient appointments
   */
  getPatientAppointments: async (): Promise<PatientAppointmentDto[]> => {
    const res = await http.get<ApiResponse<{ appointments: PatientAppointmentDto[] }> | { appointments: PatientAppointmentDto[] }>(
      "/appointments"
    );

    const raw = res as unknown as Record<string, unknown>;
    const data =
      typeof raw === "object" && raw !== null && "data" in raw && raw.data !== undefined
        ? raw.data
        : raw;

    let list: unknown[] = [];
    if (data && typeof data === "object") {
      const rec = data as Record<string, unknown>;
      if ("appointments" in rec && Array.isArray(rec.appointments)) {
        list = rec.appointments;
      } else if (Array.isArray(data)) {
        list = data;
      }
    }

    return list.map((item) => {
      if (!item || typeof item !== "object") return item as PatientAppointmentDto;
      const apt = item as Record<string, unknown>;
      const id = String(apt.id || apt._id || "");
      const rawDoctor = typeof apt.doctorId === "object" && apt.doctorId !== null
        ? apt.doctorId
        : typeof apt.doctor === "object" && apt.doctor !== null
          ? apt.doctor
          : null;
      const doc = rawDoctor as Record<string, unknown> | null;
      const doctorName =
        (typeof apt.doctorName === "string" && apt.doctorName.trim()) ||
        (doc && typeof doc.name === "string" && doc.name.trim()) ||
        (doc && typeof doc.firstName === "string"
          ? `Dr. ${doc.firstName} ${typeof doc.lastName === "string" ? doc.lastName : ""}`.trim()
          : undefined);

      const referenceNumber =
        typeof apt.referenceNumber === "string" && apt.referenceNumber.trim()
          ? apt.referenceNumber.trim()
          : typeof apt.reference === "string" && apt.reference.trim()
            ? apt.reference.trim()
            : undefined;

      return {
        ...(apt as unknown as PatientAppointmentDto),
        id,
        _id: typeof apt._id === "string" ? apt._id : id,
        doctorName: doctorName || (apt.doctorName as string | undefined),
        referenceNumber,
        reference: referenceNumber,
        appointmentDate: typeof apt.appointmentDate === "string" ? apt.appointmentDate : typeof apt.date === "string" ? apt.date : undefined,
        timeSlot: (apt.timeSlot ?? apt.time) as PatientAppointmentDto["timeSlot"],
      };
    });
  },

  /**
   * Cancel patient appointment
   */
  cancelAppointment: async (appointmentId: string, reason?: string): Promise<void> => {
    try {
      await http.delete(`/appointments/${appointmentId}`, { data: { reason: reason || "Cancelled by patient" } });
    } catch {
      try {
        await http.put(`/appointments/${appointmentId}/cancel`, { reason: reason || "Cancelled by patient" });
      } catch {
        await http.post(`/appointments/${appointmentId}/cancel`, { reason: reason || "Cancelled by patient" });
      }
    }
  },

  /**
   * Reschedule patient appointment with normalized timeSlot { start, end }
   */
  rescheduleAppointment: async (
    appointmentId: string,
    dto: { date?: string; appointmentDate?: string; timeSlot: string | AppointmentTimeSlotDto }
  ): Promise<PatientAppointmentDto> => {
    const timeSlot = parseTimeSlot(dto.timeSlot);
    const appointmentDate = dto.appointmentDate || dto.date;

    if (!appointmentDate) {
      throw new Error("Appointment date is required for rescheduling.");
    }

    const payload = {
      appointmentDate,
      timeSlot,
    };

    const res = await http.put<ApiResponse<{ appointment: PatientAppointmentDto }> | { appointment: PatientAppointmentDto } | PatientAppointmentDto>(
      `/appointments/${appointmentId}`,
      payload
    );

    const raw = res as unknown as Record<string, unknown>;
    const data =
      typeof raw === "object" && raw !== null && "data" in raw && raw.data !== undefined
        ? raw.data
        : raw;

    if (data && typeof data === "object") {
      const rec = data as Record<string, unknown>;
      if ("appointment" in rec && rec.appointment) {
        return rec.appointment as PatientAppointmentDto;
      }
    }

    return data as PatientAppointmentDto;
  },
};
