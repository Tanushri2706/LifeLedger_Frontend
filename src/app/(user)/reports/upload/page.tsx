"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  FlaskConical,
  Image as ImageIcon,
  Loader2,
  Pill,
  ScanLine,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WidgetCard } from "@/components/dashboard/widgets";
import { Reveal } from "@/components/landing/reveal";
import {
  MedicalDisclaimer,
  reportCategories,
  formatFileSize,
} from "@/components/vault/vault-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadReportMutation, type ReportCategory } from "@/features/reports";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit from backend
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp"];

const supportedTypesInfo = [
  { icon: FlaskConical, label: "Lab reports", hint: "CBC, lipid, thyroid, sugar" },
  { icon: Pill, label: "Prescriptions", hint: "Doctor prescriptions & Rx" },
  { icon: ScanLine, label: "MRI & CT scans", hint: "Radiology reports & X-rays" },
  { icon: ImageIcon, label: "Photos", hint: "JPG, PNG, WEBP from camera" },
  { icon: FileText, label: "PDF documents", hint: "Up to 10 MB per file" },
];

export default function UploadReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("blood_report");
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadMutation = useUploadReportMutation();

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const extension = file.name.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setErrorMessage(
        "Unsupported file format. Please upload a PDF, JPG, PNG, or WEBP document."
      );
      toast.error("Unsupported file format.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("File size exceeds 10 MB maximum limit. Please choose a smaller file.");
      toast.error("File exceeds 10 MB limit.");
      return;
    }

    setSelectedFile(file);
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").trim();
      setTitle(cleanName);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setErrorMessage(null);
    setUploadProgress(0);

    try {
      const uploadedReport = await uploadMutation.mutateAsync({
        payload: {
          file: selectedFile,
          title: title.trim() || undefined,
          category: (category as ReportCategory) || "other",
          reportDate: reportDate || undefined,
          hospital: hospital.trim() || undefined,
          doctor: doctor.trim() || undefined,
        },
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
      });

      toast.success("Medical report uploaded successfully.");
      router.push(`/reports/${uploadedReport.id}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to upload medical report. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="pt-6">
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
              <Link href="/reports">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to reports
              </Link>
            </Button>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              AI Health Vault
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Upload a medical report
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Add a PDF, scan, or photo. Your document is securely stored with authenticated access
              and automatically linked to your health ledger.
            </p>
          </div>
        </Reveal>

        <form onSubmit={handleUpload} className="mt-6 space-y-6 pb-6">
          <Reveal>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`surface-calm flex flex-col items-center px-6 py-10 text-center transition-colors sm:py-14 ${
                dragging ? "bg-primary-soft/70 border-primary" : ""
              } ${selectedFile ? "border-primary/40 bg-primary-soft/20" : ""}`}
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                <UploadCloud className="size-7" aria-hidden="true" />
              </span>

              {selectedFile ? (
                <div className="mt-4 flex flex-col items-center">
                  <Badge variant="secondary" className="gap-1.5 bg-accent-soft text-accent">
                    <CheckCircle2 className="size-3.5" />
                    File Selected
                  </Badge>
                  <p className="mt-2 font-display text-base font-semibold">{selectedFile.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)} · {selectedFile.type || "Document"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3 gap-1.5 text-muted-foreground hover:text-destructive"
                    onClick={handleClearFile}
                    disabled={uploadMutation.isPending}
                  >
                    <Trash2 className="size-3.5" />
                    Remove file
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="mt-4 font-display text-lg font-semibold">
                    Drag & drop your report here
                  </h2>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    PDF, JPG, PNG or WEBP — lab tests, prescriptions, MRI and CT scan reports. Up to
                    10 MB per file.
                  </p>
                  <div className="mt-5">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadMutation.isPending}
                    >
                      <UploadCloud className="size-4" aria-hidden="true" />
                      Choose file
                    </Button>
                  </div>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                aria-label="Choose medical report file"
                onChange={handleFileChange}
              />
            </div>
          </Reveal>

          {errorMessage ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          {/* Metadata Fields Card */}
          <Reveal delay={0.04}>
            <WidgetCard title="Report Details" icon={FileText}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Complete Blood Count (CBC) Panel"
                    maxLength={200}
                    disabled={uploadMutation.isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category">Document Category</Label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                    disabled={uploadMutation.isPending}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportCategories
                        .filter((c) => c.id !== "all")
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reportDate">Report Date</Label>
                  <Input
                    id="reportDate"
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    disabled={uploadMutation.isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hospital">Hospital / Diagnostic Lab (Optional)</Label>
                  <Input
                    id="hospital"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="e.g. Dr. Lal PathLabs, Pune"
                    maxLength={100}
                    disabled={uploadMutation.isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doctor">Consulting Doctor (Optional)</Label>
                  <Input
                    id="doctor"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    placeholder="e.g. Dr. Meera Iyer"
                    maxLength={100}
                    disabled={uploadMutation.isPending}
                  />
                </div>
              </div>

              {uploadMutation.isPending ? (
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading document to secure storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              ) : null}

              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={uploadMutation.isPending}
                >
                  <Link href="/reports">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="gap-2"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="size-4" />
                      Save to Vault
                    </>
                  )}
                </Button>
              </div>
            </WidgetCard>
          </Reveal>

          <Reveal delay={0.06}>
            <WidgetCard title="Supported documents" icon={FileText}>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {supportedTypesInfo.map((s) => {
                  const IconComponent = s.icon;
                  return (
                    <li
                      key={s.label}
                      className="flex min-w-0 items-center gap-3 rounded-lg bg-surface p-3"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-card text-primary">
                        <IconComponent className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.label}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.hint}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </WidgetCard>
          </Reveal>

          <Reveal delay={0.08}>
            <MedicalDisclaimer />
          </Reveal>
        </form>
      </div>
    </DashboardShell>
  );
}
