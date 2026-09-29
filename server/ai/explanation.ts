/**
 * AI Explainability Module
 * Generates transparent engineering explanations with checkmarks (✓) and crossmarks (✕),
 * difference breakdowns, and actionable human validation recommendations.
 */

import { ExtractedSpecifications } from './specificationExtractor';
import { ScoreBreakdown } from './scorer';

export type MatchClassificationType =
  | 'IDENTICAL'
  | 'NEAR_DUPLICATE'
  | 'FUNCTIONALLY_EQUIVALENT'
  | 'DIFFERENT_VARIANT'
  | 'DIFFERENT'
  | 'NEEDS_REVIEW';

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

export function generateExplanation(
  sourceSpecs: ExtractedSpecifications,
  candidateSpecs: ExtractedSpecifications,
  scoreBreakdown: ScoreBreakdown,
  sourceTransformations: string[] = [],
  candidateTransformations: string[] = []
): MatchExplanation {
  const whyMatched: string[] = [];
  const differences: string[] = [];
  const comparisonTable: AttributeComparisonRow[] = [];

  // 1. Material comparison
  const sMat = sourceSpecs.material || 'Unspecified';
  const cMat = candidateSpecs.material || 'Unspecified';
  const matMatch = sMat.toLowerCase() === cMat.toLowerCase() && sMat !== 'Unspecified';
  comparisonTable.push({
    attribute: 'Material',
    sourceValue: sMat,
    candidateValue: cMat,
    isMatch: matMatch,
  });
  if (matMatch) {
    whyMatched.push(`Same material: ${sMat}`);
  } else if (sMat !== 'Unspecified' && cMat !== 'Unspecified') {
    differences.push(`Material differs: ${sMat} vs ${cMat}`);
  }

  // 2. Grade comparison
  const sGrade = sourceSpecs.grade || 'Standard / Unspecified';
  const cGrade = candidateSpecs.grade || 'Standard / Unspecified';
  const gradeMatch = sGrade.toLowerCase() === cGrade.toLowerCase() && sGrade !== 'Standard / Unspecified';
  comparisonTable.push({
    attribute: 'Grade',
    sourceValue: sGrade,
    candidateValue: cGrade,
    isMatch: gradeMatch,
  });
  if (gradeMatch) {
    whyMatched.push(`Same grade: ${sGrade}`);
  } else if (sGrade !== 'Standard / Unspecified' && cGrade !== 'Standard / Unspecified') {
    differences.push(`Grade differs: ${sGrade} vs ${cGrade}`);
  }

  // 3. Equipment / Item Type
  const sType = sourceSpecs.type || 'General Part';
  const cType = candidateSpecs.type || 'General Part';
  const typeMatch = sType.toLowerCase() === cType.toLowerCase() && sType !== 'General Part';
  comparisonTable.push({
    attribute: 'Type / Component',
    sourceValue: sType,
    candidateValue: cType,
    isMatch: typeMatch,
  });
  if (typeMatch) {
    whyMatched.push(`Same type: ${sType}`);
  } else if (sType !== 'General Part' && cType !== 'General Part') {
    differences.push(`Component type differs: ${sType} vs ${cType}`);
  }

  // 4. Diameter / Size
  const sDia = sourceSpecs.diameter || sourceSpecs.size || 'N/A';
  const cDia = candidateSpecs.diameter || candidateSpecs.size || 'N/A';
  const diaMatch = sDia.toLowerCase() === cDia.toLowerCase() && sDia !== 'N/A';
  comparisonTable.push({
    attribute: 'Diameter / Size',
    sourceValue: sDia,
    candidateValue: cDia,
    isMatch: diaMatch,
  });
  if (diaMatch) {
    whyMatched.push(`Same diameter / size: ${sDia}`);
  } else if (sDia !== 'N/A' && cDia !== 'N/A') {
    differences.push(`Diameter / size differs: ${sDia} vs ${cDia}`);
  }

  // 5. Length
  if (sourceSpecs.length || candidateSpecs.length) {
    const sLen = sourceSpecs.length || 'N/A';
    const cLen = candidateSpecs.length || 'N/A';
    const lenMatch = sLen.toLowerCase() === cLen.toLowerCase() && sLen !== 'N/A';
    comparisonTable.push({
      attribute: 'Length',
      sourceValue: sLen,
      candidateValue: cLen,
      isMatch: lenMatch,
    });
    if (lenMatch) {
      whyMatched.push(`Same length: ${sLen}`);
    } else if (sLen !== 'N/A' && cLen !== 'N/A') {
      differences.push(`Length differs: ${sLen} vs ${cLen}`);
    }
  }

  // 6. Pressure Rating / Class
  if (sourceSpecs.pressureRating || candidateSpecs.pressureRating) {
    const sPr = sourceSpecs.pressureRating || 'N/A';
    const cPr = candidateSpecs.pressureRating || 'N/A';
    const prMatch = sPr.toLowerCase() === cPr.toLowerCase() && sPr !== 'N/A';
    comparisonTable.push({
      attribute: 'Pressure Rating',
      sourceValue: sPr,
      candidateValue: cPr,
      isMatch: prMatch,
    });
    if (prMatch) {
      whyMatched.push(`Same pressure rating: ${sPr}`);
    } else if (sPr !== 'N/A' && cPr !== 'N/A') {
      differences.push(`Pressure rating differs: ${sPr} vs ${cPr}`);
    }
  }

  // 7. Schedule
  if (sourceSpecs.schedule || candidateSpecs.schedule) {
    const sSch = sourceSpecs.schedule || 'N/A';
    const cSch = candidateSpecs.schedule || 'N/A';
    const schMatch = sSch.toLowerCase() === cSch.toLowerCase() && sSch !== 'N/A';
    comparisonTable.push({
      attribute: 'Schedule / Thickness',
      sourceValue: sSch,
      candidateValue: cSch,
      isMatch: schMatch,
    });
    if (schMatch) {
      whyMatched.push(`Same schedule: ${sSch}`);
    } else if (sSch !== 'N/A' && cSch !== 'N/A') {
      differences.push(`Schedule differs: ${sSch} vs ${cSch}`);
    }
  }

  // Normalization highlights
  const allTransforms = [...sourceTransformations, ...candidateTransformations];
  const normalizationHighlights = Array.from(new Set(allTransforms));
  if (normalizationHighlights.length > 0) {
    whyMatched.push('Description formatting and unit differences successfully normalized');
  }

  // Classification determination based on precise engineering rules
  let matchType: MatchClassificationType = 'NEEDS_REVIEW';
  let recommendation = '';
  const score = scoreBreakdown.finalScore;

  const isMaterialDiff = differences.some(d => d.includes('Material differs'));
  const isTypeDiff = differences.some(d => d.includes('Component type differs'));
  const isDiaDiff = differences.some(d => d.includes('Diameter') || d.includes('size differs'));
  const isPressureDiff = differences.some(d => d.includes('Pressure rating differs'));
  const isSchDiff = differences.some(d => d.includes('Schedule differs'));
  const isLenDiff = differences.some(d => d.includes('Length differs'));

  if (isMaterialDiff || isTypeDiff) {
    matchType = 'DIFFERENT';
    recommendation = 'Different material category or component type. Do not combine under the same National Material Code.';
  } else if (isDiaDiff || isPressureDiff || isSchDiff || isLenDiff) {
    matchType = 'DIFFERENT_VARIANT';
    recommendation = 'Different engineering variant (same base metallurgy & type, differing dimensions, schedule, or pressure rating). Separate National Material Codes required.';
  } else if (score >= 90) {
    matchType = 'IDENTICAL';
    recommendation = 'Potentially identical material across CPSEs. Recommended to harmonize under a single National Material Code.';
  } else if (score >= 78) {
    matchType = 'NEAR_DUPLICATE';
    recommendation = 'High confidence near-duplicate with equivalent technical specifications. Validate and map to National Material Code.';
  } else if (score >= 60) {
    matchType = 'FUNCTIONALLY_EQUIVALENT';
    recommendation = 'Functionally equivalent equipment. Suitable for procurement interchangeability upon expert verification.';
  } else if (score >= 40) {
    matchType = 'NEEDS_REVIEW';
    recommendation = 'Partial attribute match. Requires review by Material Expert before any decision.';
  } else {
    matchType = 'DIFFERENT';
    recommendation = 'Distinct materials. Low technical and semantic similarity.';
  }

  return {
    matchType,
    confidence: score,
    whyMatched,
    differences,
    comparisonTable,
    recommendation,
    normalizationHighlights,
  };
}
