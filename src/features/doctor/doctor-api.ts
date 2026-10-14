import { http } from "@/lib/api-client";
import type { ApiResponse } from "@/types";
import { formatTimeSlot, getPatientDisplayName } from "@/lib/utils";
import type {
  DoctorDashboardDto,
  DoctorAppointmentItemDto,
  DoctorProfileDto,
  UpdateDoctorProfileDto,
  PrescriptionDto,
  CreatePrescriptionDto,
  DayAvailabilityDto,
  AvailabilitySlotWindowDto,
} from "./doctor-types";

interface DoctorDashboardApiResponse {
  dashboard?: DoctorDashboardDto;
  doctor?: DoctorProfileDto;
  metrics?: {
    todayAppointments?: number;
    upcomingAppointments?: number;
    pendingAppointments?: number;
    completedAppointments?: number;
    totalAppointments?: number;
  };
  appointments?: DoctorAppointmentItemDto[];
  todayAppointments?: DoctorAppointmentItemDto[];
  upcomingAppointments?: DoctorAppointmentItemDto[];
  availability?: {
    slotsCount?: number;
    nextAvailableSlot?: string;
  };
}

interface DoctorAppointmentsApiResponse {
  appointments?: DoctorAppointmentItemDto[];
  count?: number;
}

function normalizeAppointment(raw: unknown): DoctorAppointmentItemDto | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const apt = ("appointment" in obj && obj.appointment && typeof obj.appointment === "object"
    ? obj.appointment
    : obj) as Record<string, unknown>;

  const id = String(apt.id || apt._id || apt.appointmentId || "");
  if (!id) return null;

  const rawPatient = apt.patient && typeof apt.patient === "object"
    ? (apt.patient as Record<string, unknown>)
    : null;

  const patientName =
    (typeof apt.patientName === "string" && apt.patientName.trim()) ||
    (rawPatient ? getPatientDisplayName(rawPatient, "") : "") ||
    (typeof apt.patient === "string" && apt.patient.trim()) ||
    undefined;

  const referenceNumber =
    typeof apt.referenceNumber === "string" && apt.referenceNumber.trim()
      ? apt.referenceNumber.trim()
      : typeof apt.reference === "string" && apt.reference.trim()
        ? apt.reference.trim()
        : undefined;

  const rawSlot = apt.timeSlot ?? apt.time;
  const timeFormatted = formatTimeSlot(rawSlot as Parameters<typeof formatTimeSlot>[0], "");

  return {
    id,
    _id: typeof apt._id === "string" ? apt._id : id,
    appointmentId: id,
    referenceNumber,
    reference: referenceNumber,
    doctorId:
      typeof apt.doctorId === "string"
        ? apt.doctorId
        : typeof (apt.doctor as Record<string, unknown>)?.id === "string"
          ? ((apt.doctor as Record<string, unknown>).id as string)
          : undefined,
    doctorName: typeof apt.doctorName === "string" ? apt.doctorName : undefined,
    patientId:
      typeof apt.patientId === "string"
        ? apt.patientId
        : typeof rawPatient?.id === "string"
          ? (rawPatient.id as string)
          : typeof rawPatient?._id === "string"
            ? (rawPatient._id as string)
            : undefined,
    patientName,
    patientEmail:
      typeof apt.patientEmail === "string"
        ? apt.patientEmail
        : typeof rawPatient?.email === "string"
          ? (rawPatient.email as string)
          : undefined,
    patientPhone:
      typeof apt.patientPhone === "string"
        ? apt.patientPhone
        : typeof rawPatient?.phone === "string"
          ? (rawPatient.phone as string)
          : undefined,
    patientGender:
      typeof apt.patientGender === "string"
        ? apt.patientGender
        : typeof rawPatient?.gender === "string"
          ? (rawPatient.gender as string)
          : undefined,
    patientAge:
      typeof apt.patientAge === "number"
        ? apt.patientAge
        : typeof rawPatient?.age === "number"
          ? (rawPatient.age as number)
          : undefined,
    patientBloodGroup:
      typeof apt.patientBloodGroup === "string"
        ? apt.patientBloodGroup
        : typeof rawPatient?.bloodGroup === "string"
          ? (rawPatient.bloodGroup as string)
          : undefined,
    patient: rawPatient
      ? {
          id: typeof rawPatient.id === "string" ? rawPatient.id : undefined,
          _id: typeof rawPatient._id === "string" ? rawPatient._id : undefined,
          name: typeof rawPatient.name === "string" ? rawPatient.name : undefined,
          fullName: typeof rawPatient.fullName === "string" ? rawPatient.fullName : undefined,
          displayName: typeof rawPatient.displayName === "string" ? rawPatient.displayName : undefined,
          age: typeof rawPatient.age === "number" ? rawPatient.age : undefined,
          gender: typeof rawPatient.gender === "string" ? rawPatient.gender : undefined,
          bloodGroup: typeof rawPatient.bloodGroup === "string" ? rawPatient.bloodGroup : undefined,
          email: typeof rawPatient.email === "string" ? rawPatient.email : undefined,
          phone: typeof rawPatient.phone === "string" ? rawPatient.phone : undefined,
        }
      : undefined,
    hospital: typeof apt.hospital === "string" ? apt.hospital : undefined,
    date: String(apt.date || apt.appointmentDate || ""),
    appointmentDate: typeof apt.appointmentDate === "string" ? apt.appointmentDate : typeof apt.date === "string" ? apt.date : undefined,
    time: timeFormatted || (typeof apt.time === "string" ? apt.time : undefined),
    timeSlot: (rawSlot as DoctorAppointmentItemDto["timeSlot"]) || timeFormatted,
    consultationType: String(apt.consultationType || apt.type || "in_person"),
    status: String(apt.status || "pending"),
    reason: typeof apt.reason === "string" ? apt.reason : undefined,
    notes: typeof apt.notes === "string" ? apt.notes : undefined,
    rejectionReason: typeof apt.rejectionReason === "string" ? apt.rejectionReason : undefined,
    cancellationReason: typeof apt.cancellationReason === "string" ? apt.cancellationReason : undefined,
    hasPrescription: Boolean(apt.hasPrescription || apt.prescriptionId || apt.prescription),
    prescriptionId: typeof apt.prescriptionId === "string" ? apt.prescriptionId : undefined,
    createdAt: typeof apt.createdAt === "string" ? apt.createdAt : undefined,
    updatedAt: typeof apt.updatedAt === "string" ? apt.updatedAt : undefined,
  };
}

