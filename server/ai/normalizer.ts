/**
 * AI Material Understanding & Normalization Module
 * Normalizes CPSE raw descriptions, standardizes abbreviations, units, and dimension symbols.
 */

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

  // 1. Whitespace & delimiter cleanup
  const cleanSeparators = text.replace(/[\t\r\n]+/g, ' ').replace(/\s{2,}/g, ' ');
  if (cleanSeparators !== text) {
    text = cleanSeparators;
  }

  // 2. Unit Normalization FIRST (so dimension symbols can format units properly)
  // Millimeters: 10MM, 10 MM, 10 MILLIMETER -> 10 mm
  const mmRegex = /\b(\d+(?:\.\d+)?)\s*(?:MM|MILLIMETER|MILLIMETRE|MILLIMETERS)\b/gi;
  if (mmRegex.test(text)) {
    text = text.replace(mmRegex, (match, val) => {
      transformations.push(`Normalized unit: "${match}" → "${val} mm"`);
      return `${val} mm`;
    });
  }

  // Centimeters
  const cmRegex = /\b(\d+(?:\.\d+)?)\s*(?:CM|CENTIMETER|CENTIMETRE)\b/gi;
  if (cmRegex.test(text)) {
    text = text.replace(cmRegex, (match, val) => {
      transformations.push(`Normalized unit: "${match}" → "${val} cm"`);
      return `${val} cm`;
    });
  }

  // Meters
  const mRegex = /\b(\d+(?:\.\d+)?)\s*(?:MTR|MTRS|METER|METERS|METRE)\b/gi;
  if (mRegex.test(text)) {
    text = text.replace(mRegex, (match, val) => {
      transformations.push(`Normalized unit: "${match}" → "${val} m"`);
      return `${val} m`;
    });
  }

  // Kilograms
  const kgRegex = /\b(\d+(?:\.\d+)?)\s*(?:KG|KGS|KILOGRAM|KILOGRAMS)\b/gi;
  if (kgRegex.test(text)) {
    text = text.replace(kgRegex, (match, val) => {
      transformations.push(`Normalized unit: "${match}" → "${val} kg"`);
      return `${val} kg`;
    });
  }

  // Inches (2", 2 INCH, 2 INCHES, 3/4", 3/4 INCH -> 2 inch)
  const inchRegex = /\b(\d+(?:\/\d+)?|\d+(?:\.\d+)?)\s*(?:INCH|INCHES|IN)\b|(\d+(?:\/\d+)?|\d+(?:\.\d+)?)\s*\"/gi;
  if (inchRegex.test(text)) {
    text = text.replace(inchRegex, (match, g1, g2) => {
      const val = g1 || g2;
      transformations.push(`Normalized unit: "${match}" → "${val} inch"`);
      return `${val} inch`;
    });
  }

  // Pressure Class (e.g., 150#, 150 LBS, CLASS 150, CL 150)
  const classRegex = /\b(?:CLASS|CL\.?)\s*(\d+)\b|\b(\d+)\s*(?:#|LBS|LB)\b/gi;
  if (classRegex.test(text)) {
    text = text.replace(classRegex, (match, g1, g2) => {
      const rating = g1 || g2;
      transformations.push(`Standardized pressure class: "${match}" → "Class ${rating}#"`);
      return `Class ${rating}#`;
    });
  }

  // Schedule (e.g., SCH40, SCH 40, SCHEDULE 80)
  const schRegex = /\b(?:SCHEDULE|SCH\.?)\s*(\d+|XXS|XS|STD)\b/gi;
  if (schRegex.test(text)) {
    text = text.replace(schRegex, (match, schVal) => {
      transformations.push(`Standardized pipe schedule: "${match}" → "SCH ${schVal.toUpperCase()}"`);
      return `SCH ${schVal.toUpperCase()}`;
    });
  }

  // 3. Dimension symbol standardization (x, X, *, by, BY -> ×)
  const dimRegex = /(\d+(?:\.\d+)?(?:\s*mm|\s*cm|\s*m|\s*inch)?|\bM\d+)\s*(?:[xX\*]|(?:\s+by\s+)|\u00D7)\s*(\d+(?:\.\d+)?(?:\s*mm|\s*cm|\s*m|\s*inch)?)/gi;
  if (dimRegex.test(text)) {
    text = text.replace(dimRegex, (match, p1, p2) => {
      transformations.push(`Standardized dimension separator: "${match}" → "${p1} × ${p2}"`);
      return `${p1} × ${p2}`;
    });
  }

  // 4. Material abbreviations expansion (carefully preserving specific grades like SS304)
  const ssGradeRegex = /\b(?:S\.S\.?|SS)\s*[- ]?\s*(304L|304H|304|316L|316H|316|321|347|410)\b/gi;
  if (ssGradeRegex.test(text)) {
    text = text.replace(ssGradeRegex, (match, grade) => {
      const gUpper = `SS${grade.toUpperCase()}`;
      transformations.push(`Normalized grade & material: "${match}" → "Stainless Steel ${gUpper}"`);
      return `Stainless Steel ${gUpper}`;
    });
  }

  // Standalone SS (when not already Stainless Steel)
  const standaloneSSRegex = /\b(?:S\.S\.?|SS)\b(?!\s*3\d{2})/gi;
  if (standaloneSSRegex.test(text) && !/Stainless\s+Steel/i.test(text)) {
    text = text.replace(standaloneSSRegex, match => {
      transformations.push(`Expanded abbreviation: "${match}" → "Stainless Steel"`);
      return `Stainless Steel`;
    });
  }

  // Carbon Steel (CS, C.S.)
  const csRegex = /\b(?:C\.S\.?|CS)\b(?!\s*\d)/gi;
  if (csRegex.test(text) && !/Carbon\s+Steel/i.test(text)) {
    text = text.replace(csRegex, match => {
      transformations.push(`Expanded abbreviation: "${match}" → "Carbon Steel"`);
      return `Carbon Steel`;
    });
  }

  // Mild Steel (MS, M.S.)
  const msRegex = /\b(?:M\.S\.?|MS)\b(?!\s*\d)/gi;
  if (msRegex.test(text) && !/Mild\s+Steel/i.test(text)) {
    text = text.replace(msRegex, match => {
      transformations.push(`Expanded abbreviation: "${match}" → "Mild Steel"`);
      return `Mild Steel`;
    });
  }

  // Cast Iron (CI, C.I.)
  const ciRegex = /\b(?:C\.I\.?|CI)\b/gi;
  if (ciRegex.test(text) && !/Cast\s+Iron/i.test(text)) {
    text = text.replace(ciRegex, match => {
      transformations.push(`Expanded abbreviation: "${match}" → "Cast Iron"`);
      return `Cast Iron`;
    });
  }

  // WCB / Cast Carbon Steel Body (Valve body material)
  if (/\b(?:WCB|A216\s*WCB|ASTM\s*A216\s*WCB)\b/i.test(text) && !/Carbon\s+Steel/i.test(text)) {
    text = text.replace(/\bWCB\b/i, 'Carbon Steel WCB');
  }

  // 5. Clean up redundant spaces
  const normalized = text.replace(/\s+/g, ' ').trim();

  // Extract clean tokens
  const rawTokens = normalized
    .toLowerCase()
    .replace(/[\u00D7,\(\)\[\]"']/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0 && !['and', 'with', 'for', 'the', 'of', 'in', 'body', 'trim'].includes(t));

  // Expand token synonyms for semantic alignment (e.g. m10 -> [m10, 10, 10mm])
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
