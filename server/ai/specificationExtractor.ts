/**
 * AI Specification Extraction Module
 * Extracts structured engineering attributes from normalized material descriptions.
 */

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

export function extractSpecifications(normalizedText: string): ExtractedSpecifications {
  const specs: ExtractedSpecifications = {
    additionalAttributes: {},
  };

  const text = normalizedText || '';

  // 1. Material Extraction
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

  // 2. Material Grade Extraction
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

  // 3. Equipment / Item Type Extraction
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
    { regex: /\b(?:CONCENTRIC\s*REDUCER|CONC\s*REDUCER)\b/i, type: 'Concentric Reducer' },
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

  // 4. Dimensions: Diameter & Length
  // Metric bolts e.g. M10 x 50 or 10 mm x 50 mm or 10 mm × 50 mm
  const metricPattern = /\b(?:M)?(\d+)\s*(?:mm)?\s*(?:[×x\*]|\u00D7|\s+by\s+)\s*(\d+(?:\.\d+)?)\s*(?:mm)?\b/i;
  const metricMatch = text.match(metricPattern);
  if (metricMatch) {
    specs.diameter = `${metricMatch[1]} mm`;
    specs.length = `${metricMatch[2]} mm`;
    specs.size = `M${metricMatch[1]} × ${metricMatch[2]} mm`;
  } else {
    // Single M-size
    const singleM = text.match(/\bM(\d+)\b/i);
    if (singleM) {
      specs.diameter = `${singleM[1]} mm`;
    }
  }

  // Valve / Pipe sizes e.g. 2 inch, 2", 3/4 inch, 4 inch, DN50, 50 NB
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

  // 5. Pressure Rating / Class
  const classMatch = text.match(/\bClass\s*(\d+)#?\b|\b(\d+)\s*#\b|\bPN\s*(\d+)\b/i);
  if (classMatch) {
    if (classMatch[1] || classMatch[2]) {
      specs.pressureRating = `Class ${classMatch[1] || classMatch[2]}#`;
    } else if (classMatch[3]) {
      specs.pressureRating = `PN ${classMatch[3]}`;
    }
  }

  // 6. Pipe Schedule
  const schMatch = text.match(/\bSCH\s*(\d+|XXS|XS|STD)\b/i);
  if (schMatch) {
    specs.schedule = `SCH ${schMatch[1].toUpperCase()}`;
  }

  // 7. Standards (API 600, API 6D, ASME B16.5, ASME B16.9, ASTM A193, DIN 933)
  const stdMatch = text.match(/\b(API\s*600|API\s*6D|ASME\s*B16\.\d+|ASTM\s*A\d+|DIN\s*\d+|ISO\s*\d+|BS\s*\d+)\b/i);
  if (stdMatch) {
    specs.standard = stdMatch[1].toUpperCase();
  }

  // 8. End Connection
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
