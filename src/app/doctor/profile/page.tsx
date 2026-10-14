"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Building2,
  Check,
  GraduationCap,
  Languages as LanguagesIcon,
  Lock,
  Mail,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Stethoscope,
  User,
  Wallet,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { DoctorPageHeader, DoctorShell } from "@/components/doctor/doctor-shell";
import { WidgetCard } from "@/components/dashboard/widgets";
import { Reveal } from "@/components/landing/reveal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  useDoctorDashboardQuery,
  useDoctorProfileQuery,
  useUpdateDoctorProfileMutation,
} from "@/features/doctor";
import type { UpdateDoctorProfileDto } from "@/features/doctor";
import { toast } from "sonner";

const COMMON_SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "Gynecology",
  "Psychiatry",
  "Ophthalmology",
  "ENT",
  "Pulmonology",
  "Endocrinology",
];

const COMMON_LANGUAGES = [
  "English",
  "Hindi",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
];

interface FormState {
  specialization: string;
  qualification: string;
  experience: string;
  consultationFee: string;
  hospital: string;
  address: string;
  city: string;
  state: string;
  languages: string[];
}

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const { data: profileData, isLoading: isProfileLoading } = useDoctorProfileQuery();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDoctorDashboardQuery();
  const updateProfileMutation = useUpdateDoctorProfileMutation();

  const isLoading = isProfileLoading && isDashboardLoading;
  const doctor = profileData || dashboardData?.doctor;

  // Account identity
  const doctorName =
    doctor?.fullName ||
    (doctor?.firstName ? `Dr. ${doctor.firstName} ${doctor.lastName || ""}`.trim() : null) ||
    (user?.fullName ? `Dr. ${user.fullName}` : null) ||
    "Doctor";

  const doctorEmail = user?.email || doctor?.email || "No email on record";

  const initials =
    doctorName
      .replace(/^Dr\.\s*/i, "")
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "DR";

  // Registered medical license (read-only credential)
  const licenseNumber = doctor?.licenseNumber || "";

  // Local form state
  const [form, setForm] = useState<FormState>({
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    hospital: "",
    address: "",
    city: "",
    state: "",
    languages: ["English", "Hindi"],
  });

  const [newLanguageInput, setNewLanguageInput] = useState("");
  const [isInitialHydrated, setIsInitialHydrated] = useState(false);

  // Hydrate form when doctor data loads
  useEffect(() => {
    if (doctor && !isInitialHydrated) {
      setForm({
        specialization: doctor.specialization || "",
        qualification: doctor.qualification || "",
        experience:
          typeof doctor.experience === "number"
            ? doctor.experience.toString()
            : "",
        consultationFee:
          typeof doctor.consultationFee === "number"
            ? doctor.consultationFee.toString()
            : "",
        hospital: doctor.hospital || "",
        address: doctor.address || "",
        city: doctor.city || "",
        state: doctor.state || "",
        languages:
          Array.isArray(doctor.languages) && doctor.languages.length > 0
            ? [...doctor.languages]
            : ["English", "Hindi"],
      });
      setIsInitialHydrated(true);
    }
  }, [doctor, isInitialHydrated]);

  // Initial server state for dirty comparison
  const serverState = useMemo<FormState>(() => {
    if (!doctor) {
      return {
        specialization: "",
        qualification: "",
        experience: "",
        consultationFee: "",
        hospital: "",
        address: "",
        city: "",
        state: "",
        languages: ["English", "Hindi"],
      };
    }
    return {
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      experience:
        typeof doctor.experience === "number"
          ? doctor.experience.toString()
          : "",
      consultationFee:
        typeof doctor.consultationFee === "number"
          ? doctor.consultationFee.toString()
          : "",
      hospital: doctor.hospital || "",
      address: doctor.address || "",
      city: doctor.city || "",
      state: doctor.state || "",
      languages:
        Array.isArray(doctor.languages) && doctor.languages.length > 0
          ? [...doctor.languages]
          : ["English", "Hindi"],
    };
  }, [doctor]);

  // Check if dirty
  const isDirty = useMemo(() => {
    return (
      form.specialization !== serverState.specialization ||
      form.qualification !== serverState.qualification ||
      form.experience !== serverState.experience ||
      form.consultationFee !== serverState.consultationFee ||
      form.hospital !== serverState.hospital ||
      form.address !== serverState.address ||
      form.city !== serverState.city ||
      form.state !== serverState.state ||
      JSON.stringify(form.languages) !== JSON.stringify(serverState.languages)
    );
  }, [form, serverState]);

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!form.specialization.trim()) {
      errs.specialization = "Specialization is required.";
    }

    if (!form.qualification.trim()) {
      errs.qualification = "Qualification is required.";
    }

    if (form.experience.trim() !== "") {
      const exp = Number(form.experience);
      if (isNaN(exp) || exp < 0 || exp > 70) {
        errs.experience = "Experience must be between 0 and 70 years.";
      }
    }

    if (form.consultationFee.trim() !== "") {
      const fee = Number(form.consultationFee);
      if (isNaN(fee) || fee < 0) {
        errs.consultationFee = "Consultation fee must be 0 or greater.";
      }
    }

    return errs;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  // Language management
  const handleAddLanguage = (langToAdd?: string) => {
    const raw = langToAdd !== undefined ? langToAdd : newLanguageInput;
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Support comma-separated batch input
    const parts = trimmed
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const updated = [...form.languages];
    for (const part of parts) {
      if (!updated.some((l) => l.toLowerCase() === part.toLowerCase())) {
        updated.push(part);
      }
    }

    setForm((prev) => ({ ...prev, languages: updated }));
    if (langToAdd === undefined) {
      setNewLanguageInput("");
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== langToRemove),
    }));
  };

  const handleDiscard = () => {
    setForm(serverState);
    setNewLanguageInput("");
    toast.info("Changes discarded.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error("Please resolve validation errors before saving.");
      return;
    }

    const payload: UpdateDoctorProfileDto = {
      specialization: form.specialization.trim(),
      qualification: form.qualification.trim(),
      experience:
        form.experience.trim() !== "" ? Number(form.experience) : undefined,
      consultationFee:
        form.consultationFee.trim() !== ""
          ? Number(form.consultationFee)
          : undefined,
      hospital: form.hospital.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      languages: form.languages.filter(Boolean),
    };

    updateProfileMutation.mutate(payload);
  };

  return (
    <DoctorShell>
      <Reveal>
        <DoctorPageHeader
          title="Doctor Profile"
          subtitle="Manage your professional credentials, practice details, and consultation preferences."
        />
      </Reveal>

      {isLoading ? (
        <div className="mt-6 space-y-6">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Top Identity & Credentials Card */}
          <Reveal delay={0.05}>
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 font-display text-xl font-bold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                        {doctorName}
                      </h2>
                      <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/5 text-primary text-xs font-medium gap-1"
                      >
                        <ShieldCheck className="size-3 text-primary" />
                        Medical Practitioner
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{doctorEmail}</span>
                    </div>
                  </div>
                </div>

                {licenseNumber ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface/50 p-3.5 sm:max-w-xs">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Lock className="size-4" />
                    </div>
                    <div className="min-w-0 text-xs">
                      <p className="font-medium text-muted-foreground">License Registration</p>
                      <p className="font-mono font-semibold text-foreground truncate">
                        {licenseNumber}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 border-t border-border/60 pt-4 text-xs text-muted-foreground flex items-center gap-2">
                <User className="size-3.5 shrink-0 text-muted-foreground" />
                <span>
                  Account identity (name, email) is managed via your secure account settings.
                </span>
              </div>
            </div>
          </Reveal>

          {/* Main Form Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Columns: Professional & Practice Details */}
            <div className="space-y-6 lg:col-span-2">
              {/* Section 1: Professional Details */}
              <Reveal delay={0.1}>
                <WidgetCard title="Professional Details" icon={GraduationCap}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-xs font-semibold text-foreground">
                        Specialization <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="specialization"
                        value={form.specialization}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, specialization: e.target.value }))
                        }
                        placeholder="e.g. Cardiology, General Medicine"
                        className={errors.specialization ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {errors.specialization ? (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="size-3 shrink-0" />
                          {errors.specialization}
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {COMMON_SPECIALIZATIONS.slice(0, 4).map((spec) => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({ ...prev, specialization: spec }))
                              }
                              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                form.specialization === spec
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-surface text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              {spec}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qualification" className="text-xs font-semibold text-foreground">
                        Medical Qualifications <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="qualification"
                        value={form.qualification}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, qualification: e.target.value }))
                        }
                        placeholder="e.g. MBBS, MD, MS, DNB"
                        className={errors.qualification ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {errors.qualification ? (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="size-3 shrink-0" />
                          {errors.qualification}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">
                          Degrees and credentials from recognized medical institutions.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="experience" className="text-xs font-semibold text-foreground">
                        Years of Experience
                      </Label>
                      <div className="relative max-w-xs">
                        <Input
                          id="experience"
                          type="number"
                          min={0}
                          max={70}
                          step={1}
                          value={form.experience}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, experience: e.target.value }))
                          }
                          placeholder="e.g. 10"
                          className={errors.experience ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          Years
                        </span>
                      </div>
                      {errors.experience ? (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="size-3 shrink-0" />
                          {errors.experience}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">
                          Total years of active clinical practice (0 to 70).
                        </p>
                      )}
                    </div>
                  </div>
                </WidgetCard>
              </Reveal>

              {/* Section 2: Practice & Consultation Details */}
              <Reveal delay={0.15}>
                <WidgetCard title="Practice Details" icon={Stethoscope}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hospital" className="text-xs font-semibold text-foreground">
                        Hospital / Clinic Name
                      </Label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="hospital"
                          value={form.hospital}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, hospital: e.target.value }))
                          }
                          placeholder="e.g. Apollo Hospital, City Clinic"
                          className="pl-9"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Primary hospital affiliation or clinical practice name.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultationFee" className="text-xs font-semibold text-foreground">
                        Consultation Fee (₹)
                      </Label>
                      <div className="relative">
                        <Wallet className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="consultationFee"
                          type="number"
                          min={0}
                          step={50}
                          value={form.consultationFee}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, consultationFee: e.target.value }))
                          }
                          placeholder="e.g. 500"
                          className={`pl-9 ${errors.consultationFee ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                      </div>
                      {errors.consultationFee ? (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="size-3 shrink-0" />
                          {errors.consultationFee}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">
                          Standard fee per consultation slot presented to patients.
                        </p>
                      )}
                    </div>

                    {/* Languages Editor */}
                    <div className="space-y-3 sm:col-span-2 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <LanguagesIcon className="size-3.5 text-primary" />
                          Languages Spoken
                        </Label>
                        <span className="text-[11px] text-muted-foreground">
                          {form.languages.length} selected
                        </span>
                      </div>

                      {/* Active Languages Tags */}
                      <div className="flex flex-wrap gap-2 min-h-[38px] p-2 rounded-xl border border-border/70 bg-surface/40">
                        {form.languages.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic py-1 px-2">
                            No languages specified. Add languages below.
                          </span>
                        ) : (
                          form.languages.map((lang) => (
                            <Badge
                              key={lang}
                              variant="secondary"
                              className="gap-1.5 px-2.5 py-1 text-xs font-medium bg-card border border-border/80 shadow-2xs"
                            >
                              <span>{lang}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveLanguage(lang)}
                                className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                aria-label={`Remove ${lang}`}
                              >
                                <X className="size-3" />
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>

                      {/* Add Language Input */}
                      <div className="flex gap-2">
                        <Input
                          value={newLanguageInput}
                          onChange={(e) => setNewLanguageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              handleAddLanguage();
                            }
                          }}
                          placeholder="Type a language (e.g. English, Hindi, Tamil) and press Enter"
                          className="text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddLanguage()}
                          disabled={!newLanguageInput.trim()}
                          className="shrink-0 gap-1 text-xs"
                        >
                          <Plus className="size-3.5" />
                          Add
                        </Button>
                      </div>

                      {/* Common Suggestions */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-muted-foreground mr-1">Quick add:</span>
                        {COMMON_LANGUAGES.map((lang) => {
                          const isSelected = form.languages.some(
                            (l) => l.toLowerCase() === lang.toLowerCase()
                          );
                          if (isSelected) return null;
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => handleAddLanguage(lang)}
                              className="rounded-md border border-border/60 bg-surface px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                            >
                              + {lang}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </WidgetCard>
              </Reveal>

              {/* Section 3: Practice Location */}
              <Reveal delay={0.2}>
                <WidgetCard title="Practice Location" icon={MapPin}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address" className="text-xs font-semibold text-foreground">
                        Clinic / Hospital Address
                      </Label>
                      <Input
                        id="address"
                        value={form.address}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, address: e.target.value }))
                        }
                        placeholder="e.g. 104 Medical Enclave, Ring Road"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Physical address where consultations or in-person visits occur.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs font-semibold text-foreground">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, city: e.target.value }))
                        }
                        placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-xs font-semibold text-foreground">
                        State / Province
                      </Label>
                      <Input
                        id="state"
                        value={form.state}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, state: e.target.value }))
                        }
                        placeholder="e.g. Maharashtra, Karnataka, Delhi"
                      />
                    </div>
                  </div>
                </WidgetCard>
              </Reveal>
            </div>

            {/* Right Column: Credentials & Regulatory Guidelines */}
            <div className="space-y-6">
              {/* Credentials & Medical License Info */}
              <Reveal delay={0.1}>
                <WidgetCard title="Credentials & Registration" icon={ShieldCheck}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Medical License Number</span>
                        <Badge variant="outline" className="text-[10px] font-mono gap-1 text-muted-foreground">
                          <Lock className="size-2.5" />
                          Read-Only
                        </Badge>
                      </Label>
                      <div className="relative">
                        <Input
                          value={licenseNumber || "Not recorded"}
                          readOnly
                          disabled
                          className="bg-muted/40 font-mono text-xs cursor-not-allowed select-all"
                        />
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        License number registered with your professional profile. For regulatory compliance and patient trust, medical registration credentials cannot be changed directly in self-service mode.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 space-y-2.5 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-primary shrink-0" />
                        Professional Compliance
                      </p>
                      <p className="leading-relaxed text-[11px]">
                        Your clinical specialization and qualifications are visible on digital prescriptions and appointment confirmations. Keep this information accurate.
                      </p>
                    </div>
                  </div>
                </WidgetCard>
              </Reveal>

              {/* Consultation Fee Transparency */}
              <Reveal delay={0.15}>
                <WidgetCard title="Practice Transparency" icon={Wallet}>
                  <ul className="space-y-3 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span>
                        Consultation fees are displayed transparently before appointment booking.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span>
                        Working hours and appointment availability can be customized under Working Hours.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span>
                        Patient health timeline records remain strictly protected under medical confidentiality.
                      </span>
                    </li>
                  </ul>
                </WidgetCard>
              </Reveal>
            </div>
          </div>

          {/* Form Action Bar */}
          <Reveal delay={0.25}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isDirty ? (
                  <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                    You have unsaved changes
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <Check className="size-3.5 text-emerald-600" />
                    All changes saved
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDiscard}
                  disabled={!isDirty || updateProfileMutation.isPending}
                  className="flex-1 sm:flex-none text-xs gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  Discard
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={!isDirty || !isValid || updateProfileMutation.isPending}
                  className="flex-1 sm:flex-none text-xs gap-1.5 font-semibold"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Reveal>
        </form>
      )}
    </DoctorShell>
  );
}