function normalizePrescription(raw: unknown): PrescriptionDto | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const presc = ("prescription" in obj && obj.prescription && typeof obj.prescription === "object"
    ? obj.prescription
    : obj) as Record<string, unknown>;

  const appointmentId = String(presc.appointmentId || presc.appointment || "");
  const rawMeds = Array.isArray(presc.medicines) ? presc.medicines : [];
  const medicines = rawMeds.map((m: Record<string, unknown>) => ({
    name: String(m?.name || ""),
    dosage: String(m?.dosage || ""),
    frequency: String(m?.frequency || ""),
    duration: String(m?.duration || ""),
    instructions: typeof m?.instructions === "string" ? m.instructions : undefined,
  }));

  return {
    id: typeof presc.id === "string" ? presc.id : typeof presc._id === "string" ? presc._id : undefined,
    appointmentId,
    doctorId: typeof presc.doctorId === "string" ? presc.doctorId : undefined,
    doctorName: typeof presc.doctorName === "string" ? presc.doctorName : undefined,
    patientId: typeof presc.patientId === "string" ? presc.patientId : undefined,
    patientName: typeof presc.patientName === "string" ? presc.patientName : undefined,
    medicines,
    instructions: typeof presc.instructions === "string" ? presc.instructions : undefined,
    nextVisit: typeof presc.nextVisit === "string" ? presc.nextVisit : undefined,
    createdAt: typeof presc.createdAt === "string" ? presc.createdAt : undefined,
    updatedAt: typeof presc.updatedAt === "string" ? presc.updatedAt : undefined,
  };
}

