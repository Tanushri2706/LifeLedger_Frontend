"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { reportsApi, type ReportCategory } from "@/features/reports";
import { familyKeys } from "../family-hooks";
import type { FamilyMemberResponseDto } from "../family-types";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp"];

interface FamilyMemberUploadDialogProps {
  member: FamilyMemberResponseDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FamilyMemberUploadDialog({
  member,
  open,
  onOpenChange,
}: FamilyMemberUploadDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ReportCategory>("blood_report");
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const resetState = () => {
    setSelectedFile(null);
    setTitle("");
    setCategory("blood_report");
    setReportDate(new Date().toISOString().split("T")[0]);
    setHospital("");
    setDoctor("");
    setUploadProgress(0);
    setIsUploading(false);
    setDragging(false);
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Unsupported format. Please upload PDF, JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File size exceeds 10 MB maximum limit.");
      return;
    }
    setSelectedFile(file);
    if (!title.trim()) {
      const clean = file.name.replace(/\.[^/.]+$/, "").trim();
      setTitle(clean);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      await reportsApi.uploadReport(
        {
          file: selectedFile,
          title: title.trim() || selectedFile.name,
          category,
          reportDate,
          hospital: hospital.trim() || undefined,
          doctor: doctor.trim() || undefined,
          subjectType: "family_member",
          subjectId: member.id,
        },
        (percent) => {
          setUploadProgress(percent);
        }
      );

      toast.success(`Medical document uploaded for ${member.displayName}.`);

      // Invalidate ONLY this family member's isolated caches
      queryClient.invalidateQueries({
        queryKey: familyKeys.reports(member.id),
      });
      queryClient.invalidateQueries({
        queryKey: familyKeys.timeline(member.id),
      });
      queryClient.invalidateQueries({
        queryKey: familyKeys.healthIntelligence(member.id),
      });

      onOpenChange(false);
      resetState();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload document.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <UploadCloud className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-lg">Upload Medical Document</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Document will be saved under <strong className="text-foreground">{member.displayName}</strong>&apos;s isolated profile.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* File Dropzone */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border/80 hover:border-border hover:bg-surface/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    validateAndSetFile(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud className="size-8 text-muted-foreground mb-2" />
              <p className="text-xs font-semibold text-foreground">
                Click to upload or drag & drop document
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                PDF, JPG, PNG, WEBP up to 10 MB
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-surface p-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="size-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-xs text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
                className="size-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="upload-title" className="text-xs font-semibold">
                Document Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="upload-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Blood Count (CBC)"
                required
                className="text-xs"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="upload-category" className="text-xs font-semibold">
                  Category
                </Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as ReportCategory)}
                >
                  <SelectTrigger id="upload-category" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood_report" className="text-xs">Blood Report</SelectItem>
                    <SelectItem value="lab_report" className="text-xs">Lab Test / Pathology</SelectItem>
                    <SelectItem value="imaging_scan" className="text-xs">Scan (MRI, CT, X-Ray)</SelectItem>
                    <SelectItem value="prescription" className="text-xs">Prescription</SelectItem>
                    <SelectItem value="discharge_summary" className="text-xs">Discharge Summary</SelectItem>
                    <SelectItem value="other" className="text-xs">Other Medical Record</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="upload-date" className="text-xs font-semibold">
                  Report Date
                </Label>
                <Input
                  id="upload-date"
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="upload-hospital" className="text-xs font-semibold">
                  Hospital / Lab
                </Label>
                <Input
                  id="upload-hospital"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g. Max Healthcare"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="upload-doctor" className="text-xs font-semibold">
                  Consulting Doctor
                </Label>
                <Input
                  id="upload-doctor"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  placeholder="e.g. Dr. A. Sharma"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar during Upload */}
          {isUploading ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Uploading to secure cloud vault...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5" />
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="gap-2 font-semibold"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
