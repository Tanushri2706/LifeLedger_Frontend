/**
 * LifeLedger Health Models & Domain Types
 */

export type RiskLevel = "normal" | "low" | "moderate" | "high";

export interface Abnormality {
  name: string;
  value: string;
  range: string;
  risk: RiskLevel;
  note: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  category: "all" | "blood" | "diabetic" | "imaging" | "thyroid" | "cardiac" | "prescription";
  categoryLabel: string;
  date: string;
  lab: string;
  member: string;
  pages: number;
  size: string;
  score: number;
  risk: RiskLevel;
  summary: string;
  abnormalities: Abnormality[];
  lifestyle: string[];
  diet: string[];
  exercise: string[];
  doctor: {
    name: string;
    speciality: string;
    clinic: string;
    city: string;
    fee: string;
  };
}

export interface PrescriptionMedicine {
  name: string;
  dose: string;
  timing: string;
  duration: string;
}

export interface Prescription {
  id: string;
  doctor: string;
  qualification: string;
  speciality: string;
  hospital: string;
  date: string;
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
  };
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  advice: string[];
  followUp: string;
}

export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  qualification: string;
  experience: number;
  hospital: string;
  area: string;
  distanceKm: number;
  languages: string[];
  rating: number;
  reviews: number;
  fee: number;
  availableToday: boolean;
  verified: boolean;
  about: string;
  focus: string[];
}

export interface Hospital {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  driveMin: number;
  emergency: boolean;
  open: boolean;
  specialities: string[];
  phone: string;
  address: string;
  rating: number;
  image: string;
}

export interface Appointment {
  id: string;
  doctor: string;
  speciality: string;
  hospital: string;
  date: string;
  time: string;
  mode: "In-clinic" | "Video consult";
  fee: number;
  status: "confirmed" | "completed" | "cancelled";
  prescriptionId?: string;
}

export type TimelineEventType = "lab" | "prescription" | "visit" | "vaccination" | "alert" | "insight";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  day: string;
  month: string;
  title: string;
  member: string;
  place: string;
  highlight: string;
  detail: string;
  points: string[];
  reportId?: string;
}
