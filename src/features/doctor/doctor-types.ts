export type ConsultationType = "in_person" | "video" | "audio";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected";

export interface DoctorProfileDto {
  id: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  hospital?: string;
  consultationFee?: number;
  languages?: string[];
  address?: string;
  city?: string;
  state?: string;
  verified?: boolean;
  avatar?: string;
  profilePhoto?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateDoctorProfileDto {
  specialization?: string;
  qualification?: string;
  experience?: number;
  hospital?: string;
  consultationFee?: number;
  languages?: string[];
  address?: string;
  city?: string;
  state?: string;
}

export interface DoctorAppointmentItemDto {
  id: string;
  _id?: string;
  appointmentId?: string;
  referenceNumber?: string;
  reference?: string;
  doctorId?: string;
  doctorName?: string;
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientGender?: string;
  patientAge?: number;
  patientBloodGroup?: string;
  patient?: {
    id?: string;
    _id?: string;
    name?: string;
    fullName?: string;
    displayName?: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    email?: string;
    phone?: string;
  };
  hospital?: string;
  date: string;
  appointmentDate?: string;
  time?: string;
  timeSlot?: string | { start?: string; end?: string; formatted?: string };
  consultationType: ConsultationType | string;
  status: AppointmentStatus | string;
  reason?: string;
  notes?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  hasPrescription?: boolean;
  prescriptionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrescriptionMedicineDto {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionDto {
  id?: string;
  appointmentId: string;
  doctorId?: string;
  doctorName?: string;
  patientId?: string;
  patientName?: string;
  medicines: PrescriptionMedicineDto[];
  instructions?: string;
  nextVisit?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePrescriptionDto {
  medicines: PrescriptionMedicineDto[];
  instructions?: string;
  nextVisit?: string;
}

export interface DoctorDashboardMetricsDto {
  todayAppointments?: number;
  upcomingAppointments?: number;
  pendingAppointments?: number;
  completedAppointments?: number;
  totalAppointments?: number;
}

export interface DoctorDashboardDto {
  doctor?: DoctorProfileDto;
  metrics?: DoctorDashboardMetricsDto;
  todayAppointments?: DoctorAppointmentItemDto[];
  upcomingAppointments?: DoctorAppointmentItemDto[];
  recentAppointments?: DoctorAppointmentItemDto[];
  availability?: {
    slotsCount?: number;
    nextAvailableSlot?: string;
    weeklySchedule?: Array<{ day: string; isAvailable: boolean; slots?: string[] }>;
  };
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export interface AvailabilitySlotWindowDto {
  start: string; // "09:00"
  end: string;   // "13:00"
}

export interface DayAvailabilityDto {
  day: DayOfWeek | string;
  slots: AvailabilitySlotWindowDto[];
}

export interface DoctorAvailabilityDto {
  availability: DayAvailabilityDto[];
}


