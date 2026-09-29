import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { store } from '../services/store';
import { orchestrator } from '../ai/orchestrator';
import { normalizeMaterialDescription } from '../ai/normalizer';
import { extractSpecifications } from '../ai/specificationExtractor';
import { Material } from '../models/types';

const router = Router();
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB limit
const JWT_SECRET = process.env.JWT_SECRET || 'sih-cpcl-secret-2026';

// Middleware for JWT verification
function authenticate(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demo ease, default to Demo User if no token is sent, or verify token
    (req as any).user = {
      id: 'usr-admin-1',
      name: 'Demo User (National Material Governance)',
      email: 'admin@demo.local',
      role: 'ADMIN',
      cpse: 'National Material Governance',
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    // If token invalid, fall back gracefully to expert demo user for demo continuity
    (req as any).user = {
      id: 'usr-expert-1',
      name: 'Demo User (Material Expert)',
      email: 'expert@demo.local',
      role: 'MATERIAL_EXPERT',
      cpse: 'CPCL Demo Dataset',
    };
    next();
  }
}

// 1. POST /api/auth/login
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email
  const user = Array.from(store.users.values()).find(
    u => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Use demo accounts provided.' });
  }

  // Check password (allow bypass for empty/demo password 'sih2026' or check hash)
  const isMatch = password === 'sih2026' || bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid password. Default demo password is "sih2026"' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cpse: user.cpse,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cpse: user.cpse,
    },
  });
});

// 2. GET /api/dashboard/stats
router.get('/dashboard/stats', (_req: Request, res: Response) => {
  const stats = store.getDashboardStats();
  res.json(stats);
});

// 3. GET /api/cpses
router.get('/cpses', (_req: Request, res: Response) => {
  res.json(Array.from(store.cpses.values()));
});

