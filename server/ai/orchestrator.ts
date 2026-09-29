/**
 * AI Orchestrator Module
 * Coordinates the full material harmonization pipeline:
 * Understanding → Specification Extraction → Candidate Retrieval → Comparative Matching → Scoring → Explainability
 */

import { normalizeMaterialDescription, NormalizationResult } from './normalizer';
import { extractSpecifications, ExtractedSpecifications } from './specificationExtractor';
import { evaluateMaterialPair, findCandidateMatches, MaterialInput, MatchAnalysisResult } from './matcher';
import { ScoringWeights, DEFAULT_WEIGHTS } from './scorer';

export interface ProcessedMaterialProfile {
  rawDescription: string;
  normalization: NormalizationResult;
  specifications: ExtractedSpecifications;
  processedAt: string;
}

export class AIHarmonizationOrchestrator {
  private weights: ScoringWeights;

  constructor(weights: ScoringWeights = DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Stage 1 & 2: Ingests raw material description and produces enriched profile
   */
  public processMaterial(rawDescription: string): ProcessedMaterialProfile {
    const normalization = normalizeMaterialDescription(rawDescription);
    const specifications = extractSpecifications(normalization.normalized);

    return {
      rawDescription,
      normalization,
      specifications,
      processedAt: new Date().toISOString(),
    };
  }

  /**
   * Stage 3 & 4: Matches a given material against an available candidate pool
   */
  public matchMaterial(
    source: MaterialInput,
    pool: MaterialInput[],
    options?: { limit?: number; minScore?: number; excludeSameCpse?: boolean }
  ): MatchAnalysisResult[] {
    return findCandidateMatches(source, pool, {
      weights: this.weights,
      limit: options?.limit ?? 10,
      minScore: options?.minScore ?? 15,
      excludeSameCpse: options?.excludeSameCpse ?? false,
    });
  }

  /**
   * Stage 5: Evaluates a single specific candidate pair
   */
  public comparePair(source: MaterialInput, candidate: MaterialInput): MatchAnalysisResult {
    return evaluateMaterialPair(source, candidate, this.weights);
  }

  public updateWeights(newWeights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  public getWeights(): ScoringWeights {
    return { ...this.weights };
  }
}

export const orchestrator = new AIHarmonizationOrchestrator();
