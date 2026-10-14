export type BackendTimelineEventType =
  | "report_uploaded"
  | "ai_analysis"
  | "diagnosis_recorded"
  | "medication_prescribed"
  | "vital_check"
  | "general";

export type TimelineSourceType = "medical_report" | "ai_analysis" | "manual_record" | "other";

export interface TimelineMetadata {
  category?: string;
  reportType?: string;
  riskLevel?: string;
  healthScore?: number;
  doctor?: string;
  hospital?: string;
  tags?: string[];
  findingsCount?: number;
  extractedValuesCount?: number;
  model?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  [key: string]: unknown;
}

export interface TimelineEventItem {
  id: string;
  eventType: BackendTimelineEventType | string;
  title: string;
  description: string;
  date: string | Date;
  relatedReport?: string;
  sourceType: TimelineSourceType;
  sourceId: string;
  metadata?: TimelineMetadata;
  createdAt: string | Date;
}

export interface TimelinePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimelineResponseData {
  timeline: TimelineEventItem[];
  pagination: TimelinePagination;
}

export interface TimelineSingleEventResponseData {
  event: TimelineEventItem;
}

export interface GetTimelineQueryParams {
  page?: number;
  limit?: number;
  eventType?: BackendTimelineEventType;
  startDate?: string;
  endDate?: string;
  search?: string;
  subjectType?: "user" | "family_member" | string;
  subjectId?: string;
}