// 4. GET /api/materials
router.get('/materials', (req: Request, res: Response) => {
  const { cpse, category, status, search, limit = '100', page = '1' } = req.query;

  let materials = Array.from(store.materials.values());

  if (cpse && cpse !== 'ALL') {
    materials = materials.filter(m => m.cpseCode === cpse);
  }

  if (category && category !== 'ALL') {
    materials = materials.filter(m => m.category === category);
  }

  if (status && status !== 'ALL') {
    materials = materials.filter(m => m.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    materials = materials.filter(
      m =>
        m.materialCode.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.normalizedDescription.toLowerCase().includes(q) ||
        (m.specifications.material && m.specifications.material.toLowerCase().includes(q)) ||
        (m.specifications.grade && m.specifications.grade.toLowerCase().includes(q))
    );
  }

  const total = materials.length;
  const p = parseInt(page as string, 10) || 1;
  const lim = parseInt(limit as string, 10) || 100;
  const start = (p - 1) * lim;
  const paginated = materials.slice(start, start + lim);

  res.json({
    data: paginated,
    total,
    page: p,
    limit: lim,
    totalPages: Math.ceil(total / lim),
  });
});

// 5. GET /api/materials/:id
router.get('/materials/:id', (req: Request, res: Response) => {
  const queryParam = req.params.id;
  const material =
    store.materials.get(queryParam) ||
    Array.from(store.materials.values()).find(m => m.materialCode === queryParam);

  if (!material) {
    return res.status(404).json({ error: 'Material not found' });
  }

  // Also include any existing matches for this material
  const relatedMatches = Array.from(store.matches.values()).filter(
    m => m.materialAId === material.id || m.materialBId === material.id
  );

  res.json({
    material,
    matches: relatedMatches,
  });
});

// 6. POST /api/materials/upload (Supports CSV & XLSX via Multer)
router.post('/materials/upload', upload.single('file'), (req: Request, res: Response) => {
  const cpseCode = (req.body.cpseCode || 'CPCL').toUpperCase();
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded. Please upload a CSV or XLSX file.' });
  }

  const originalName = file.originalname.toLowerCase();
  let rows: any[] = [];

  try {
    if (originalName.endsWith('.csv')) {
      const csvText = file.buffer.toString('utf-8');
      const parseResult = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      rows = parseResult.data;
    } else if (originalName.endsWith('.xlsx') || originalName.endsWith('.xls')) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const firstSheet = workbook.SheetNames[0];
      rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload .csv or .xlsx' });
    }
  } catch (err: any) {
    return res.status(400).json({ error: `File parsing error: ${err.message}` });
  }

  if (!rows || rows.length === 0) {
    return res.status(400).json({ error: 'Uploaded file contains no data rows.' });
  }

  let validRecords = 0;
  let invalidRecords = 0;
  const warnings: string[] = [];
  const insertedMaterials: Material[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // Support various column header conventions
    const materialCode = row['Material Code'] || row['material_code'] || row['Code'] || row['Item Code'] || `GEN-${Date.now()}-${i + 1}`;
    const description = row['Description'] || row['description'] || row['Material Description'] || row['Item Description'];
    const category = row['Category'] || row['category'] || 'General Fasteners & Piping';
    const subcategory = row['Subcategory'] || row['subcategory'] || '';
    const unit = row['Unit'] || row['unit'] || row['UOM'] || 'NOS';
    const manufacturer = row['Manufacturer'] || row['manufacturer'] || 'OEM';
    const partNumber = row['Part Number'] || row['part_number'] || '';

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      invalidRecords++;
      warnings.push(`Row ${i + 1}: Missing material description. Skipped.`);
      continue;
    }

    // Process with AI Normalizer and Specification Extractor
    const norm = normalizeMaterialDescription(description);
    const specs = extractSpecifications(norm.normalized);

    const id = `mat-up-${Date.now()}-${i}`;
    const material: Material = {
      id,
      cpseId: `cpse-${cpseCode.toLowerCase()}`,
      cpseCode,
      materialCode: String(materialCode).trim(),
      description: description.trim(),
      normalizedDescription: norm.normalized,
      category: String(category).trim(),
      subcategory: String(subcategory).trim(),
      unit: String(unit).trim().toUpperCase(),
      manufacturer: String(manufacturer).trim(),
      partNumber: String(partNumber).trim(),
      specifications: specs,
      status: 'UNMAPPED',
      createdAt: new Date().toISOString(),
    };

    store.materials.set(id, material);
    insertedMaterials.push(material);
    validRecords++;
  }

  // Audit log
  store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: 'usr-uploader',
    userName: req.body.uploadedBy || 'Material Data Officer',
    entityType: 'DATA_UPLOAD',
    entityId: `upload-${Date.now()}`,
    action: `Ingested ${validRecords} records from ${file.originalname} for CPSE: ${cpseCode}`,
    oldValue: 'None',
    newValue: `${validRecords} valid, ${invalidRecords} skipped`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    recordsUploaded: rows.length,
    validRecords,
    invalidRecords,
    warnings,
    samplePreview: insertedMaterials.slice(0, 5),
  });
});

// 7. POST /api/matching/run/:materialId (Runs AI Matching on source material against the CPSE pool)
router.post('/matching/run/:materialId', (req: Request, res: Response) => {
  const queryParam = req.params.materialId;
  const source =
    store.materials.get(queryParam) ||
    Array.from(store.materials.values()).find(m => m.materialCode === queryParam);

  if (!source) {
    return res.status(404).json({ error: 'Source material not found' });
  }

  const pool = Array.from(store.materials.values());
  const candidateResults = orchestrator.matchMaterial(source, pool, {
    limit: 12,
    minScore: 15,
    excludeSameCpse: false,
  });

  // Persist high quality candidates to store.matches if not already present
  for (const cr of candidateResults) {
    const matchId = `match-${cr.sourceMaterialId}-${cr.candidateMaterialId}`;
    if (!store.matches.has(matchId)) {
      const matchRecord = {
        id: matchId,
        materialAId: cr.sourceMaterialId,
        materialBId: cr.candidateMaterialId,
        sourceCode: cr.sourceCode,
        candidateCode: cr.candidateCode,
        sourceCpse: cr.sourceCpse,
        candidateCpse: cr.candidateCpse,
        sourceDescription: cr.sourceDescription,
        candidateDescription: cr.candidateDescription,
        sourceSpecs: cr.sourceSpecs,
        candidateSpecs: cr.candidateSpecs,
        semanticScore: cr.scoreBreakdown.semanticScore,
        specificationScore: cr.scoreBreakdown.specificationScore,
        attributeScore: cr.scoreBreakdown.materialGradeScore,
        metadataScore: cr.scoreBreakdown.metadataScore,
        finalScore: cr.confidence,
        matchType: cr.matchType,
        explanation: cr.explanation,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
      };
      store.matches.set(matchId, matchRecord);
    }
  }

  res.json({
    sourceMaterial: source,
    candidates: candidateResults,
  });
});

