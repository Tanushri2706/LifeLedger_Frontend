export type TrendDirection =
  | "increasing"
  | "decreasing"
  | "stable"
  | "insufficient_data";

export type HealthIntelligenceStatus =
  | "available"
  | "no_reports"
  | "no_analyzed_reports"
  | "partial_data";

export type CoverageAssessment =
  | "no_reports"
  | "no_analyzed_reports"
  | "partial_coverage"
  | "comprehensive";

export interface NormalizedObservation {
  reportId: string;
  reportDate: string | Date;
  testName: string;
  rawValue: string;
  numericValue: number | null;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  flag?: string;
  sourceContext?: string;
  resolutionContext?: string;
}

export interface HistoricalFindingItem {
  reportId?: string;
  reportDate?: string | Date;
  testName?: string;
  finding?: string;
  rawValue?: string;
  numericValue?: number | null;
  unit?: string;
  referenceRange?: string;
  flag?: string;
  resolutionContext?: string;
  category?: string;
  sourceContext?: string;
  notes?: string;
}

export interface LongitudinalTrend {
  markerKey: string;
  displayName: string;
  unit: string;
  direction: TrendDirection;
  changeValue: number | null;
  changePercent: number | null;
  observations: NormalizedObservation[];
  baselineValue: number | null;
  latestValue: number | null;
  firstObservedDate: string | Date;
  latestObservedDate: string | Date;
}

export interface CoverageSummary {
  totalReports: number;
  analyzedReports: number;
  unreadableReports: number;
  pendingReports: number;
  failedReports: number;
  firstReportDate?: string | Date;
  latestReportDate?: string | Date;
  coverageAssessment: CoverageAssessment;
  limitations: string[];
}

export interface GeneralWellnessGuidance {
  nutritionNotes: string[];
  activityNotes: string[];
  lifestyleNotes: string[];
}

export interface UrgentSignals {
  hasUrgentConcern: boolean;
  urgencyLevel?: "urgent" | "moderate" | "low" | "historical_finding" | "none" | string;
  details?: string | null;
}

export interface AggregateHealthSynthesis {
  overview: string;
  keyObservations: string[];
  currentObservations?: string[];
  historicalFindings?: (string | HistoricalFindingItem)[];
  changesOverTime: string[];
  areasToDiscussWithDoctor: string[];
  generalWellnessGuidance: GeneralWellnessGuidance;
  urgentSignals: UrgentSignals;
  disclaimer: string;
}

export interface DocumentedMedication {
  name: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
}

export interface AggregateHealthIntelligenceData {
  status: HealthIntelligenceStatus;
  coverage: CoverageSummary;
  latestObservations?: NormalizedObservation[];
  currentObservations?: NormalizedObservation[] | string[];
  currentFlaggedMarkers?: NormalizedObservation[];
  historicalFlaggedMarkers?: (NormalizedObservation | HistoricalFindingItem)[];
  historicalFindings?: (string | HistoricalFindingItem)[];
  abnormalMarkers?: NormalizedObservation[];
  longitudinalTrends: LongitudinalTrend[];
  documentedDiagnoses?: string[];
  currentDiagnoses?: string[];
  historicalDiagnoses?: string[];
  activeMedications: DocumentedMedication[];
  latestMarkersSummary?: Record<string, unknown>;
  aggregateHealthScore: number | null;
  aggregateHealthScoreReason: string;
  aiSynthesis: AggregateHealthSynthesis | null;
  isCached: boolean;
  generatedAt: string | Date;
  disclaimer: string;
}

export interface GetHealthIntelligenceQueryParams {
  forceRefresh?: boolean;
  subjectType?: "user" | "family_member" | string;
  subjectId?: string;
}
