export interface ExtractedLabValue {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  flag?: "LOW" | "HIGH" | "NORMAL" | "ABNORMAL" | string;
  sourceContext?: string;
}

export interface DocumentedMedication {
  name: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
}

export interface PotentialConcern {
  concern: string;
  possibleRelevance: string;
  severity: "low" | "moderate" | "high";
  sourceRef?: string;
}

export interface RiskAssessment {
  level: "low" | "moderate" | "high" | "critical";
  explanation: string;
}

export interface LifestyleGuidance {
  dietSuggestions?: string[];
  exerciseSuggestions?: string[];
  generalTips?: string[];
}

export interface EmergencySignals {
  isEmergency: boolean;
  warningDetails?: string;
  emergencyAdvice?: string;
}

export interface HealthScoreImpact {
  calculatedScore?: number;
  justification?: string;
}

export interface AnalysisMetadata {
  provider?: string;
  model?: string;
  analyzedAt?: string | Date;
  durationMs?: number;
}

export interface StructuredReportAnalysis {
  sourceFacts: {
    extractedValues: ExtractedLabValue[];
    documentedDiagnoses: string[];
    documentedMedications: DocumentedMedication[];
  };
  aiInsights: {
    summary: string;
    keyFindings: string[];
    potentialConcerns: PotentialConcern[];
    riskAssessment: RiskAssessment;
    lifestyleGuidance: LifestyleGuidance;
    questionsForDoctor: string[];
    emergencySignals: EmergencySignals;
  };
  healthScoreImpact: HealthScoreImpact;
  disclaimer: string;
  metadata?: AnalysisMetadata;
}

export type ProcessingStatus = "pending" | "processing" | "completed" | "failed" | "unreadable";

export interface ReportAnalysisResponseData {
  reportId: string;
  title?: string;
  category?: string;
  processingStatus: ProcessingStatus;
  errorMessage?: string;
  analysis: StructuredReportAnalysis | null;
  analyzedAt?: string | Date;
  disclaimer: string;
  isCached?: boolean;
}

export interface AnalyzeReportPayload {
  reportId: string;
  forceReanalyze?: boolean;
}
