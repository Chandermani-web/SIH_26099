export type UserRole = 'ADMIN' | 'CPSE_OFFICER' | 'MATERIAL_EXPERT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cpse: string;
}

export interface CPSE {
  id: string;
  name: string;
  code: string;
  sector: string;
  createdAt: string;
}

export interface ExtractedSpecifications {
  material?: string;
  grade?: string;
  type?: string;
  diameter?: string;
  length?: string;
  size?: string;
  pressureRating?: string;
  schedule?: string;
  standard?: string;
  endConnection?: string;
  additionalAttributes?: Record<string, string>;
}

export type MaterialStatus = 'UNMAPPED' | 'MATCH_PENDING' | 'MAPPED' | 'REVIEW_REQUIRED';

export interface Material {
  id: string;
  cpseId: string;
  cpseCode: string;
  materialCode: string;
  description: string;
  normalizedDescription: string;
  category: string;
  subcategory?: string;
  unit: string;
  manufacturer?: string;
  partNumber?: string;
  specifications: ExtractedSpecifications;
  status: MaterialStatus;
  mappedNationalCode?: string;
  createdAt: string;
}

export type MatchClassificationType =
  | 'IDENTICAL'
  | 'NEAR_DUPLICATE'
  | 'FUNCTIONALLY_EQUIVALENT'
  | 'DIFFERENT_VARIANT'
  | 'DIFFERENT'
  | 'NEEDS_REVIEW';

export type MatchStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';

export interface AttributeComparisonRow {
  attribute: string;
  sourceValue: string;
  candidateValue: string;
  isMatch: boolean;
  notes?: string;
}

export interface MatchExplanation {
  matchType: MatchClassificationType;
  confidence: number;
  whyMatched: string[];
  differences: string[];
  comparisonTable: AttributeComparisonRow[];
  recommendation: string;
  normalizationHighlights: string[];
}

export interface MaterialMatch {
  id: string;
  materialAId: string;
  materialBId: string;
  sourceCode: string;
  candidateCode: string;
  sourceCpse: string;
  candidateCpse: string;
  sourceDescription: string;
  candidateDescription: string;
  sourceSpecs: ExtractedSpecifications;
  candidateSpecs: ExtractedSpecifications;
  semanticScore: number;
  specificationScore: number;
  attributeScore: number;
  metadataScore: number;
  finalScore: number;
  matchType: MatchClassificationType;
  explanation: MatchExplanation;
  status: MatchStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  nationalMaterialCode?: string;
  createdAt: string;
}

export interface NationalMaterial {
  id: string;
  nationalCode: string;
  standardDescription: string;
  category: string;
  subcategory?: string;
  specifications: ExtractedSpecifications;
  status: 'ACTIVE' | 'DEPRECATED';
  mappedCount: number;
  sourceCpseList: string[];
  createdAt: string;
  approvedBy?: string;
}

export interface MaterialMapping {
  id: string;
  nationalCode: string;
  nationalDescription: string;
  category: string;
  materialId: string;
  materialCode: string;
  cpseCode: string;
  originalDescription: string;
  normalizedDescription: string;
  mappingType: 'PRIMARY' | 'EQUIVALENT';
  confidence: number;
  approvedBy: string;
  approvedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalMaterials: number;
  potentialDuplicates: number;
  aiRecommendations: number;
  pendingReviews: number;
  approvedMatches: number;
  nationalMaterialCodes: number;
  materialsByCpse: Array<{ cpse: string; count: number }>;
  matchClassification: Array<{ type: string; count: number }>;
  reviewStatus: Array<{ status: string; count: number }>;
}