function normalizeAvailability(raw: unknown): DayAvailabilityDto[] {
  if (!raw) return [];
  const payload =
    typeof raw === "object" && raw !== null && "data" in raw && (raw as Record<string, unknown>).data !== undefined
      ? (raw as Record<string, unknown>).data
      : raw;

  let list: unknown[] = [];
  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.availability)) {
      list = obj.availability;
    } else if (Array.isArray(obj.schedule)) {
      list = obj.schedule;
    } else if (Array.isArray(obj.weeklySchedule)) {
      list = obj.weeklySchedule;
    }
  }

  const result: DayAvailabilityDto[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const dayObj = item as Record<string, unknown>;
    const day = String(dayObj.day || "").toLowerCase().trim();
    if (!day) continue;

    const rawSlots = Array.isArray(dayObj.slots) ? dayObj.slots : [];
    const slots: AvailabilitySlotWindowDto[] = [];

    for (const slot of rawSlots) {
      if (!slot || typeof slot !== "object") continue;
      const s = slot as Record<string, unknown>;
      const start = String(s.start || s.from || "").trim();
      const end = String(s.end || s.to || "").trim();
      if (start && end) {
        slots.push({ start, end });
      }
    }

    result.push({ day, slots });
  }

  return result;
}

export const doctorApi = {
  /**
   * Get doctor dashboard overview and metrics
   */
  getDashboard: async (): Promise<DoctorDashboardDto> => {
    try {
      const res = await http.get<
        ApiResponse<DoctorDashboardApiResponse> | DoctorDashboardApiResponse | DoctorDashboardDto
      >("/doctor/me/dashboard");

      if (!res) {
        throw new Error("Failed to load doctor dashboard");
      }

      const payload = "data" in res && res.data !== undefined ? res.data : res;

      if (!payload || typeof payload !== "object") {
        return {
          metrics: { todayAppointments: 0, upcomingAppointments: 0, pendingAppointments: 0, completedAppointments: 0 },
          todayAppointments: [],
          upcomingAppointments: [],
        };
      }

      if ("dashboard" in payload && payload.dashboard) {
        return payload.dashboard;
      }

      const rawToday = (payload as DoctorDashboardApiResponse).todayAppointments || [];
      const rawUpcoming = (payload as DoctorDashboardApiResponse).upcomingAppointments || [];
      const rawRecent = (payload as DoctorDashboardApiResponse).appointments || [];

      const normalized: DoctorDashboardDto = {
        doctor: ("doctor" in payload ? payload.doctor : undefined) as DoctorProfileDto | undefined,
        metrics: ("metrics" in payload ? payload.metrics : undefined) || {
          todayAppointments: 0,
          upcomingAppointments: 0,
          pendingAppointments: 0,
          completedAppointments: 0,
        },
        todayAppointments: rawToday.map(normalizeAppointment).filter(Boolean) as DoctorAppointmentItemDto[],
        upcomingAppointments: rawUpcoming.map(normalizeAppointment).filter(Boolean) as DoctorAppointmentItemDto[],
        recentAppointments: rawRecent.map(normalizeAppointment).filter(Boolean) as DoctorAppointmentItemDto[],
        availability: (payload as DoctorDashboardApiResponse).availability,
      };

      return normalized;
    } catch {
      return {
        metrics: { todayAppointments: 0, upcomingAppointments: 0, pendingAppointments: 0, completedAppointments: 0 },
        todayAppointments: [],
        upcomingAppointments: [],
      };
    }
  },

  /**
   * Get doctor appointments list
   */
  getAppointments: async (): Promise<DoctorAppointmentItemDto[]> => {
    try {
      const res = await http.get<
        | ApiResponse<DoctorAppointmentsApiResponse | DoctorAppointmentItemDto[]>
        | DoctorAppointmentsApiResponse
        | DoctorAppointmentItemDto[]
      >("/doctor/appointments");

      if (!res) {
        return [];
      }

      const payload = "data" in res && res.data !== undefined ? res.data : res;

      if (Array.isArray(payload)) {
        return payload.map(normalizeAppointment).filter(Boolean) as DoctorAppointmentItemDto[];
      }

      if (payload && typeof payload === "object" && "appointments" in payload && Array.isArray(payload.appointments)) {
        return payload.appointments.map(normalizeAppointment).filter(Boolean) as DoctorAppointmentItemDto[];
      }

      return [];
    } catch {
      return [];
    }
  },

  /**
   * Get single appointment details by ID
   */
  getAppointmentById: async (id: string): Promise<DoctorAppointmentItemDto | null> => {
    try {
      const res = await http.get<ApiResponse<DoctorAppointmentItemDto | { appointment: DoctorAppointmentItemDto }>>(
        `/appointments/${id}`
      );

      if (!res) return null;
      const payload = "data" in res && res.data !== undefined ? res.data : res;
      return normalizeAppointment(payload);
    } catch {
      return null;
    }
  },

  /**
   * Accept a pending appointment
   */
  acceptAppointment: async (id: string): Promise<DoctorAppointmentItemDto> => {
    const res = await http.put<ApiResponse<DoctorAppointmentItemDto | { appointment: DoctorAppointmentItemDto }>>(
      `/appointments/${id}/accept`,
      {}
    );

    const payload = "data" in res && res.data !== undefined ? res.data : res;
    const normalized = normalizeAppointment(payload);
    if (!normalized) {
      throw new Error("Failed to normalize accepted appointment response");
    }
    return normalized;
  },

  /**
   * Reject a pending appointment with reason
   */
  rejectAppointment: async (id: string, reason: string): Promise<DoctorAppointmentItemDto> => {
    const res = await http.put<ApiResponse<DoctorAppointmentItemDto | { appointment: DoctorAppointmentItemDto }>>(
      `/appointments/${id}/reject`,
      { reason }
    );

    const payload = "data" in res && res.data !== undefined ? res.data : res;
    const normalized = normalizeAppointment(payload);
    if (!normalized) {
      throw new Error("Failed to normalize rejected appointment response");
    }
    return normalized;
  },

  /**
   * Mark a confirmed appointment as completed
   */
  completeAppointment: async (id: string): Promise<DoctorAppointmentItemDto> => {
    const res = await http.put<ApiResponse<DoctorAppointmentItemDto | { appointment: DoctorAppointmentItemDto }>>(
      `/appointments/${id}/complete`,
      {}
    );

    const payload = "data" in res && res.data !== undefined ? res.data : res;
    const normalized = normalizeAppointment(payload);
    if (!normalized) {
      throw new Error("Failed to normalize completed appointment response");
    }
    return normalized;
  },

  /**
   * Cancel an appointment (doctor cancellation)
   */
  cancelAppointment: async (id: string, reason?: string): Promise<unknown> => {
    const res = await http.delete<ApiResponse<unknown>>(`/appointments/${id}`, {
      data: reason ? { reason } : undefined,
    });
    return res;
  },

  /**
   * Get prescription for an appointment
   */
  getPrescription: async (appointmentId: string): Promise<PrescriptionDto | null> => {
    try {
      const res = await http.get<ApiResponse<PrescriptionDto | { prescription: PrescriptionDto }>>(
        `/appointments/${appointmentId}/prescription`
      );

      if (!res) return null;
      const payload = "data" in res && res.data !== undefined ? res.data : res;
      return normalizePrescription(payload);
    } catch {
      return null;
    }
  },

  /**
   * Create or update prescription for an appointment
   */
  createPrescription: async (appointmentId: string, dto: CreatePrescriptionDto): Promise<PrescriptionDto> => {
    const res = await http.post<ApiResponse<PrescriptionDto | { prescription: PrescriptionDto }>>(
      `/appointments/${appointmentId}/prescription`,
      dto
    );

    const payload = "data" in res && res.data !== undefined ? res.data : res;
    const normalized = normalizePrescription(payload);
    if (!normalized) {
      throw new Error("Failed to normalize prescription response");
    }
    return normalized;
  },

  /**
   * Get doctor weekly availability schedule
   */
  getAvailability: async (): Promise<DayAvailabilityDto[]> => {
    try {
      const res = await http.get<ApiResponse<unknown> | unknown>("/doctor/availability");
      return normalizeAvailability(res);
    } catch {
      return [];
    }
  },

  /**
   * Update doctor weekly availability schedule
   */
  updateAvailability: async (availability: DayAvailabilityDto[]): Promise<DayAvailabilityDto[]> => {
    const payload = {
      availability: availability.map((d: DayAvailabilityDto) => ({
        day: d.day.toLowerCase().trim(),
        slots: d.slots.map((s: AvailabilitySlotWindowDto) => ({
          start: s.start.trim(),
          end: s.end.trim(),
        })),
      })),
    };

    let res: unknown;
    try {
      res = await http.put<ApiResponse<unknown> | unknown>("/doctor/availability", payload);
    } catch {
      res = await http.post<ApiResponse<unknown> | unknown>("/doctor/availability", payload);
    }

    const normalized = normalizeAvailability(res);
    return normalized.length > 0 ? normalized : availability;
  },

  /**
   * Get doctor profile details
   */
  getProfile: async (): Promise<DoctorProfileDto | null> => {
    try {
      const res = await http.get<
        ApiResponse<{ doctor?: DoctorProfileDto; profile?: DoctorProfileDto }> | { doctor?: DoctorProfileDto }
      >("/doctor/profile");

      if (!res) return null;
      const data = "data" in res && res.data !== undefined ? res.data : res;

      if (data && typeof data === "object") {
        if ("doctor" in data && data.doctor) return data.doctor as DoctorProfileDto;
        if ("profile" in data && data.profile) return data.profile as DoctorProfileDto;
        return data as unknown as DoctorProfileDto;
      }

      return null;
    } catch {
      return null;
    }
  },

  /**
   * Update doctor professional profile
   */
  updateProfile: async (dto: UpdateDoctorProfileDto): Promise<DoctorProfileDto> => {
    let res: unknown;
    try {
      res = await http.put<
        ApiResponse<{ doctor?: DoctorProfileDto; profile?: DoctorProfileDto }> | { doctor?: DoctorProfileDto }
      >("/doctor/profile", dto);
    } catch {
      try {
        res = await http.patch<
          ApiResponse<{ doctor?: DoctorProfileDto; profile?: DoctorProfileDto }> | { doctor?: DoctorProfileDto }
        >("/doctor/me", dto);
      } catch {
        res = await http.put<
          ApiResponse<{ doctor?: DoctorProfileDto; profile?: DoctorProfileDto }> | { doctor?: DoctorProfileDto }
        >("/doctor/me", dto);
      }
    }

    const data =
      typeof res === "object" && res !== null && "data" in res && (res as Record<string, unknown>).data !== undefined
        ? (res as Record<string, unknown>).data
        : res;

    if (data && typeof data === "object") {
      if ("doctor" in data && data.doctor) return data.doctor as DoctorProfileDto;
      if ("profile" in data && data.profile) return data.profile as DoctorProfileDto;
      return data as unknown as DoctorProfileDto;
    }

    throw new Error("Failed to normalize updated doctor profile response");
  },
};



