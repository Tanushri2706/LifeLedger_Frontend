export type ReportCategory =
  | "blood_report"
  | "lab_report"
  | "lab_test"
  | "imaging_scan"
  | "prescription"
  | "discharge_summary"
  | "pathology"
  | "invoice"
  | "vaccination"
  | "other";

export type ProcessingStatus = "pending" | "processing" | "completed" | "failed" | "unreadable";

export interface ISubjectContext {
  type: "user" | "family_member";
  id: string;
  displayName?: string;
  relationship?: string;
}

export interface MedicalReportData {
  id: string;
  title: string;
  category: ReportCategory | string;
  reportType?: string;
  hospital?: string;
  doctor?: string;
  reportDate: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileType: string;
  fileSize: number;
  originalFilename: string;
  mimeType: string;
  processingStatus: ProcessingStatus;
  subject?: ISubjectContext;
  createdAt: string;
  updatedAt?: string;
}

export interface ReportsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportsListResponseData {
  reports: MedicalReportData[];
  pagination: ReportsPagination;
}

export interface ReportDetailResponseData {
  report: MedicalReportData;
}

export interface ReportDownloadResponseData {
  downloadUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface UploadReportPayload {
  file: File;
  title?: string;
  category?: ReportCategory | string;
  reportType?: string;
  hospital?: string;
  doctor?: string;
  reportDate?: string;
  subjectType?: "user" | "family_member" | string;
  subjectId?: string;
}

export interface UpdateReportPayload {
  title?: string;
  category?: ReportCategory | string;
  reportType?: string;
  hospital?: string;
  doctor?: string;
  reportDate?: string;
}

export interface GetReportsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  subjectType?: "user" | "family_member" | string;
  subjectId?: string;
}
