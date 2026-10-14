import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TimeSlotInput =
  | string
  | { start?: string; end?: string; formatted?: string }
  | null
  | undefined;

/**
 * Safely format an appointment timeSlot into a user-facing string (e.g. "09:00 - 09:30")
 * Prevents "Objects are not valid as a React child" errors when backend returns { start, end }
 */
export function formatTimeSlot(
  timeSlot: TimeSlotInput,
  fallback: string = "Scheduled Slot"
): string {
  if (!timeSlot) return fallback;
  if (typeof timeSlot === "string") {
    const trimmed = timeSlot.trim();
    return trimmed || fallback;
  }
  if (typeof timeSlot === "object" && timeSlot !== null) {
    if (typeof timeSlot.formatted === "string" && timeSlot.formatted.trim()) {
      return timeSlot.formatted.trim();
    }
    const start = timeSlot.start?.trim();
    const end = timeSlot.end?.trim();
    if (start && end) {
      return `${start} - ${end}`;
    }
    if (start) return start;
    if (end) return end;
  }
  return fallback;
}

/**
 * Safely extracts a display name from a patient field (which may be a string or object)
 */
export function getPatientDisplayName(
  patient: unknown,
  fallback: string = "Patient"
): string {
  if (!patient) return fallback;
  if (typeof patient === "string") {
    const trimmed = patient.trim();
    return trimmed || fallback;
  }
  if (typeof patient === "object" && patient !== null) {
    const obj = patient as Record<string, unknown>;
    const name =
      (typeof obj.displayName === "string" && obj.displayName.trim()) ||
      (typeof obj.fullName === "string" && obj.fullName.trim()) ||
      (typeof obj.name === "string" && obj.name.trim()) ||
      (typeof obj.firstName === "string" &&
        `${obj.firstName} ${typeof obj.lastName === "string" ? obj.lastName : ""}`.trim());
    if (name) return name;
  }
  return fallback;
}

/**
 * Safely extracts a display name from a doctor field (which may be a string or object)
 */
export function getDoctorDisplayName(
  doctor: unknown,
  fallback: string = "Doctor"
): string {
  if (!doctor) return fallback;
  if (typeof doctor === "string") {
    const trimmed = doctor.trim();
    return trimmed || fallback;
  }
  if (typeof doctor === "object" && doctor !== null) {
    const obj = doctor as Record<string, unknown>;
    const name =
      (typeof obj.displayName === "string" && obj.displayName.trim()) ||
      (typeof obj.fullName === "string" && obj.fullName.trim()) ||
      (typeof obj.name === "string" && obj.name.trim()) ||
      (typeof obj.firstName === "string" &&
        `Dr. ${obj.firstName} ${typeof obj.lastName === "string" ? obj.lastName : ""}`.trim());
    if (name) return name;
  }
  return fallback;
}

