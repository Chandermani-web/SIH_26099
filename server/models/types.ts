import { ExtractedSpecifications } from '../ai/specificationExtractor';
import { MatchClassificationType, MatchExplanation } from '../ai/explanation';

export type UserRole = 'ADMIN' | 'CPSE_OFFICER' | 'MATERIAL_EXPERT';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  cpse: string;
  createdAt: string;
}

export interface CPSE {
  id: string;
  name: string;
  code: string;
  sector: string;
  createdAt: string;
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

export type MatchStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';

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
  nationalMaterialId: string;
  nationalCode: string;
  materialId: string;
  materialCode: string;
  cpseCode: string;
  mappingType: 'PRIMARY' | 'EQUIVALENT';
  confidence: number;
  approvedBy: string;
  approvedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  entityType: 'MATERIAL_MATCH' | 'NATIONAL_MATERIAL' | 'MATERIAL_MAPPING' | 'DATA_UPLOAD' | 'CONFIG';
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}
