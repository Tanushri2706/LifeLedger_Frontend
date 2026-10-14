/**
 * Authentication and User Types matching LifeLedger Backend API Contracts
 */

export type UserRole = "patient" | "doctor" | "admin" | "user";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export interface IEmergencyContact {
  id?: string;
  name?: string;
  relationship?: string;
  phone?: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  name?: string; // computed helper: `${firstName} ${lastName}`
  email: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  profilePhoto?: string;
  avatar?: string;
  avatarUrl?: string;
  gender?: Gender;
  dateOfBirth?: string | Date;
  bloodGroup?: BloodGroup;
  height?: number;
  weight?: number;
  emergencyContact?: IEmergencyContact;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  healthScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorProfileData {
  id: string;
  licenseNumber: string;
  specialization: string;
  experience?: number;
  qualification: string;
  hospital: string;
  consultationFee: number;
  languages?: string[];
  verified?: boolean;
}

export interface DoctorProfile extends UserProfile {
  doctor?: DoctorProfileData;
  licenseNumber?: string;
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  councilRegistrationNumber?: string;
  hospital?: string;
  consultationFee?: number;
  languages?: string[];
  isDoctorVerified?: boolean;
}

export interface AuthResponseData {
  user: UserProfile;
  accessToken?: string;
  doctor?: DoctorProfileData;
}

export interface SignupUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  bloodGroup?: BloodGroup;
  emergencyContact?: IEmergencyContact;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface SignupDoctorDto extends SignupUserDto {
  licenseNumber: string;
  specialization: string;
  experience: number;
  qualification: string;
  hospital: string;
  consultationFee: number;
  languages?: string[];
}

export type AuthPortal = "patient" | "doctor";

export interface LoginDto {
  email: string;
  password: string;
  portal: AuthPortal;
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface ResendOtpDto {
  email: string;
  purpose?: "signup_verification" | "password_reset" | "login_verification" | "email_change";
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthSession {
  user: UserProfile | DoctorProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  portal: AuthPortal;
  role?: "user" | "doctor";
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "user" | "doctor";
  councilNumber?: string;
  speciality?: string;
}
