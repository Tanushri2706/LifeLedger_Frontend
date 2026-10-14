export interface PublicDoctorDto {
  id: string;
  userId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  specialization: string;
  qualification: string;
  experience?: number;
  hospital?: string;
  consultationFee?: number;
  languages?: string[];
  address?: string;
  city?: string;
  state?: string;
  availability?: {
    day: string;
    isAvailable: boolean;
    slots?: { start: string; end: string }[];
  }[];
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  createdAt?: string;
}

export interface DoctorFilterParams {
  search?: string;
  specialization?: string;
  hospital?: string;
  city?: string;
  maxFee?: number;
}

export interface AppointmentTimeSlotDto {
  start: string;
  end: string;
}

export interface DoctorSlotDto {
  start: string;
  end: string;
  formatted?: string;
  available?: boolean;
  isAvailable?: boolean;
  isPast?: boolean;
  isBooked?: boolean;
  reason?: string;
}

export interface DoctorSlotsResponseDto {
  doctorId: string;
  doctorName: string;
  specialization: string;
  hospital: string;
  date: string;
  dayOfWeek: string;
  slotDurationMinutes: number;
  totalSlots: number;
  availableSlotsCount: number;
  slots: DoctorSlotDto[];
}

export interface CreatePatientAppointmentDto {
  doctorId: string;
  date?: string;
  appointmentDate?: string;
  timeSlot: string | AppointmentTimeSlotDto;
  consultationType?: string;
  hospital?: string;
  reason?: string;
  notes?: string;
}

export interface PatientAppointmentDto {
  id: string;
  _id?: string;
  referenceNumber?: string;
  reference?: string;
  doctorId:
    | string
    | {
        id?: string;
        _id?: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        specialization?: string;
        qualification?: string;
        hospital?: string;
        consultationFee?: number;
      };
  patientId?: string;
  patientName?: string;
  patient?: {
    name?: string;
    fullName?: string;
    displayName?: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
  };
  doctorName?: string;
  specialization?: string;
  hospital?: string;
  date?: string;
  appointmentDate?: string;
  time?: string;
  timeSlot: string | AppointmentTimeSlotDto;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
  consultationType?: string;
  reason?: string;
  notes?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  hasPrescription?: boolean;
  prescriptionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