// 8. GET /api/matching/:materialId (Retrieves cached or computed matches for source material)
router.get('/matching/:materialId', (req: Request, res: Response) => {
  const queryParam = req.params.materialId;
  const source =
    store.materials.get(queryParam) ||
    Array.from(store.materials.values()).find(m => m.materialCode === queryParam);

  if (!source) {
    return res.status(404).json({ error: 'Material not found' });
  }

  const pool = Array.from(store.materials.values());
  const candidateResults = orchestrator.matchMaterial(source, pool, {
    limit: 10,
    minScore: 15,
  });

  res.json({
    sourceMaterial: source,
    candidates: candidateResults,
  });
});

// 9. GET /api/matches (Lists all matches with filtering by status and matchType)
router.get('/matches', (req: Request, res: Response) => {
  const { status, matchType } = req.query;

  let matches = Array.from(store.matches.values());

  if (status && status !== 'ALL') {
    matches = matches.filter(m => m.status === status);
  }

  if (matchType && matchType !== 'ALL') {
    matches = matches.filter(m => m.matchType === matchType);
  }

  // Sort descending by score
  matches.sort((a, b) => b.finalScore - a.finalScore);

  res.json(matches);
});

// 10. POST /api/matches/:id/approve (Human Validation: Approve Match & create/assign National Material Code)
router.post('/matches/:id/approve', authenticate, (req: Request, res: Response) => {
  const { comments, nationalCode } = req.body;
  const reviewer = (req as any).user?.name || 'CPSE Material Expert';

  try {
    const result = store.approveMatch(req.params.id, reviewer, comments, nationalCode);
    res.json({
      success: true,
      message: `Match approved successfully. Assigned National Material Code: ${result.nationalMaterial.nationalCode}`,
      ...result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 11. POST /api/matches/:id/reject
router.post('/matches/:id/reject', authenticate, (req: Request, res: Response) => {
  const { comments } = req.body;
  const reviewer = (req as any).user?.name || 'CPSE Material Expert';

  try {
    const updated = store.rejectMatch(req.params.id, reviewer, comments);
    res.json({
      success: true,
      message: 'Match recommendation rejected.',
      match: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 12. POST /api/matches/:id/review (Needs Review)
router.post('/matches/:id/review', authenticate, (req: Request, res: Response) => {
  const { comments } = req.body;
  const reviewer = (req as any).user?.name || 'CPSE Material Expert';

  try {
    const updated = store.markNeedsReview(req.params.id, reviewer, comments);
    res.json({
      success: true,
      message: 'Match flagged for detailed engineering review.',
      match: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 13. GET /api/national-materials
router.get('/national-materials', (req: Request, res: Response) => {
  const { search, category } = req.query;
  let items = Array.from(store.nationalMaterials.values());

  if (category && category !== 'ALL') {
    items = items.filter(nm => nm.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    items = items.filter(
      nm =>
        nm.nationalCode.toLowerCase().includes(q) ||
        nm.standardDescription.toLowerCase().includes(q) ||
        nm.sourceCpseList.some(c => c.toLowerCase().includes(q))
    );
  }

  res.json(items);
});

// 14. GET /api/national-materials/:id
router.get('/national-materials/:id', (req: Request, res: Response) => {
  const nationalMat =
    store.nationalMaterials.get(req.params.id) ||
    Array.from(store.nationalMaterials.values()).find(nm => nm.nationalCode === req.params.id);

  if (!nationalMat) {
    return res.status(404).json({ error: 'National material record not found' });
  }

  // Fetch all mapped materials for this NMC
  const relatedMappings = Array.from(store.mappings.values()).filter(
    m => m.nationalCode === nationalMat.nationalCode
  );

  const mappedMaterialDetails = relatedMappings.map(m => {
    const originalMat = store.materials.get(m.materialId);
    return {
      mapping: m,
      material: originalMat,
    };
  });

  res.json({
    nationalMaterial: nationalMat,
    mappings: mappedMaterialDetails,
  });
});

// 15. POST /api/national-materials (Create standalone National Material Code)
router.post('/national-materials', authenticate, (req: Request, res: Response) => {
  const { standardDescription, category, subcategory, specifications } = req.body;

  if (!standardDescription || !category) {
    return res.status(400).json({ error: 'Standard description and category are required' });
  }

  const nationalCode = store.generateNationalCode();
  const nationalMat = {
    id: `nm-${Date.now()}`,
    nationalCode,
    standardDescription: standardDescription.trim(),
    category: category.trim(),
    subcategory: subcategory?.trim(),
    specifications: specifications || extractSpecifications(standardDescription),
    status: 'ACTIVE' as const,
    mappedCount: 0,
    sourceCpseList: [],
    createdAt: new Date().toISOString(),
    approvedBy: (req as any).user?.name || 'Administrator',
  };

  store.nationalMaterials.set(nationalMat.id, nationalMat);

  store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: 'usr-admin',
    userName: (req as any).user?.name || 'Administrator',
    entityType: 'NATIONAL_MATERIAL',
    entityId: nationalMat.id,
    action: `Created National Material Master: ${nationalCode}`,
    newValue: standardDescription,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(nationalMat);
});

// 16. GET /api/mappings (Legacy CPSE Code -> National Material Code)
router.get('/mappings', (_req: Request, res: Response) => {
  const allMappings = Array.from(store.mappings.values());

  const enrichedMappings = allMappings.map(map => {
    const material = store.materials.get(map.materialId);
    const national = Array.from(store.nationalMaterials.values()).find(
      nm => nm.nationalCode === map.nationalCode
    );

    return {
      id: map.id,
      nationalCode: map.nationalCode,
      nationalDescription: national?.standardDescription || '',
      category: national?.category || material?.category || '',
      materialId: map.materialId,
      materialCode: map.materialCode,
      cpseCode: map.cpseCode,
      originalDescription: material?.description || '',
      normalizedDescription: material?.normalizedDescription || '',
      mappingType: map.mappingType,
      confidence: map.confidence,
      approvedBy: map.approvedBy,
      approvedAt: map.approvedAt,
    };
  });

  res.json(enrichedMappings);
});

// 17. GET /api/audit-logs
router.get('/audit-logs', (_req: Request, res: Response) => {
  res.json(store.auditLogs);
});

// 18. POST /api/demo/reset (Resets catalog to initial SIH demonstration state)
router.post('/demo/reset', (_req: Request, res: Response) => {
  store.seedInitialData();
  res.json({
    success: true,
    message: 'SIH Demo environment reset to pristine state with 5 CPSE catalogs and pre-evaluated cases.',
  });
});

// 19. GET /api/sample-csv (Sample CSV download)
router.get('/sample-csv', (_req: Request, res: Response) => {
  const sampleCSV = `Material Code,Description,Category,Subcategory,Unit,Manufacturer,Part Number
CPCL-BLT-001,SS304 HEX BOLT M10 X 50,Fasteners,Bolts,NOS,Unbrako,UNB-1050
CPCL-VLV-101,GATE VALVE 2 INCH CLASS 150# FLANGED RF WCB BODY,Valves,Gate Valves,NOS,L&T Valves,LNT-GV-2-150
CPCL-PIP-010,SEAMLESS PIPE 4 INCH SCH 40 ASTM A106 GR B,Piping,Carbon Steel Pipes,MTR,Jindal,JIN-CS-4-40
CPCL-FLG-001,WNRF FLANGE 3 INCH CLASS 150# SCH 40 ASTM A105,Piping,Flanges,NOS,Metalfar,MF-WNRF-3
CPCL-GSK-001,SPIRAL WOUND GASKET 2 INCH CLASS 150# SS304 WITH GRAPHITE FILLER,Gaskets,Metallic,NOS,Klinger,KLG-SP-2-150`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sample_cpse_material_master.csv"');
  res.send(sampleCSV);
});

export default router;
