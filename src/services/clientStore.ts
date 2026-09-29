import {
  Material,
  MaterialMatch,
  NationalMaterial,
  MaterialMapping,
  AuditLog,
  DashboardStats,
  CPSE,
  ExtractedSpecifications,
  MatchStatus,
  MatchClassificationType,
  AttributeComparisonRow,
  MatchExplanation,
  User,
} from '../types';

// ==========================================
// 1. Client-Side Normalization Module
// ==========================================

export interface NormalizationResult {
  original: string;
  normalized: string;
  transformations: string[];
  tokens: string[];
}

export function normalizeMaterialDescription(input: string): NormalizationResult {
  if (!input || typeof input !== 'string') {
    return { original: '', normalized: '', transformations: [], tokens: [] };
  }

  const original = input.trim();
  const transformations: string[] = [];
  let text = original;

  const cleanSeparators = text.replace(/[\t\r\n]+/g, ' ').replace(/\s{2,}/g, ' ');
  if (cleanSeparators !== text) text = cleanSeparators;

  const mmRegex = /\b(\d+(?:\.\d+)?)\s*(?:MM|MILLIMETER|MILLIMETRE|MILLIMETERS)\b/gi;
  if (mmRegex.test(text)) {
    text = text.replace(mmRegex, (match, val) => {
      transformations.push(`Normalized unit: "${match}" → "${val} mm"`);
      return `${val} mm`;
    });
  }

  const cmRegex = /\b(\d+(?:\.\d+)?)\s*(?:CM|CENTIMETER|CENTIMETRE)\b/gi;
  if (cmRegex.test(text)) {
    text = text.replace(cmRegex, (match, val) => {
      transformations.push(`Normalized unit: "${match}" → "${val} cm"`);
      return `${val} cm`;
    });
  }

  const mRegex = /\b(\d+(?:\.\d+)?)\s*(?:MTR|MTRS|METER|METERS|METRE)\b/gi;
  if (mRegex.test(text)) {
    text = text.replace(mRegex, (match, val) => {
      transformations.push(`Normalized unit: "${match}" → "${val} m"`);
      return `${val} m`;
    });
  }

  const kgRegex = /\b(\d+(?:\.\d+)?)\s*(?:KG|KGS|KILOGRAM|KILOGRAMS)\b/gi;
  if (kgRegex.test(text)) {
    text = text.replace(kgRegex, (match, val) => {
      transformations.push(`Normalized unit: "${match}" → "${val} kg"`);
      return `${val} kg`;
    });
  }

  const inchRegex = /\b(\d+(?:\/\d+)?|\d+(?:\.\d+)?)\s*(?:INCH|INCHES|IN)\b|(\d+(?:\/\d+)?|\d+(?:\.\d+)?)\s*\"/gi;
  if (inchRegex.test(text)) {
    text = text.replace(inchRegex, (match, g1, g2) => {
      const val = g1 || g2;
      transformations.push(`Normalized unit: "${match}" → "${val} inch"`);
      return `${val} inch`;
    });
  }

  const classRegex = /\b(?:CLASS|CL\.?)\s*(\d+)\b|\b(\d+)\s*(?:#|LBS|LB)\b/gi;
  if (classRegex.test(text)) {
    text = text.replace(classRegex, (match, g1, g2) => {
      const rating = g1 || g2;
      transformations.push(`Standardized pressure class: "${match}" → "Class ${rating}#"`);
      return `Class ${rating}#`;
    });
  }

  const schRegex = /\b(?:SCHEDULE|SCH\.?)\s*(\d+|XXS|XS|STD)\b/gi;
  if (schRegex.test(text)) {
    text = text.replace(schRegex, (match, schVal) => {
      transformations.push(`Standardized pipe schedule: "${match}" → "SCH ${schVal.toUpperCase()}"`);
      return `SCH ${schVal.toUpperCase()}`;
    });
  }

  const dimRegex = /(\d+(?:\.\d+)?(?:\s*mm|\s*cm|\s*m|\s*inch)?|\bM\d+)\s*(?:[xX\*]|(?:\s+by\s+)|\u00D7)\s*(\d+(?:\.\d+)?(?:\s*mm|\s*cm|\s*m|\s*inch)?)/gi;
  if (dimRegex.test(text)) {
    text = text.replace(dimRegex, (match, p1, p2) => {
      transformations.push(`Standardized dimension separator: "${match}" → "${p1} × ${p2}"`);
      return `${p1} × ${p2}`;
    });
  }

  const ssGradeRegex = /\b(?:S\.S\.?|SS)\s*[- ]?\s*(304L|304H|304|316L|316H|316|321|347|410)\b/gi;
  if (ssGradeRegex.test(text)) {
    text = text.replace(ssGradeRegex, (match, grade) => {
      const gUpper = `SS${grade.toUpperCase()}`;
      transformations.push(`Normalized grade & material: "${match}" → "Stainless Steel ${gUpper}"`);
      return `Stainless Steel ${gUpper}`;
    });
  }

  const standaloneSSRegex = /\b(?:S\.S\.?|SS)\b(?!\s*3\d{2})/gi;
  if (standaloneSSRegex.test(text) && !/Stainless\s+Steel/i.test(text)) {
    text = text.replace(standaloneSSRegex, match => {
      transformations.push(`Expanded abbreviation: "${match}" → "Stainless Steel"`);
      return `Stainless Steel`;
    });
  }

  const csRegex = /\b(?:C\.S\.?|CS)\b(?!\s*\d)/gi;
  if (csRegex.test(text) && !/Carbon\s+Steel/i.test(text)) {
    text = text.replace(csRegex, match => {
      transformations.push(`Expanded abbreviation: "${match}" → "Carbon Steel"`);
      return `Carbon Steel`;
    });
  }

  const msRegex = /\b(?:M\.S\.?|MS)\b(?!\s*\d)/gi;
  if (msRegex.test(text) && !/Mild\s+Steel/i.test(text)) {
    text = text.replace(msRegex, match => {
      transformations.push(`Expanded abbreviation: "${match}" → "Mild Steel"`);
      return `Mild Steel`;
    });
  }

  const ciRegex = /\b(?:C\.I\.?|CI)\b/gi;
  if (ciRegex.test(text) && !/Cast\s+Iron/i.test(text)) {
    text = text.replace(ciRegex, match => {
      transformations.push(`Expanded abbreviation: "${match}" → "Cast Iron"`);
      return `Cast Iron`;
    });
  }

  if (/\b(?:WCB|A216\s*WCB|ASTM\s*A216\s*WCB)\b/i.test(text) && !/Carbon\s+Steel/i.test(text)) {
    text = text.replace(/\bWCB\b/i, 'Carbon Steel WCB');
  }

  const normalized = text.replace(/\s+/g, ' ').trim();

  const rawTokens = normalized
    .toLowerCase()
    .replace(/[\u00D7,\(\)\[\]"']/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0 && !['and', 'with', 'for', 'the', 'of', 'in', 'body', 'trim'].includes(t));

  const tokens: string[] = [];
  for (const t of rawTokens) {
    tokens.push(t);
    const mMatch = t.match(/^m(\d+)$/);
    if (mMatch) {
      tokens.push(mMatch[1]);
      tokens.push(`${mMatch[1]}mm`);
    }
  }

  return {
    original,
    normalized,
    transformations,
    tokens,
  };
}

// ==========================================
// 2. Client-Side Specification Extractor
// ==========================================

export function extractSpecifications(normalizedText: string): ExtractedSpecifications {
  const specs: ExtractedSpecifications = {
    additionalAttributes: {},
  };

  const text = normalizedText || '';

  if (/Stainless Steel/i.test(text)) {
    specs.material = 'Stainless Steel';
  } else if (/Carbon Steel|WCB|A216/i.test(text)) {
    specs.material = 'Carbon Steel';
  } else if (/Mild Steel/i.test(text)) {
    specs.material = 'Mild Steel';
  } else if (/Alloy Steel/i.test(text)) {
    specs.material = 'Alloy Steel';
  } else if (/Cast Iron/i.test(text)) {
    specs.material = 'Cast Iron';
  } else if (/Ductile Iron/i.test(text)) {
    specs.material = 'Ductile Iron';
  } else if (/Brass/i.test(text)) {
    specs.material = 'Brass';
  } else if (/Copper/i.test(text)) {
    specs.material = 'Copper';
  } else if (/PTFE/i.test(text)) {
    specs.material = 'PTFE (Teflon)';
  }

  const gradeMatches = [
    { regex: /\b(SS304L|SS-304L|304L)\b/i, grade: 'SS304L' },
    { regex: /\b(SS304H|SS-304H|304H)\b/i, grade: 'SS304H' },
    { regex: /\b(SS304|SS-304|AISI\s*304|304)\b/i, grade: 'SS304' },
    { regex: /\b(SS316L|SS-316L|316L)\b/i, grade: 'SS316L' },
    { regex: /\b(SS316H|SS-316H|316H)\b/i, grade: 'SS316H' },
    { regex: /\b(SS316|SS-316|AISI\s*316|316)\b/i, grade: 'SS316' },
    { regex: /\b(A216\s*(?:GR\.?|GRADE)?\s*WCB|WCB)\b/i, grade: 'ASTM A216 WCB' },
    { regex: /\b(A106\s*(?:GR\.?|GRADE)?\s*B)\b/i, grade: 'ASTM A106 Gr.B' },
    { regex: /\b(A105|ASTM\s*A105)\b/i, grade: 'ASTM A105' },
    { regex: /\b(A234\s*(?:WPB)?)\b/i, grade: 'ASTM A234 WPB' },
    { regex: /\b(A312\s*TP304)\b/i, grade: 'ASTM A312 TP304' },
    { regex: /\b(A312\s*TP316L?)\b/i, grade: 'ASTM A312 TP316' },
    { regex: /\b(A193\s*(?:GR\.?|GRADE)?\s*B7)\b/i, grade: 'ASTM A193 B7' },
    { regex: /\b(A194\s*(?:GR\.?|GRADE)?\s*2H)\b/i, grade: 'ASTM A194 2H' },
    { regex: /\b(IS\s*2062(?:\s*GR\.?\s*[ABC])?)\b/i, grade: 'IS 2062' },
    { regex: /\b(GR\.?|GRADE)\s*8\.8\b/i, grade: 'Grade 8.8' },
    { regex: /\b(GR\.?|GRADE)\s*10\.9\b/i, grade: 'Grade 10.9' },
    { regex: /\b(GR\.?|GRADE)\s*B7\b/i, grade: 'Grade B7' },
  ];

  for (const gm of gradeMatches) {
    if (gm.regex.test(text)) {
      specs.grade = gm.grade;
      if (!specs.material) {
        if (gm.grade.startsWith('SS') || gm.grade.includes('304') || gm.grade.includes('316')) {
          specs.material = 'Stainless Steel';
        } else if (gm.grade.includes('A106') || gm.grade.includes('A105') || gm.grade.includes('WPB') || gm.grade.includes('WCB')) {
          specs.material = 'Carbon Steel';
        }
      }
      break;
    }
  }

  const typeMatchers = [
    { regex: /\b(?:HEX(?:AGONAL)?\s+BOLT|HEX\s*BOLT)\b/i, type: 'Hex Bolt' },
    { regex: /\b(?:STUD\s+BOLT|STUD)\b/i, type: 'Stud Bolt' },
    { regex: /\b(?:HEX(?:AGONAL)?\s+NUT|HEX\s*NUT)\b/i, type: 'Hex Nut' },
    { regex: /\b(?:GATE\s+VALVE)\b/i, type: 'Gate Valve' },
    { regex: /\b(?:BALL\s+VALVE)\b/i, type: 'Ball Valve' },
    { regex: /\b(?:GLOBE\s+VALVE)\b/i, type: 'Globe Valve' },
    { regex: /\b(?:CHECK\s+VALVE|NRV|NON\s+RETURN\s+VALVE)\b/i, type: 'Check Valve' },
    { regex: /\b(?:SEAMLESS\s+PIPE|SMLS\s+PIPE|PIPE)\b/i, type: 'Seamless Pipe' },
    { regex: /\b(?:SPIRAL\s+WOUND\s+GASKET|SPWD\s+GSKT)\b/i, type: 'Spiral Wound Gasket' },
    { regex: /\b(?:WELD\s*NECK\s*FLANGE|WNRF\s+FLANGE|WNRF)\b/i, type: 'WNRF Flange' },
    { regex: /\b(?:SLIP\s*ON\s*FLANGE|SORF\s+FLANGE|SORF)\b/i, type: 'SORF Flange' },
    { regex: /\b(?:BLIND\s*FLANGE|BLRF)\b/i, type: 'Blind Flange' },
    { regex: /\b(?:ELBOW\s*90(?:\s*DEG)?)\b/i, type: '90° Elbow' },
    { regex: /\b(?:ELBOW\s*45(?:\s*DEG)?)\b/i, type: '45° Elbow' },
    { regex: /\b(?:EQUAL\s*TEE|TEE)\b/i, type: 'Tee' },
    { regex: /\b(?:PUMP\s+IMPELLER|IMPELLER)\b/i, type: 'Pump Impeller' },
    { regex: /\b(?:MECHANICAL\s+SEAL|MECH\s+SEAL)\b/i, type: 'Mechanical Seal' },
    { regex: /\b(?:FLAT\s+WASHER|WASHER)\b/i, type: 'Washer' },
  ];

  for (const tm of typeMatchers) {
    if (tm.regex.test(text)) {
      specs.type = tm.type;
      break;
    }
  }

  const metricPattern = /\b(?:M)?(\d+)\s*(?:mm)?\s*(?:[×x\*]|\u00D7|\s+by\s+)\s*(\d+(?:\.\d+)?)\s*(?:mm)?\b/i;
  const metricMatch = text.match(metricPattern);
  if (metricMatch) {
    specs.diameter = `${metricMatch[1]} mm`;
    specs.length = `${metricMatch[2]} mm`;
    specs.size = `M${metricMatch[1]} × ${metricMatch[2]} mm`;
  } else {
    const singleM = text.match(/\bM(\d+)\b/i);
    if (singleM) {
      specs.diameter = `${singleM[1]} mm`;
    }
  }

  const pipeSizeMatch = text.match(/\b(\d+(?:\/\d+)?|\d+(?:\.\d+)?)\s*(?:inch|\"|in)\b/i);
  if (pipeSizeMatch && !specs.diameter) {
    specs.diameter = `${pipeSizeMatch[1]} inch`;
    specs.size = `${pipeSizeMatch[1]} inch`;
  }

  const nbPattern = /\b(?:DN|NB)\s*(\d+)\b|\b(\d+)\s*(?:NB|DN)\b/i;
  const nbMatch = text.match(nbPattern);
  if (nbMatch && !specs.diameter) {
    const val = nbMatch[1] || nbMatch[2];
    specs.size = `DN ${val}`;
    specs.diameter = `${val} mm`;
  }

  const classMatch = text.match(/\bClass\s*(\d+)#?\b|\b(\d+)\s*#\b|\bPN\s*(\d+)\b/i);
  if (classMatch) {
    if (classMatch[1] || classMatch[2]) {
      specs.pressureRating = `Class ${classMatch[1] || classMatch[2]}#`;
    } else if (classMatch[3]) {
      specs.pressureRating = `PN ${classMatch[3]}`;
    }
  }

  const schMatch = text.match(/\bSCH\s*(\d+|XXS|XS|STD)\b/i);
  if (schMatch) {
    specs.schedule = `SCH ${schMatch[1].toUpperCase()}`;
  }

  const stdMatch = text.match(/\b(API\s*600|API\s*6D|ASME\s*B16\.\d+|ASTM\s*A\d+|DIN\s*\d+|ISO\s*\d+|BS\s*\d+)\b/i);
  if (stdMatch) {
    specs.standard = stdMatch[1].toUpperCase();
  }

  if (/\b(?:FLANGED|FLANGE\s*END|RF)\b/i.test(text)) {
    specs.endConnection = 'Flanged Raised Face (RF)';
  } else if (/\b(?:BUTT\s*WELD|BW)\b/i.test(text)) {
    specs.endConnection = 'Butt Weld (BW)';
  } else if (/\b(?:SOCKET\s*WELD|SW)\b/i.test(text)) {
    specs.endConnection = 'Socket Weld (SW)';
  } else if (/\b(?:THREADED|NPT|BSP)\b/i.test(text)) {
    specs.endConnection = 'Threaded (NPT)';
  }

  return specs;
}

// ==========================================
// 3. Client-Side Scorer & Explanation
// ==========================================

function calculateTokenSimilarity(tokensA: string[], tokensB: string[]): number {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? (intersection / union) * 100 : 0;
}

function parseDimensionValue(dimStr?: string): number | null {
  if (!dimStr) return null;
  const match = dimStr.match(/\b(?:M)?(\d+(?:\.\d+)?)\b/i);
  return match ? parseFloat(match[1]) : null;
}

function calculateDimensionScore(specsA: ExtractedSpecifications, specsB: ExtractedSpecifications): { score: number; match: boolean; diffDetails?: string } {
  const dValA = parseDimensionValue(specsA.diameter);
  const dValB = parseDimensionValue(specsB.diameter);
  const lValA = parseDimensionValue(specsA.length);
  const lValB = parseDimensionValue(specsB.length);

  if (dValA === null && dValB === null && lValA === null && lValB === null) {
    return { score: 85, match: true };
  }

  let diameterMatch = true;
  let lengthMatch = true;
  const diffs: string[] = [];

  if (dValA !== null && dValB !== null) {
    if (Math.abs(dValA - dValB) < 0.01) {
      diameterMatch = true;
    } else {
      diameterMatch = false;
      diffs.push(`Diameter differs: ${specsA.diameter} vs ${specsB.diameter}`);
    }
  } else if (dValA !== null || dValB !== null) {
    diameterMatch = false;
    diffs.push(`Diameter missing on one side: ${specsA.diameter || 'N/A'} vs ${specsB.diameter || 'N/A'}`);
  }

  if (lValA !== null && lValB !== null) {
    if (Math.abs(lValA - lValB) < 0.01) {
      lengthMatch = true;
    } else {
      lengthMatch = false;
      diffs.push(`Length differs: ${specsA.length} vs ${specsB.length}`);
    }
  } else if (lValA !== null || lValB !== null) {
    lengthMatch = true;
  }

  if (diameterMatch && lengthMatch) {
    return { score: 100, match: true };
  } else if (!diameterMatch && lengthMatch) {
    return { score: 25, match: false, diffDetails: diffs.join(', ') };
  } else if (diameterMatch && !lengthMatch) {
    return { score: 40, match: false, diffDetails: diffs.join(', ') };
  } else {
    return { score: 10, match: false, diffDetails: diffs.join(', ') };
  }
}

function calculateMaterialGradeScore(specsA: ExtractedSpecifications, specsB: ExtractedSpecifications): { score: number; match: boolean; diffDetails?: string } {
  const matA = (specsA.material || '').toLowerCase();
  const matB = (specsB.material || '').toLowerCase();
  const grdA = (specsA.grade || '').toLowerCase();
  const grdB = (specsB.grade || '').toLowerCase();

  if (!matA && !matB) {
    return { score: 70, match: true };
  }

  if (matA && matB && matA !== matB) {
    return {
      score: 10,
      match: false,
      diffDetails: `Base material differs: ${specsA.material} vs ${specsB.material}`,
    };
  }

  let score = 85;
  if (matA && matB && matA === matB) {
    score = 95;
  }

  if (grdA && grdB) {
    if (grdA === grdB) {
      score = 100;
      return { score, match: true };
    } else {
      return {
        score: 40,
        match: false,
        diffDetails: `Grade differs: ${specsA.grade} vs ${specsB.grade}`,
      };
    }
  } else if (grdA || grdB) {
    return { score: 85, match: true };
  }

  return { score, match: true };
}

function areUnitsEquivalent(u1?: string, u2?: string): boolean {
  if (!u1 || !u2) return true;
  const a = u1.trim().toUpperCase();
  const b = u2.trim().toUpperCase();
  if (a === b) return true;
  const countUnits = new Set(['NOS', 'EA', 'NUM', 'PIECE', 'PC', 'PCS', 'SET']);
  if (countUnits.has(a) && countUnits.has(b)) return true;
  const lengthUnits = new Set(['MTR', 'M', 'METER', 'METERS']);
  if (lengthUnits.has(a) && lengthUnits.has(b)) return true;
  const massUnits = new Set(['KG', 'KGS', 'KILOGRAM', 'KILOGRAMS']);
  if (massUnits.has(a) && massUnits.has(b)) return true;
  return false;
}

export function evaluateMaterialPair(
  source: { id: string; cpseCode: string; materialCode: string; description: string; specifications?: ExtractedSpecifications; unit?: string },
  candidate: { id: string; cpseCode: string; materialCode: string; description: string; specifications?: ExtractedSpecifications; unit?: string }
): MaterialMatch {
  const normA = normalizeMaterialDescription(source.description);
  const normB = normalizeMaterialDescription(candidate.description);

  const specsA = source.specifications || extractSpecifications(normA.normalized);
  const specsB = candidate.specifications || extractSpecifications(normB.normalized);

  let semanticScore = Math.round(calculateTokenSimilarity(normA.tokens, normB.tokens));
  const matResult = calculateMaterialGradeScore(specsA, specsB);
  const materialGradeScore = matResult.score;
  const dimResult = calculateDimensionScore(specsA, specsB);
  const dimensionsScore = dimResult.score;

  let specMatches = 0;
  let specTotal = 0;

  if (specsA.type || specsB.type) {
    specTotal++;
    if (specsA.type && specsB.type && specsA.type.toLowerCase() === specsB.type.toLowerCase()) {
      specMatches++;
    }
  }

  if (specsA.pressureRating || specsB.pressureRating) {
    specTotal++;
    if (specsA.pressureRating && specsB.pressureRating && specsA.pressureRating.toLowerCase() === specsB.pressureRating.toLowerCase()) {
      specMatches++;
    }
  }

  if (specsA.schedule || specsB.schedule) {
    specTotal++;
    if (specsA.schedule && specsB.schedule && specsA.schedule.toLowerCase() === specsB.schedule.toLowerCase()) {
      specMatches++;
    }
  }

  if (specsA.standard || specsB.standard) {
    specTotal++;
    if (specsA.standard && specsB.standard && specsA.standard.toLowerCase() === specsB.standard.toLowerCase()) {
      specMatches++;
    }
  }

  const specificationScore = specTotal > 0 ? Math.round((specMatches / specTotal) * 100) : (specsA.type && specsB.type ? 100 : 80);
  const metadataScore = areUnitsEquivalent(source.unit, candidate.unit) ? 100 : 60;

  let penaltyMultiplier = 1.0;
  if (!matResult.match) penaltyMultiplier *= 0.5;
  if (specsA.type && specsB.type && specsA.type.toLowerCase() !== specsB.type.toLowerCase()) penaltyMultiplier *= 0.4;

  const pressureMatches = !specsA.pressureRating || !specsB.pressureRating || specsA.pressureRating.toLowerCase() === specsB.pressureRating.toLowerCase();
  const scheduleMatches = !specsA.schedule || !specsB.schedule || specsA.schedule.toLowerCase() === specsB.schedule.toLowerCase();

  if (!pressureMatches) penaltyMultiplier *= 0.75;
  if (!scheduleMatches) penaltyMultiplier *= 0.75;

  const isPerfectHardwareMatch =
    materialGradeScore === 100 &&
    dimensionsScore === 100 &&
    specsA.type &&
    specsB.type &&
    specsA.type.toLowerCase() === specsB.type.toLowerCase() &&
    pressureMatches &&
    scheduleMatches;

  if (isPerfectHardwareMatch) {
    semanticScore = Math.max(semanticScore, 92);
  }

  const rawWeighted =
    semanticScore * 0.30 +
    specificationScore * 0.30 +
    materialGradeScore * 0.20 +
    dimensionsScore * 0.15 +
    metadataScore * 0.05;

  let finalScore = Math.max(0, Math.min(100, Math.round(rawWeighted * penaltyMultiplier)));
  if (isPerfectHardwareMatch && finalScore < 96) {
    finalScore = 96;
  }

  // Generate Explanation
  const whyMatched: string[] = [];
  const differences: string[] = [];
  const comparisonTable: AttributeComparisonRow[] = [];

  const sMat = specsA.material || 'Unspecified';
  const cMat = specsB.material || 'Unspecified';
  const matMatch = sMat.toLowerCase() === cMat.toLowerCase() && sMat !== 'Unspecified';
  comparisonTable.push({ attribute: 'Material', sourceValue: sMat, candidateValue: cMat, isMatch: matMatch });
  if (matMatch) whyMatched.push(`Same material: ${sMat}`);
  else if (sMat !== 'Unspecified' && cMat !== 'Unspecified') differences.push(`Material differs: ${sMat} vs ${cMat}`);

  const sGrade = specsA.grade || 'Standard / Unspecified';
  const cGrade = specsB.grade || 'Standard / Unspecified';
  const gradeMatch = sGrade.toLowerCase() === cGrade.toLowerCase() && sGrade !== 'Standard / Unspecified';
  comparisonTable.push({ attribute: 'Grade', sourceValue: sGrade, candidateValue: cGrade, isMatch: gradeMatch });
  if (gradeMatch) whyMatched.push(`Same grade: ${sGrade}`);
  else if (sGrade !== 'Standard / Unspecified' && cGrade !== 'Standard / Unspecified') differences.push(`Grade differs: ${sGrade} vs ${cGrade}`);

  const sType = specsA.type || 'General Part';
  const cType = specsB.type || 'General Part';
  const typeMatch = sType.toLowerCase() === cType.toLowerCase() && sType !== 'General Part';
  comparisonTable.push({ attribute: 'Type / Component', sourceValue: sType, candidateValue: cType, isMatch: typeMatch });
  if (typeMatch) whyMatched.push(`Same type: ${sType}`);
  else if (sType !== 'General Part' && cType !== 'General Part') differences.push(`Component type differs: ${sType} vs ${cType}`);

  const sDia = specsA.diameter || specsA.size || 'N/A';
  const cDia = specsB.diameter || specsB.size || 'N/A';
  const diaMatch = sDia.toLowerCase() === cDia.toLowerCase() && sDia !== 'N/A';
  comparisonTable.push({ attribute: 'Diameter / Size', sourceValue: sDia, candidateValue: cDia, isMatch: diaMatch });
  if (diaMatch) whyMatched.push(`Same diameter / size: ${sDia}`);
  else if (sDia !== 'N/A' && cDia !== 'N/A') differences.push(`Diameter / size differs: ${sDia} vs ${cDia}`);

  if (specsA.length || specsB.length) {
    const sLen = specsA.length || 'N/A';
    const cLen = specsB.length || 'N/A';
    const lenMatch = sLen.toLowerCase() === cLen.toLowerCase() && sLen !== 'N/A';
    comparisonTable.push({ attribute: 'Length', sourceValue: sLen, candidateValue: cLen, isMatch: lenMatch });
    if (lenMatch) whyMatched.push(`Same length: ${sLen}`);
    else if (sLen !== 'N/A' && cLen !== 'N/A') differences.push(`Length differs: ${sLen} vs ${cLen}`);
  }

  if (specsA.pressureRating || specsB.pressureRating) {
    const sPr = specsA.pressureRating || 'N/A';
    const cPr = specsB.pressureRating || 'N/A';
    const prMatch = sPr.toLowerCase() === cPr.toLowerCase() && sPr !== 'N/A';
    comparisonTable.push({ attribute: 'Pressure Rating', sourceValue: sPr, candidateValue: cPr, isMatch: prMatch });
    if (prMatch) whyMatched.push(`Same pressure rating: ${sPr}`);
    else if (sPr !== 'N/A' && cPr !== 'N/A') differences.push(`Pressure rating differs: ${sPr} vs ${cPr}`);
  }

  if (specsA.schedule || specsB.schedule) {
    const sSch = specsA.schedule || 'N/A';
    const cSch = specsB.schedule || 'N/A';
    const schMatch = sSch.toLowerCase() === cSch.toLowerCase() && sSch !== 'N/A';
    comparisonTable.push({ attribute: 'Schedule / Thickness', sourceValue: sSch, candidateValue: cSch, isMatch: schMatch });
    if (schMatch) whyMatched.push(`Same schedule: ${sSch}`);
    else if (sSch !== 'N/A' && cSch !== 'N/A') differences.push(`Schedule differs: ${sSch} vs ${cSch}`);
  }

  const allTransforms = [...normA.transformations, ...normB.transformations];
  const normalizationHighlights = Array.from(new Set(allTransforms));
  if (normalizationHighlights.length > 0) {
    whyMatched.push('Description formatting and unit differences successfully normalized');
  }

  let matchType: MatchClassificationType = 'NEEDS_REVIEW';
  let recommendation = '';

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
  } else if (finalScore >= 90) {
    matchType = 'IDENTICAL';
    recommendation = 'Potentially identical material across CPSEs. Recommended to harmonize under a single National Material Code.';
  } else if (finalScore >= 78) {
    matchType = 'NEAR_DUPLICATE';
    recommendation = 'High confidence near-duplicate with equivalent technical specifications. Validate and map to National Material Code.';
  } else if (finalScore >= 60) {
    matchType = 'FUNCTIONALLY_EQUIVALENT';
    recommendation = 'Functionally equivalent equipment. Suitable for procurement interchangeability upon expert verification.';
  } else if (finalScore >= 40) {
    matchType = 'NEEDS_REVIEW';
    recommendation = 'Partial attribute match. Requires review by Material Expert before any decision.';
  } else {
    matchType = 'DIFFERENT';
    recommendation = 'Distinct materials. Low technical and semantic similarity.';
  }

  const explanation: MatchExplanation = {
    matchType,
    confidence: finalScore,
    whyMatched,
    differences,
    comparisonTable,
    recommendation,
    normalizationHighlights,
  };

  return {
    id: `match-${source.id}-${candidate.id}`,
    materialAId: source.id,
    materialBId: candidate.id,
    sourceCode: source.materialCode,
    candidateCode: candidate.materialCode,
    sourceCpse: source.cpseCode,
    candidateCpse: candidate.cpseCode,
    sourceDescription: source.description,
    candidateDescription: candidate.description,
    sourceSpecs: specsA,
    candidateSpecs: specsB,
    semanticScore,
    specificationScore,
    attributeScore: materialGradeScore,
    metadataScore,
    finalScore,
    matchType,
    explanation,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
}

// ==========================================
// 4. Client-Side Persistent Store Data
// ==========================================

export class ClientStore {
  cpses: CPSE[] = [];
  materials: Material[] = [];
  matches: MaterialMatch[] = [];
  nationalMaterials: NationalMaterial[] = [];
  mappings: MaterialMapping[] = [];
  auditLogs: AuditLog[] = [];
  nationalCodeSequence: number = 1001;

  constructor() {
    this.init();
  }

  init() {
    const saved = localStorage.getItem('cpse_harmonizer_store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.cpses = parsed.cpses || [];
        this.materials = parsed.materials || [];
        this.matches = parsed.matches || [];
        this.nationalMaterials = parsed.nationalMaterials || [];
        this.mappings = parsed.mappings || [];
        this.auditLogs = parsed.auditLogs || [];
        this.nationalCodeSequence = parsed.nationalCodeSequence || 1001;
        if (this.materials.length > 0) return;
      } catch {
        // reseed
      }
    }
    this.seedDefaultData();
    this.save();
  }

  save() {
    try {
      localStorage.setItem(
        'cpse_harmonizer_store',
        JSON.stringify({
          cpses: this.cpses,
          materials: this.materials,
          matches: this.matches,
          nationalMaterials: this.nationalMaterials,
          mappings: this.mappings,
          auditLogs: this.auditLogs,
          nationalCodeSequence: this.nationalCodeSequence,
        })
      );
    } catch {
      // storage quota or ignore
    }
  }

  seedDefaultData() {
    this.cpses = [
      { id: 'cpse-cpcl', code: 'CPCL', name: 'Chennai Petroleum Corporation Limited', sector: 'Refinery & Petrochemicals', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cpse-iocl', code: 'IOCL', name: 'Indian Oil Corporation Limited', sector: 'Oil & Gas Exploration & Refining', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cpse-bpcl', code: 'BPCL', name: 'Bharat Petroleum Corporation Limited', sector: 'Refining & Marketing', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cpse-hpcl', code: 'HPCL', name: 'Hindustan Petroleum Corporation Limited', sector: 'Refining & Marketing', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cpse-ongc', code: 'ONGC', name: 'Oil and Natural Gas Corporation', sector: 'Upstream Exploration & Production', createdAt: '2026-01-01T00:00:00Z' },
    ];

    const rawCatalog = [
      // Fasteners (Case 1, 2, 3)
      { cpseCode: 'CPCL', code: 'CPCL-BLT-001', desc: 'SS304 HEX BOLT M10 X 50', category: 'Fasteners', subcategory: 'Bolts & Screws', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-BOLT-892', desc: 'STAINLESS STEEL SS304 HEX BOLT 10MM X 50MM', category: 'Fasteners', subcategory: 'Hexagonal Bolts', unit: 'EA' },
      { cpseCode: 'BPCL', code: 'BPCL-FST-102', desc: 'SS304 HEX BOLT M12 X 50', category: 'Fasteners', subcategory: 'Hex Bolts', unit: 'NOS' },
      { cpseCode: 'HPCL', code: 'HPCL-BLT-440', desc: 'CARBON STEEL HEX BOLT M10 X 50', category: 'Fasteners', subcategory: 'Bolts', unit: 'NOS' },
      { cpseCode: 'ONGC', code: 'ONGC-BLT-019', desc: 'S.S. 304 HEXAGONAL BOLT 10 MM X 50 MM FULL THREAD', category: 'Hardware', subcategory: 'Bolts', unit: 'NUM' },

      { cpseCode: 'CPCL', code: 'CPCL-BLT-002', desc: 'ASTM A193 GR B7 STUD BOLT 3/4" X 100MM WITH 2 NUTS', category: 'Fasteners', subcategory: 'Stud Bolts', unit: 'SET' },
      { cpseCode: 'IOCL', code: 'IOCL-STD-401', desc: 'STUD BOLT ASTM A193 B7 3/4 INCH X 100 MM WITH 2H NUTS', category: 'Fasteners', subcategory: 'High Tensile Studs', unit: 'SET' },
      { cpseCode: 'BPCL', code: 'BPCL-FST-308', desc: 'B7 STUD BOLT 3/4 INCH X 100MM ASTM A193 WITH 2 HEAVY HEX NUTS A194 2H', category: 'Fasteners', subcategory: 'Studs', unit: 'SET' },
      { cpseCode: 'HPCL', code: 'HPCL-STD-211', desc: 'ALLOY STEEL STUD BOLT GRADE B7 3/4" X 120 MM WITH NUTS', category: 'Fasteners', subcategory: 'Studs', unit: 'SET' },
      { cpseCode: 'ONGC', code: 'ONGC-FST-991', desc: 'HIGH TENSILE B7 STUD BOLT 3/4" X 100 MM WITH 2H HEX NUTS', category: 'Hardware', subcategory: 'Fasteners', unit: 'SET' },

      // Valves (Case 4)
      { cpseCode: 'CPCL', code: 'CPCL-VLV-101', desc: 'GATE VALVE 2 INCH CLASS 150# FLANGED RF WCB BODY TRIM 8 API 600', category: 'Valves', subcategory: 'Gate Valves', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-VLV-710', desc: '2" 150# RF FLANGED GATE VALVE ASTM A216 WCB TRIM 8 API 600', category: 'Piping & Valves', subcategory: 'Gate Valves', unit: 'NOS' },
      { cpseCode: 'BPCL', code: 'BPCL-VLV-044', desc: 'GATE VALVE 2" 150 LB FLANGE END WCB OS&Y FLEXIBLE WEDGE', category: 'Valves', subcategory: 'Gate Valves', unit: 'EA' },
      { cpseCode: 'HPCL', code: 'HPCL-VLV-882', desc: 'GATE VALVE 2 INCH CLASS 300# FLANGED RF ASTM A216 WCB', category: 'Valves', subcategory: 'Gate Valves', unit: 'NOS' },
      { cpseCode: 'ONGC', code: 'ONGC-VLV-301', desc: '2 INCH GATE VALVE CLASS 150# FLANGED RAISED FACE WCB BODY', category: 'Flow Control', subcategory: 'Valves', unit: 'NOS' },

      { cpseCode: 'CPCL', code: 'CPCL-VLV-205', desc: 'BALL VALVE 3 INCH CLASS 150# FLANGED FULL BORE SS316 BODY PTFE SEAT', category: 'Valves', subcategory: 'Ball Valves', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-VLV-551', desc: '3" 150# SS316 FULL BORE FLANGED BALL VALVE WITH PTFE SEAT', category: 'Piping & Valves', subcategory: 'Ball Valves', unit: 'NOS' },
      { cpseCode: 'BPCL', code: 'BPCL-VLV-612', desc: 'BALL VALVE 3 INCH CLASS 300# FULL BORE SS316 BODY FLANGED', category: 'Valves', subcategory: 'Ball Valves', unit: 'NOS' },
      { cpseCode: 'HPCL', code: 'HPCL-VLV-129', desc: 'STAINLESS STEEL 316 BALL VALVE 3" CLASS 150# FLANGE END', category: 'Valves', subcategory: 'Ball Valves', unit: 'EA' },

      // Pipes
      { cpseCode: 'CPCL', code: 'CPCL-PIP-010', desc: 'SEAMLESS PIPE 4 INCH SCH 40 ASTM A106 GR B', category: 'Piping', subcategory: 'Carbon Steel Pipes', unit: 'MTR' },
      { cpseCode: 'IOCL', code: 'IOCL-PIP-112', desc: '4" SCH 40 SMLS PIPE ASTM A106 GRADE B CARBON STEEL', category: 'Piping & Valves', subcategory: 'Seamless Pipes', unit: 'MTR' },
      { cpseCode: 'BPCL', code: 'BPCL-PIP-904', desc: 'CS SEAMLESS PIPE 4 INCH SCHEDULE 40 ASTM A106 GR.B', category: 'Pipes & Tubes', subcategory: 'Pipes', unit: 'M' },
      { cpseCode: 'HPCL', code: 'HPCL-PIP-318', desc: 'SEAMLESS PIPE 4 INCH SCH 80 ASTM A106 GR B', category: 'Piping', subcategory: 'Seamless Pipes', unit: 'MTR' },
      { cpseCode: 'ONGC', code: 'ONGC-PIP-774', desc: '4 INCH SEAMLESS STEEL PIPE SCH 40 ASTM A106 GR B BEVELED END', category: 'Tubular Goods', subcategory: 'Line Pipe', unit: 'MTR' },

      // Flanges
      { cpseCode: 'CPCL', code: 'CPCL-FLG-001', desc: 'WNRF FLANGE 3 INCH CLASS 150# SCH 40 ASTM A105 ASME B16.5', category: 'Piping', subcategory: 'Flanges', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-FLG-920', desc: '3" 150# WNRF FLANGE SCH 40 ASTM A105 ASME B16.5 FORGED CS', category: 'Piping & Valves', subcategory: 'Flanges', unit: 'NOS' },
      { cpseCode: 'BPCL', code: 'BPCL-FLG-115', desc: 'WELD NECK RAISED FACE FLANGE 3 INCH 150# SCH 40 A105', category: 'Piping', subcategory: 'Flanges', unit: 'EA' },
      { cpseCode: 'HPCL', code: 'HPCL-FLG-622', desc: 'SORF FLANGE 3 INCH CLASS 150# ASTM A105 ASME B16.5', category: 'Piping', subcategory: 'Flanges', unit: 'NOS' },
      { cpseCode: 'ONGC', code: 'ONGC-FLG-510', desc: 'FLANGE WNRF 3" CLASS 150# SCH 40 FORGED CARBON STEEL ASTM A105', category: 'Piping Accessories', subcategory: 'Flanges', unit: 'NOS' },

      // Gaskets
      { cpseCode: 'CPCL', code: 'CPCL-GSK-001', desc: 'SPIRAL WOUND GASKET 2 INCH CLASS 150# SS304 WITH GRAPHITE FILLER ASME B16.20', category: 'Gaskets & Seals', subcategory: 'Metallic Gaskets', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-GSK-119', desc: '2" 150# SPWD GASKET SS304 / FLEXIBLE GRAPHITE FILLER WITH CS INNER & OUTER RING', category: 'Gaskets & Seals', subcategory: 'Spiral Wound', unit: 'NOS' },
      { cpseCode: 'BPCL', code: 'BPCL-GSK-741', desc: 'SPIRAL WOUND GASKET 2 INCH 150# SS304 GRAPHITE ASME B16.20', category: 'Sealing Products', subcategory: 'Gaskets', unit: 'EA' },

      // Instrumentation & Pumps
      { cpseCode: 'CPCL', code: 'CPCL-ELE-042', desc: 'PRESSURE TRANSMITTER 4-20 MA SMART HART 0-10 BAR SS316 DIAPHRAGM', category: 'Instrumentation', subcategory: 'Transmitters', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-INS-603', desc: 'SMART PRESSURE TRANSMITTER 0 TO 10 BAR 4-20MA HART SS316 WETTED PARTS', category: 'Instrumentation', subcategory: 'Transmitters', unit: 'NOS' },
      { cpseCode: 'ONGC', code: 'ONGC-INS-212', desc: 'PRESSURE TRANSMITTER 0-10 BAR G 4-20MA + HART PROTOCOL SS316 DIAPHRAGM', category: 'Instrumentation', subcategory: 'Sensors', unit: 'NOS' },
      { cpseCode: 'CPCL', code: 'CPCL-PMP-110', desc: 'CENTRIFUGAL PUMP IMPELLER SS316 CLOSED TYPE DIA 210 MM', category: 'Mechanical Spares', subcategory: 'Pump Spares', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-ROT-772', desc: 'IMPELLER CENTRIFUGAL PUMP CLOSED TYPE SS316 210MM DIAMETER', category: 'Rotary Equipment', subcategory: 'Pump Parts', unit: 'NOS' },
    ];

    this.materials = rawCatalog.map((item, idx) => {
      const norm = normalizeMaterialDescription(item.desc);
      const specs = extractSpecifications(norm.normalized);
      return {
        id: `mat-${idx + 1}`,
        cpseId: `cpse-${item.cpseCode.toLowerCase()}`,
        cpseCode: item.cpseCode,
        materialCode: item.code,
        description: item.desc,
        normalizedDescription: norm.normalized,
        category: item.category,
        subcategory: item.subcategory,
        unit: item.unit,
        manufacturer: 'Standard OEM',
        partNumber: '',
        specifications: specs,
        status: 'UNMAPPED' as const,
        createdAt: '2026-09-10T08:00:00.000Z',
      };
    });

    // Seed precomputed matches for benchmark demo
    this.matches = [];
    const cpclBolt = this.materials.find(m => m.materialCode === 'CPCL-BLT-001')!;
    const ioclBolt = this.materials.find(m => m.materialCode === 'IOCL-BOLT-892')!;
    const bpclBolt = this.materials.find(m => m.materialCode === 'BPCL-FST-102')!;
    const hpclBolt = this.materials.find(m => m.materialCode === 'HPCL-BLT-440')!;
    const ongcBolt = this.materials.find(m => m.materialCode === 'ONGC-BLT-019')!;

    if (cpclBolt && ioclBolt) this.matches.push(evaluateMaterialPair(cpclBolt, ioclBolt));
    if (cpclBolt && ongcBolt) this.matches.push(evaluateMaterialPair(cpclBolt, ongcBolt));
    if (cpclBolt && bpclBolt) this.matches.push(evaluateMaterialPair(cpclBolt, bpclBolt));
    if (cpclBolt && hpclBolt) this.matches.push(evaluateMaterialPair(cpclBolt, hpclBolt));

    const cpclVlv = this.materials.find(m => m.materialCode === 'CPCL-VLV-101')!;
    const ioclVlv = this.materials.find(m => m.materialCode === 'IOCL-VLV-710')!;
    const hpclVlv = this.materials.find(m => m.materialCode === 'HPCL-VLV-882')!;
    const ongcVlv = this.materials.find(m => m.materialCode === 'ONGC-VLV-301')!;

    if (cpclVlv && ioclVlv) this.matches.push(evaluateMaterialPair(cpclVlv, ioclVlv));
    if (cpclVlv && ongcVlv) this.matches.push(evaluateMaterialPair(cpclVlv, ongcVlv));
    if (cpclVlv && hpclVlv) this.matches.push(evaluateMaterialPair(cpclVlv, hpclVlv));

    const cpclPip = this.materials.find(m => m.materialCode === 'CPCL-PIP-010')!;
    const ioclPip = this.materials.find(m => m.materialCode === 'IOCL-PIP-112')!;
    if (cpclPip && ioclPip) this.matches.push(evaluateMaterialPair(cpclPip, ioclPip));

    const cpclFlg = this.materials.find(m => m.materialCode === 'CPCL-FLG-001')!;
    const ioclFlg = this.materials.find(m => m.materialCode === 'IOCL-FLG-920')!;
    if (cpclFlg && ioclFlg) this.matches.push(evaluateMaterialPair(cpclFlg, ioclFlg));

    // Seed 1 Approved National Material Code
    const nmcCode = 'NMC-0001001';
    const nmcId = 'nmc-1';
    this.nationalMaterials = [
      {
        id: nmcId,
        nationalCode: nmcCode,
        standardDescription: 'STAINLESS STEEL SS304 HEX BOLT M10 X 50 MM FULL THREAD',
        category: 'Fasteners',
        subcategory: 'Hex Bolts',
        specifications: {
          material: 'Stainless Steel',
          grade: 'SS304',
          type: 'Hex Bolt',
          diameter: '10 mm',
          length: '50 mm',
          size: 'M10 × 50 mm',
        },
        status: 'ACTIVE',
        mappedCount: 2,
        sourceCpseList: ['CPCL', 'IOCL'],
        createdAt: '2026-09-12T10:00:00.000Z',
        approvedBy: 'Demo User (Material Expert)',
      },
    ];

    this.mappings = [
      {
        id: 'map-1',
        nationalCode: nmcCode,
        nationalDescription: 'STAINLESS STEEL SS304 HEX BOLT M10 X 50 MM FULL THREAD',
        category: 'Fasteners',
        materialId: cpclBolt.id,
        materialCode: cpclBolt.materialCode,
        cpseCode: 'CPCL',
        originalDescription: cpclBolt.description,
        normalizedDescription: cpclBolt.normalizedDescription,
        mappingType: 'PRIMARY',
        confidence: 98,
        approvedBy: 'Demo User (Material Expert)',
        approvedAt: '2026-09-12T10:00:00.000Z',
      },
      {
        id: 'map-2',
        nationalCode: nmcCode,
        nationalDescription: 'STAINLESS STEEL SS304 HEX BOLT M10 X 50 MM FULL THREAD',
        category: 'Fasteners',
        materialId: ioclBolt.id,
        materialCode: ioclBolt.materialCode,
        cpseCode: 'IOCL',
        originalDescription: ioclBolt.description,
        normalizedDescription: ioclBolt.normalizedDescription,
        mappingType: 'EQUIVALENT',
        confidence: 98,
        approvedBy: 'Demo User (Material Expert)',
        approvedAt: '2026-09-12T10:00:00.000Z',
      },
    ];

    // Seed Audit Log
    this.auditLogs = [
      {
        id: 'aud-3',
        userId: 'usr-expert-1',
        userName: 'Demo User (Material Expert)',
        entityType: 'MATERIAL_MATCH',
        entityId: 'match-cpcl-iocl-bolt',
        action: 'APPROVED match between CPCL-BLT-001 and IOCL-BOLT-892',
        oldValue: 'PENDING',
        newValue: 'APPROVED (Mapped to NMC-0001001)',
        timestamp: '2026-09-12T10:00:00.000Z',
      },
      {
        id: 'aud-2',
        userId: 'usr-admin-1',
        userName: 'Demo User (Governance Admin)',
        entityType: 'NATIONAL_MASTER',
        entityId: 'nmc-1',
        action: 'Created National Material Code NMC-0001001 (SS304 HEX BOLT M10 X 50)',
        oldValue: 'None',
        newValue: 'NMC-0001001',
        timestamp: '2026-09-12T09:59:00.000Z',
      },
      {
        id: 'aud-1',
        userId: 'usr-admin-1',
        userName: 'Demo User (Governance Admin)',
        entityType: 'SYSTEM',
        entityId: 'sys-init',
        action: 'System initialized with Synthetic CPSE Catalogs (CPCL, IOCL, BPCL, HPCL, ONGC)',
        oldValue: 'None',
        newValue: '42 Standard CPSE Material Masters Loaded',
        timestamp: '2026-09-10T08:00:00.000Z',
      },
    ];
  }

  getDashboardStats(): DashboardStats {
    const totalMaterials = this.materials.length;
    const potentialDuplicates = this.matches.filter(m => m.finalScore >= 70 && m.status === 'PENDING').length;
    const aiRecommendations = this.matches.length;
    const pendingReviews = this.matches.filter(m => m.status === 'PENDING').length;
    const approvedMatches = this.matches.filter(m => m.status === 'APPROVED').length;
    const nationalMaterialCodes = this.nationalMaterials.length;

    // Materials by CPSE
    const cpseCounts: Record<string, number> = {};
    for (const m of this.materials) {
      cpseCounts[m.cpseCode] = (cpseCounts[m.cpseCode] || 0) + 1;
    }
    const materialsByCpse = Object.entries(cpseCounts).map(([cpse, count]) => ({ cpse, count }));

    // Match classification
    const classCounts: Record<string, number> = {};
    for (const match of this.matches) {
      classCounts[match.matchType] = (classCounts[match.matchType] || 0) + 1;
    }
    const matchClassification = Object.entries(classCounts).map(([type, count]) => ({ type, count }));

    // Review status
    const statusCounts: Record<string, number> = {};
    for (const match of this.matches) {
      statusCounts[match.status] = (statusCounts[match.status] || 0) + 1;
    }
    const reviewStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    return {
      totalMaterials,
      potentialDuplicates,
      aiRecommendations,
      pendingReviews,
      approvedMatches,
      nationalMaterialCodes,
      materialsByCpse,
      matchClassification,
      reviewStatus,
    };
  }

  runMatching(materialId: string): { sourceMaterial: Material; candidates: any[] } {
    const source = this.materials.find(m => m.id === materialId || m.materialCode === materialId);
    if (!source) {
      throw new Error(`Material not found: ${materialId}`);
    }

    const candidates: any[] = [];
    for (const other of this.materials) {
      if (other.id === source.id) continue;
      const match = evaluateMaterialPair(source, other);
      if (match.finalScore >= 25) {
        candidates.push({
          sourceMaterialId: source.id,
          candidateMaterialId: other.id,
          sourceCpse: source.cpseCode,
          candidateCpse: other.cpseCode,
          sourceCode: source.materialCode,
          candidateCode: other.materialCode,
          sourceDescription: source.description,
          candidateDescription: other.description,
          sourceSpecs: match.sourceSpecs,
          candidateSpecs: match.candidateSpecs,
          scoreBreakdown: {
            semanticScore: match.semanticScore,
            specificationScore: match.specificationScore,
            materialGradeScore: match.attributeScore,
            dimensionsScore: match.attributeScore,
            metadataScore: match.metadataScore,
            finalScore: match.finalScore,
          },
          matchType: match.matchType,
          confidence: match.finalScore,
          explanation: match.explanation,
        });
      }
    }

    candidates.sort((a, b) => b.confidence - a.confidence);

    return {
      sourceMaterial: source,
      candidates,
    };
  }

  approveMatch(matchId: string, comments?: string, nationalCode?: string) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    match.status = 'APPROVED';
    match.reviewedBy = 'Demo User (Material Expert)';
    match.reviewedAt = new Date().toISOString();
    match.reviewerNotes = comments || 'Approved by Material Expert';

    const source = this.materials.find(m => m.id === match.materialAId);
    const candidate = this.materials.find(m => m.id === match.materialBId);

    const finalNmc = nationalCode || `NMC-000${this.nationalCodeSequence++}`;
    match.nationalMaterialCode = finalNmc;

    let natMat = this.nationalMaterials.find(n => n.nationalCode === finalNmc);
    if (!natMat) {
      natMat = {
        id: `nmc-${Date.now()}`,
        nationalCode: finalNmc,
        standardDescription: source?.normalizedDescription || match.sourceDescription,
        category: source?.category || 'General Equipment',
        specifications: match.sourceSpecs,
        status: 'ACTIVE',
        mappedCount: 2,
        sourceCpseList: Array.from(new Set([match.sourceCpse, match.candidateCpse])),
        createdAt: new Date().toISOString(),
        approvedBy: 'Demo User (Material Expert)',
      };
      this.nationalMaterials.unshift(natMat);
    } else {
      natMat.mappedCount += 1;
      if (!natMat.sourceCpseList.includes(match.candidateCpse)) {
        natMat.sourceCpseList.push(match.candidateCpse);
      }
    }

    if (source) {
      source.status = 'MAPPED';
      source.mappedNationalCode = finalNmc;
    }
    if (candidate) {
      candidate.status = 'MAPPED';
      candidate.mappedNationalCode = finalNmc;
    }

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-expert-1',
      userName: 'Demo User (Material Expert)',
      entityType: 'MATERIAL_MATCH',
      entityId: matchId,
      action: `APPROVED match between ${match.sourceCode} and ${match.candidateCode}`,
      oldValue: 'PENDING',
      newValue: `APPROVED (Assigned ${finalNmc})`,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return { success: true, message: 'Match approved successfully', match, nationalMaterial: natMat };
  }

  rejectMatch(matchId: string, comments?: string) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    match.status = 'REJECTED';
    match.reviewedBy = 'Demo User (Material Expert)';
    match.reviewedAt = new Date().toISOString();
    match.reviewerNotes = comments || 'Rejected by Material Expert';

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-expert-1',
      userName: 'Demo User (Material Expert)',
      entityType: 'MATERIAL_MATCH',
      entityId: matchId,
      action: `REJECTED match between ${match.sourceCode} and ${match.candidateCode}`,
      oldValue: 'PENDING',
      newValue: 'REJECTED',
      timestamp: new Date().toISOString(),
    });

    this.save();
    return { success: true, message: 'Match rejected', match };
  }

  flagNeedsReview(matchId: string, comments?: string) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    match.status = 'NEEDS_REVIEW';
    match.reviewedBy = 'Demo User (Technical Committee)';
    match.reviewedAt = new Date().toISOString();
    match.reviewerNotes = comments || 'Flagged for drawing verification';

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-officer-1',
      userName: 'Demo User (CPSE Officer)',
      entityType: 'MATERIAL_MATCH',
      entityId: matchId,
      action: `FLAGGED match between ${match.sourceCode} and ${match.candidateCode} for review`,
      oldValue: 'PENDING',
      newValue: 'NEEDS_REVIEW',
      timestamp: new Date().toISOString(),
    });

    this.save();
    return { success: true, message: 'Match flagged for review', match };
  }

  reset() {
    this.seedDefaultData();
    this.save();
  }
}

export const clientStore = new ClientStore();
