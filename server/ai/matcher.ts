/**
 * AI Matcher Module
 * Compares material pairs, calculates multidimensional similarity scores,
 * and identifies top candidate matches across CPSEs.
 */

import { normalizeMaterialDescription, NormalizationResult } from './normalizer';
import { extractSpecifications, ExtractedSpecifications } from './specificationExtractor';
import { calculateScoreBreakdown, ScoreBreakdown, ScoringWeights, DEFAULT_WEIGHTS } from './scorer';
import { generateExplanation, MatchExplanation, MatchClassificationType } from './explanation';

export interface MaterialInput {
  id: string;
  cpseCode: string;
  materialCode: string;
  description: string;
  normalizedDescription?: string;
  category?: string;
  unit?: string;
  specifications?: ExtractedSpecifications;
}

export interface MatchAnalysisResult {
  sourceMaterialId: string;
  candidateMaterialId: string;
  sourceCpse: string;
  candidateCpse: string;
  sourceCode: string;
  candidateCode: string;
  sourceDescription: string;
  candidateDescription: string;
  sourceNormalized: string;
  candidateNormalized: string;
  sourceSpecs: ExtractedSpecifications;
  candidateSpecs: ExtractedSpecifications;
  scoreBreakdown: ScoreBreakdown;
  matchType: MatchClassificationType;
  confidence: number;
  explanation: MatchExplanation;
}

/**
 * Evaluates a single pair of materials
 */
export function evaluateMaterialPair(
  source: MaterialInput,
  candidate: MaterialInput,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): MatchAnalysisResult {
  // Normalize descriptions
  const normA: NormalizationResult = normalizeMaterialDescription(source.description);
  const normB: NormalizationResult = normalizeMaterialDescription(candidate.description);

  // Extract specs
  const specsA = source.specifications || extractSpecifications(normA.normalized);
  const specsB = candidate.specifications || extractSpecifications(normB.normalized);

  // Calculate scores
  const scoreBreakdown = calculateScoreBreakdown(
    normA.tokens,
    normB.tokens,
    specsA,
    specsB,
    source.unit,
    candidate.unit,
    weights
  );

  // Generate explainability
  const explanation = generateExplanation(
    specsA,
    specsB,
    scoreBreakdown,
    normA.transformations,
    normB.transformations
  );

  return {
    sourceMaterialId: source.id,
    candidateMaterialId: candidate.id,
    sourceCpse: source.cpseCode,
    candidateCpse: candidate.cpseCode,
    sourceCode: source.materialCode,
    candidateCode: candidate.materialCode,
    sourceDescription: source.description,
    candidateDescription: candidate.description,
    sourceNormalized: normA.normalized,
    candidateNormalized: normB.normalized,
    sourceSpecs: specsA,
    candidateSpecs: specsB,
    scoreBreakdown,
    matchType: explanation.matchType,
    confidence: scoreBreakdown.finalScore,
    explanation,
  };
}

/**
 * Searches and ranks candidate matches for a source material across the entire CPSE catalog
 */
export function findCandidateMatches(
  source: MaterialInput,
  pool: MaterialInput[],
  options: {
    minScore?: number;
    limit?: number;
    weights?: ScoringWeights;
    excludeSameCpse?: boolean;
  } = {}
): MatchAnalysisResult[] {
  const { minScore = 20, limit = 10, weights = DEFAULT_WEIGHTS, excludeSameCpse = false } = options;

  const results: MatchAnalysisResult[] = [];

  for (const candidate of pool) {
    if (candidate.id === source.id) continue;
    if (excludeSameCpse && candidate.cpseCode === source.cpseCode) continue;

    const evaluation = evaluateMaterialPair(source, candidate, weights);
    if (evaluation.confidence >= minScore) {
      results.push(evaluation);
    }
  }

  // Sort descending by confidence
  results.sort((a, b) => b.confidence - a.confidence);

  return results.slice(0, limit);
}
