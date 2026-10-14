import {
  Brain,
  FileText,
  FlaskConical,
  Info,
  Pill,
  ScanLine,
  Syringe,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

/* ---------- medical disclaimer ---------- */

export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <aside
      role="note"
      className={`flex gap-3 rounded-xl border border-primary/20 bg-primary-soft/60 p-4 sm:p-5 ${className}`}
    >
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-card text-primary">
        <Info className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">Medical disclaimer</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          AI analysis is for informational purposes only and is not a medical diagnosis. Reference
          ranges vary between laboratories. Always confirm findings with a registered medical
          practitioner before changing any medicine, dose or treatment.
        </p>
      </div>
    </aside>
  );
}

/* ---------- report categories matching backend ReportCategory ---------- */

export const reportCategories = [
  { id: "all", label: "All records", icon: FileText },
  { id: "blood_report", label: "Blood report", icon: FlaskConical },
  { id: "lab_report", label: "Lab report", icon: FlaskConical },
  { id: "lab_test", label: "Lab test", icon: FlaskConical },
  { id: "imaging_scan", label: "MRI / CT scan", icon: ScanLine },
  { id: "prescription", label: "Prescription", icon: Pill },
  { id: "discharge_summary", label: "Discharge summary", icon: FileText },
  { id: "pathology", label: "Pathology", icon: FlaskConical },
  { id: "vaccination", label: "Vaccination", icon: Syringe },
  { id: "invoice", label: "Invoice", icon: FileText },
  { id: "other", label: "Other", icon: FileText },
] as const;

export type RiskLevel = "low" | "moderate" | "attention";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const map = {
    low: { label: "Low risk", cls: "bg-accent-soft text-accent" },
    moderate: { label: "Moderate risk", cls: "bg-primary-soft text-primary" },
    attention: { label: "Needs attention", cls: "bg-emergency/12 text-emergency" },
  } as const;
  const item = map[level] || map.low;
  return (
    <Badge variant="secondary" className={`gap-1.5 ${item.cls}`}>
      <Brain className="size-3.5" aria-hidden="true" />
      {item.label}
    </Badge>
  );
}

/* ---------- helper formatters ---------- */

export function formatCategoryName(category?: string): string {
  if (!category) return "Medical Record";
  const found = reportCategories.find((c) => c.id === category);
  if (found) return found.label;
  return category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function getCategoryIcon(category?: string) {
  const found = reportCategories.find((c) => c.id === category);
  return found?.icon || FileText;
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return "Recent";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateString);
  }
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
