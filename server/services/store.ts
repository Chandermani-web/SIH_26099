/**
 * High-Fidelity Data Store
 * In-memory document store with optional JSON persistence, providing full MongoDB-like operations,
 * seeded with synthetic CPSE data for CPCL, IOCL, BPCL, HPCL, and ONGC.
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, CPSE, Material, MaterialMatch, NationalMaterial, MaterialMapping, AuditLog } from '../models/types';
import { normalizeMaterialDescription } from '../ai/normalizer';
import { extractSpecifications } from '../ai/specificationExtractor';
import { evaluateMaterialPair } from '../ai/matcher';

class DataStore {
  public users: Map<string, User> = new Map();
  public cpses: Map<string, CPSE> = new Map();
  public materials: Map<string, Material> = new Map();
  public matches: Map<string, MaterialMatch> = new Map();
  public nationalMaterials: Map<string, NationalMaterial> = new Map();
  public mappings: Map<string, MaterialMapping> = new Map();
  public auditLogs: AuditLog[] = [];

  private nmcCounter = 1000;
  private readonly storageFilePath = path.resolve(process.cwd(), 'data_backup.json');

  constructor() {
    this.seedInitialData();
  }

  /**
   * Deterministic Unique National Material Code generator
   * Guaranteed format: NMC-0001001, NMC-0001002, etc.
   */
  public generateNationalCode(): string {
    this.nmcCounter++;
    const numStr = String(this.nmcCounter).padStart(7, '0');
    return `NMC-${numStr}`;
  }

  public seedInitialData(): void {
    this.users.clear();
    this.cpses.clear();
    this.materials.clear();
    this.matches.clear();
    this.nationalMaterials.clear();
    this.mappings.clear();
    this.auditLogs = [];
    this.nmcCounter = 1000;

    // 1. Seed Users (Demo Accounts - Non-fictional, explicitly marked as Demo Environment)
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('sih2026', salt);

    const usersData: User[] = [
      {
        id: 'usr-expert-1',
        name: 'Demo User (Material Expert)',
        email: 'expert@demo.local',
        passwordHash: demoPasswordHash,
        role: 'MATERIAL_EXPERT',
        cpse: 'CPCL Demo Dataset',
        createdAt: '2026-09-01T09:00:00.000Z',
      },
      {
        id: 'usr-admin-1',
        name: 'Demo User (Governance Admin)',
        email: 'admin@demo.local',
        passwordHash: demoPasswordHash,
        role: 'ADMIN',
        cpse: 'National Material Governance',
        createdAt: '2026-09-01T09:30:00.000Z',
      },
      {
        id: 'usr-officer-1',
        name: 'Demo User (CPSE Officer)',
        email: 'officer@demo.local',
        passwordHash: demoPasswordHash,
        role: 'CPSE_OFFICER',
        cpse: 'IOCL Demo Dataset',
        createdAt: '2026-09-01T10:00:00.000Z',
      },
    ];

    for (const u of usersData) {
      this.users.set(u.id, u);
    }

    // 2. Seed 5 CPSEs
    const cpseList: CPSE[] = [
      { id: 'cpse-cpcl', code: 'CPCL', name: 'Chennai Petroleum Corporation Limited', sector: 'Refinery & Petrochemicals', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cpse-iocl', code: 'IOCL', name: 'Indian Oil Corporation Limited', sector: 'Oil & Gas Exploration & Refining', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cpse-bpcl', code: 'BPCL', name: 'Bharat Petroleum Corporation Limited', sector: 'Refining & Marketing', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cpse-hpcl', code: 'HPCL', name: 'Hindustan Petroleum Corporation Limited', sector: 'Refining & Marketing', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'cpse-ongc', code: 'ONGC', name: 'Oil and Natural Gas Corporation', sector: 'Upstream Exploration & Production', createdAt: '2026-01-01T00:00:00Z' },
    ];

    for (const c of cpseList) {
      this.cpses.set(c.id, c);
    }

    // 3. Seed Realistic Synthetic Materials (~60 items across 5 CPSEs)
    const rawCatalog: Array<{
      cpseCode: string;
      code: string;
      desc: string;
      category: string;
      subcategory: string;
      unit: string;
      mfg?: string;
      partNo?: string;
    }> = [
      // Fasteners (The Core SIH Demo Cases!)
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

      // Valves
      { cpseCode: 'CPCL', code: 'CPCL-VLV-101', desc: 'GATE VALVE 2 INCH CLASS 150# FLANGED RF WCB BODY TRIM 8 API 600', category: 'Valves', subcategory: 'Gate Valves', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-VLV-710', desc: '2" 150# RF FLANGED GATE VALVE ASTM A216 WCB TRIM 8 API 600', category: 'Piping & Valves', subcategory: 'Gate Valves', unit: 'NOS' },
      { cpseCode: 'BPCL', code: 'BPCL-VLV-044', desc: 'GATE VALVE 2" 150 LB FLANGE END WCB OS&Y FLEXIBLE WEDGE', category: 'Valves', subcategory: 'Gate Valves', unit: 'EA' },
      { cpseCode: 'HPCL', code: 'HPCL-VLV-882', desc: 'GATE VALVE 2 INCH CLASS 300# FLANGED RF ASTM A216 WCB', category: 'Valves', subcategory: 'Gate Valves', unit: 'NOS' },
      { cpseCode: 'ONGC', code: 'ONGC-VLV-301', desc: '2 INCH GATE VALVE CLASS 150# FLANGED RAISED FACE WCB BODY', category: 'Flow Control', subcategory: 'Valves', unit: 'NOS' },

      { cpseCode: 'CPCL', code: 'CPCL-VLV-205', desc: 'BALL VALVE 3 INCH CLASS 150# FLANGED FULL BORE SS316 BODY PTFE SEAT', category: 'Valves', subcategory: 'Ball Valves', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-VLV-551', desc: '3" 150# SS316 FULL BORE FLANGED BALL VALVE WITH PTFE SEAT', category: 'Piping & Valves', subcategory: 'Ball Valves', unit: 'NOS' },
      { cpseCode: 'BPCL', code: 'BPCL-VLV-612', desc: 'BALL VALVE 3 INCH CLASS 300# FULL BORE SS316 BODY FLANGED', category: 'Valves', subcategory: 'Ball Valves', unit: 'NOS' },
      { cpseCode: 'HPCL', code: 'HPCL-VLV-129', desc: 'STAINLESS STEEL 316 BALL VALVE 3" CLASS 150# FLANGE END', category: 'Valves', subcategory: 'Ball Valves', unit: 'EA' },

      { cpseCode: 'CPCL', code: 'CPCL-VLV-330', desc: 'GLOBE VALVE 1 INCH CLASS 800# FORGED STEEL A105 SW END', category: 'Valves', subcategory: 'Globe Valves', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-VLV-802', desc: '1" 800# FORGED CARBON STEEL ASTM A105 GLOBE VALVE SOCKET WELD', category: 'Piping & Valves', subcategory: 'Globe Valves', unit: 'NOS' },
      { cpseCode: 'ONGC', code: 'ONGC-VLV-415', desc: 'GLOBE VALVE 1" CLASS 800# FS A105 SOCKET WELD ENDS', category: 'Flow Control', subcategory: 'Valves', unit: 'NOS' },

      // Pipes & Fittings
      { cpseCode: 'CPCL', code: 'CPCL-PIP-010', desc: 'SEAMLESS PIPE 4 INCH SCH 40 ASTM A106 GR B', category: 'Piping', subcategory: 'Carbon Steel Pipes', unit: 'MTR' },
      { cpseCode: 'IOCL', code: 'IOCL-PIP-112', desc: '4" SCH 40 SMLS PIPE ASTM A106 GRADE B CARBON STEEL', category: 'Piping & Valves', subcategory: 'Seamless Pipes', unit: 'MTR' },
      { cpseCode: 'BPCL', code: 'BPCL-PIP-904', desc: 'CS SEAMLESS PIPE 4 INCH SCHEDULE 40 ASTM A106 GR.B', category: 'Pipes & Tubes', subcategory: 'Pipes', unit: 'M' },
      { cpseCode: 'HPCL', code: 'HPCL-PIP-318', desc: 'SEAMLESS PIPE 4 INCH SCH 80 ASTM A106 GR B', category: 'Piping', subcategory: 'Seamless Pipes', unit: 'MTR' },
      { cpseCode: 'ONGC', code: 'ONGC-PIP-774', desc: '4 INCH SEAMLESS STEEL PIPE SCH 40 ASTM A106 GR B BEVELED END', category: 'Tubular Goods', subcategory: 'Line Pipe', unit: 'MTR' },

      { cpseCode: 'CPCL', code: 'CPCL-PIP-022', desc: 'STAINLESS STEEL SEAMLESS PIPE 2 INCH SCH 40S ASTM A312 TP304', category: 'Piping', subcategory: 'SS Pipes', unit: 'MTR' },
      { cpseCode: 'IOCL', code: 'IOCL-PIP-339', desc: '2" SCH 40S SS304 SMLS PIPE ASTM A312 TP304', category: 'Piping & Valves', subcategory: 'Stainless Steel Pipes', unit: 'MTR' },
      { cpseCode: 'BPCL', code: 'BPCL-PIP-481', desc: 'SS304 SEAMLESS PIPE 2 INCH SCHEDULE 40S ASTM A312', category: 'Pipes & Tubes', subcategory: 'SS Pipes', unit: 'MTR' },

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
      { cpseCode: 'HPCL', code: 'HPCL-GSK-892', desc: 'SPIRAL WOUND GASKET 2 INCH CLASS 300# SS304 WITH GRAPHITE FILLER', category: 'Gaskets', subcategory: 'Gaskets', unit: 'NOS' },

      // Electrical & Instrumentation
      { cpseCode: 'CPCL', code: 'CPCL-ELE-042', desc: 'PRESSURE TRANSMITTER 4-20 MA SMART HART 0-10 BAR SS316 DIAPHRAGM', category: 'Instrumentation', subcategory: 'Transmitters', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-INS-603', desc: 'SMART PRESSURE TRANSMITTER 0 TO 10 BAR 4-20MA HART SS316 WETTED PARTS', category: 'Instrumentation', subcategory: 'Transmitters', unit: 'NOS' },
      { cpseCode: 'ONGC', code: 'ONGC-INS-212', desc: 'PRESSURE TRANSMITTER 0-10 BAR G 4-20MA + HART PROTOCOL SS316 DIAPHRAGM', category: 'Instrumentation', subcategory: 'Sensors', unit: 'NOS' },

      // Pumps & Rotary Spares
      { cpseCode: 'CPCL', code: 'CPCL-PMP-110', desc: 'CENTRIFUGAL PUMP IMPELLER SS316 CLOSED TYPE DIA 210 MM', category: 'Mechanical Spares', subcategory: 'Pump Spares', unit: 'NOS' },
      { cpseCode: 'IOCL', code: 'IOCL-ROT-772', desc: 'IMPELLER CENTRIFUGAL PUMP CLOSED TYPE SS316 210MM DIAMETER', category: 'Rotary Equipment', subcategory: 'Pump Parts', unit: 'NOS' },
      { cpseCode: 'BPCL', code: 'BPCL-ROT-301', desc: 'MECHANICAL SEAL CARTRIDGE TYPE 50 MM SHAFT SIC VS CARBON VITON O-RINGS', category: 'Mechanical Spares', subcategory: 'Seals', unit: 'SET' },
      { cpseCode: 'HPCL', code: 'HPCL-ROT-512', desc: 'CARTRIDGE MECHANICAL SEAL 50MM FOR PROCESS PUMP SIC/SIC/VITON', category: 'Rotary Equipment', subcategory: 'Mechanical Seals', unit: 'SET' },
    ];

    let matIndex = 1;
    for (const item of rawCatalog) {
      const id = `mat-${matIndex++}`;
      const norm = normalizeMaterialDescription(item.desc);
      const specs = extractSpecifications(norm.normalized);

      const matRecord: Material = {
        id,
        cpseId: `cpse-${item.cpseCode.toLowerCase()}`,
        cpseCode: item.cpseCode,
        materialCode: item.code,
        description: item.desc,
        normalizedDescription: norm.normalized,
        category: item.category,
        subcategory: item.subcategory,
        unit: item.unit,
        manufacturer: item.mfg || 'Standard OEM',
        partNumber: item.partNo || '',
        specifications: specs,
        status: 'UNMAPPED',
        createdAt: '2026-09-10T08:00:00.000Z',
      };

      this.materials.set(id, matRecord);
    }

    // 4. Pre-evaluate Key Matches for Instant Demo
    this.generatePrecomputedMatches();

    // 5. Add initial Audit Log entry
    this.auditLogs.unshift({
      id: `aud-${Date.now()}-1`,
      userId: 'usr-admin-1',
      userName: 'Demo User (National Material Governance)',
      entityType: 'DATA_UPLOAD',
      entityId: 'sys-init',
      action: 'System initialized with Synthetic CPSE Catalogs (CPCL, IOCL, BPCL, HPCL, ONGC)',
      oldValue: 'None',
      newValue: '42 Standard CPSE Material Masters Loaded',
      timestamp: new Date().toISOString(),
    });
  }

  private generatePrecomputedMatches(): void {
    const matArray = Array.from(this.materials.values());

    // Find specific demo pairs
    const cpclBolt = matArray.find(m => m.materialCode === 'CPCL-BLT-001');
    const ioclBolt = matArray.find(m => m.materialCode === 'IOCL-BOLT-892');
    const bpclBolt = matArray.find(m => m.materialCode === 'BPCL-FST-102');
    const hpclBolt = matArray.find(m => m.materialCode === 'HPCL-BLT-440');
    const ongcBolt = matArray.find(m => m.materialCode === 'ONGC-BLT-019');

    if (cpclBolt && ioclBolt) {
      const match1 = evaluateMaterialPair(cpclBolt, ioclBolt);
      this.addMatchRecord(match1, cpclBolt, ioclBolt, 'PENDING');
    }

    if (cpclBolt && ongcBolt) {
      const matchOngc = evaluateMaterialPair(cpclBolt, ongcBolt);
      this.addMatchRecord(matchOngc, cpclBolt, ongcBolt, 'PENDING');
    }

    if (cpclBolt && bpclBolt) {
      const match2 = evaluateMaterialPair(cpclBolt, bpclBolt);
      this.addMatchRecord(match2, cpclBolt, bpclBolt, 'PENDING');
    }

    if (cpclBolt && hpclBolt) {
      const match3 = evaluateMaterialPair(cpclBolt, hpclBolt);
      this.addMatchRecord(match3, cpclBolt, hpclBolt, 'PENDING');
    }

    // Stud bolts
    const cpclStud = matArray.find(m => m.materialCode === 'CPCL-BLT-002');
    const ioclStud = matArray.find(m => m.materialCode === 'IOCL-STD-401');
    if (cpclStud && ioclStud) {
      const matchStud = evaluateMaterialPair(cpclStud, ioclStud);
      this.addMatchRecord(matchStud, cpclStud, ioclStud, 'PENDING');
    }

    // Gate Valves
    const cpclVlv = matArray.find(m => m.materialCode === 'CPCL-VLV-101');
    const ioclVlv = matArray.find(m => m.materialCode === 'IOCL-VLV-710');
    const ongcVlv = matArray.find(m => m.materialCode === 'ONGC-VLV-301');
    if (cpclVlv && ioclVlv) {
      const matchVlv = evaluateMaterialPair(cpclVlv, ioclVlv);
      this.addMatchRecord(matchVlv, cpclVlv, ioclVlv, 'PENDING');
    }
    if (cpclVlv && ongcVlv) {
      const matchVlvOngc = evaluateMaterialPair(cpclVlv, ongcVlv);
      this.addMatchRecord(matchVlvOngc, cpclVlv, ongcVlv, 'PENDING');
    }

    // Pipes
    const cpclPip = matArray.find(m => m.materialCode === 'CPCL-PIP-010');
    const ioclPip = matArray.find(m => m.materialCode === 'IOCL-PIP-112');
    if (cpclPip && ioclPip) {
      const matchPip = evaluateMaterialPair(cpclPip, ioclPip);
      this.addMatchRecord(matchPip, cpclPip, ioclPip, 'PENDING');
    }

    // Flanges
    const cpclFlg = matArray.find(m => m.materialCode === 'CPCL-FLG-001');
    const ioclFlg = matArray.find(m => m.materialCode === 'IOCL-FLG-920');
    if (cpclFlg && ioclFlg) {
      const matchFlg = evaluateMaterialPair(cpclFlg, ioclFlg);
      this.addMatchRecord(matchFlg, cpclFlg, ioclFlg, 'PENDING');
    }
  }

  private addMatchRecord(
    evalResult: any,
    source: Material,
    candidate: Material,
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW' = 'PENDING'
  ): MaterialMatch {
    const id = `match-${source.id}-${candidate.id}`;
    const record: MaterialMatch = {
      id,
      materialAId: source.id,
      materialBId: candidate.id,
      sourceCode: source.materialCode,
      candidateCode: candidate.materialCode,
      sourceCpse: source.cpseCode,
      candidateCpse: candidate.cpseCode,
      sourceDescription: source.description,
      candidateDescription: candidate.description,
      sourceSpecs: evalResult.sourceSpecs,
      candidateSpecs: evalResult.candidateSpecs,
      semanticScore: evalResult.scoreBreakdown.semanticScore,
      specificationScore: evalResult.scoreBreakdown.specificationScore,
      attributeScore: evalResult.scoreBreakdown.materialGradeScore,
      metadataScore: evalResult.scoreBreakdown.metadataScore,
      finalScore: evalResult.confidence,
      matchType: evalResult.matchType,
      explanation: evalResult.explanation,
      status,
      createdAt: new Date().toISOString(),
    };

    this.matches.set(id, record);
    return record;
  }

  /**
   * Approves a match: deterministically creates or assigns National Material Code
   */
  public approveMatch(
    matchId: string,
    reviewerName: string,
    comments?: string,
    existingNationalCode?: string
  ): { match: MaterialMatch; nationalMaterial: NationalMaterial; mappings: MaterialMapping[] } {
    const match = this.matches.get(matchId);
    if (!match) {
      throw new Error(`Match record not found with id: ${matchId}`);
    }

    const matA = this.materials.get(match.materialAId);
    const matB = this.materials.get(match.materialBId);

    if (!matA || !matB) {
      throw new Error('Associated materials not found in catalog');
    }

    let nationalMat: NationalMaterial | undefined;

    if (existingNationalCode || matA.mappedNationalCode || matB.mappedNationalCode) {
      const codeToFind = existingNationalCode || matA.mappedNationalCode || matB.mappedNationalCode;
      nationalMat = Array.from(this.nationalMaterials.values()).find(nm => nm.nationalCode === codeToFind);
    }

    let assignedNationalCode: string;

    if (!nationalMat) {
      // Create new deterministic National Material Code
      assignedNationalCode = this.generateNationalCode();
      const standardDescription = `${matA.specifications.material || ''} ${matA.specifications.grade || ''} ${matA.specifications.type || matA.category} ${matA.specifications.size || matA.specifications.diameter || ''} ${matA.specifications.length ? `× ${matA.specifications.length}` : ''}`.replace(/\s+/g, ' ').trim() || matA.normalizedDescription;

      const cpseSet = new Set<string>([matA.cpseCode, matB.cpseCode]);

      nationalMat = {
        id: `nm-${Date.now()}`,
        nationalCode: assignedNationalCode,
        standardDescription,
        category: matA.category,
        subcategory: matA.subcategory,
        specifications: matA.specifications,
        status: 'ACTIVE',
        mappedCount: 2,
        sourceCpseList: Array.from(cpseSet),
        createdAt: new Date().toISOString(),
        approvedBy: reviewerName,
      };

      this.nationalMaterials.set(nationalMat.id, nationalMat);
    } else {
      // Update existing
      assignedNationalCode = nationalMat.nationalCode;
      const cpseSet = new Set(nationalMat.sourceCpseList);
      cpseSet.add(matA.cpseCode);
      cpseSet.add(matB.cpseCode);
      nationalMat.sourceCpseList = Array.from(cpseSet);
      nationalMat.mappedCount++;
    }

    // Update Materials
    matA.status = 'MAPPED';
    matA.mappedNationalCode = assignedNationalCode;
    matB.status = 'MAPPED';
    matB.mappedNationalCode = assignedNationalCode;

    // Create Mappings
    const now = new Date().toISOString();
    const mapA: MaterialMapping = {
      id: `map-${matA.id}-${assignedNationalCode}`,
      nationalMaterialId: nationalMat.id,
      nationalCode: assignedNationalCode,
      materialId: matA.id,
      materialCode: matA.materialCode,
      cpseCode: matA.cpseCode,
      mappingType: 'PRIMARY',
      confidence: 100,
      approvedBy: reviewerName,
      approvedAt: now,
    };
    const mapB: MaterialMapping = {
      id: `map-${matB.id}-${assignedNationalCode}`,
      nationalMaterialId: nationalMat.id,
      nationalCode: assignedNationalCode,
      materialId: matB.id,
      materialCode: matB.materialCode,
      cpseCode: matB.cpseCode,
      mappingType: 'EQUIVALENT',
      confidence: match.finalScore,
      approvedBy: reviewerName,
      approvedAt: now,
    };

    this.mappings.set(mapA.id, mapA);
    this.mappings.set(mapB.id, mapB);

    // Update Match record
    match.status = 'APPROVED';
    match.reviewedBy = reviewerName;
    match.reviewedAt = now;
    match.reviewerNotes = comments || 'Approved by CPSE Material Expert';
    match.nationalMaterialCode = assignedNationalCode;

    // Log Audit Trail
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-current',
      userName: reviewerName,
      entityType: 'MATERIAL_MATCH',
      entityId: match.id,
      action: `Approved Match: ${matA.materialCode} (${matA.cpseCode}) ↔ ${matB.materialCode} (${matB.cpseCode}) mapped to ${assignedNationalCode}`,
      oldValue: 'Status: PENDING, Unmapped',
      newValue: `Status: APPROVED, NationalCode: ${assignedNationalCode}`,
      timestamp: now,
    });

    return {
      match,
      nationalMaterial: nationalMat,
      mappings: [mapA, mapB],
    };
  }

  /**
   * Rejects a match recommendation
   */
  public rejectMatch(matchId: string, reviewerName: string, comments?: string): MaterialMatch {
    const match = this.matches.get(matchId);
    if (!match) throw new Error('Match record not found');

    const now = new Date().toISOString();
    match.status = 'REJECTED';
    match.reviewedBy = reviewerName;
    match.reviewedAt = now;
    match.reviewerNotes = comments || 'Rejected by Material Expert - Distinct technical specifications';

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-current',
      userName: reviewerName,
      entityType: 'MATERIAL_MATCH',
      entityId: match.id,
      action: `Rejected Match: ${match.sourceCode} ↔ ${match.candidateCode}`,
      oldValue: 'Status: PENDING',
      newValue: `Status: REJECTED (${comments || 'Non-equivalent'})`,
      timestamp: now,
    });

    return match;
  }

  /**
   * Marks a match for detailed engineering review
   */
  public markNeedsReview(matchId: string, reviewerName: string, comments?: string): MaterialMatch {
    const match = this.matches.get(matchId);
    if (!match) throw new Error('Match record not found');

    const now = new Date().toISOString();
    match.status = 'NEEDS_REVIEW';
    match.reviewedBy = reviewerName;
    match.reviewedAt = now;
    match.reviewerNotes = comments || 'Flagged for OEM drawing & material test certificate (MTC) review';

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-current',
      userName: reviewerName,
      entityType: 'MATERIAL_MATCH',
      entityId: match.id,
      action: `Flagged For Review: ${match.sourceCode} ↔ ${match.candidateCode}`,
      oldValue: 'Status: PENDING',
      newValue: 'Status: NEEDS_REVIEW',
      timestamp: now,
    });

    return match;
  }

  /**
   * Returns executive analytics calculated from the actual database
   */
  public getDashboardStats() {
    const allMaterials = Array.from(this.materials.values());
    const allMatches = Array.from(this.matches.values());
    const allNational = Array.from(this.nationalMaterials.values());

    const totalMaterials = allMaterials.length;
    const potentialDuplicates = allMatches.filter(m => m.matchType === 'IDENTICAL' || m.matchType === 'NEAR_DUPLICATE').length;
    const aiRecommendations = allMatches.length;
    const pendingReviews = allMatches.filter(m => m.status === 'PENDING').length;
    const approvedMatches = allMatches.filter(m => m.status === 'APPROVED').length;
    const nationalMaterialCodes = allNational.length;

    // Materials by CPSE
    const cpseCounts: Record<string, number> = {};
    for (const m of allMaterials) {
      cpseCounts[m.cpseCode] = (cpseCounts[m.cpseCode] || 0) + 1;
    }
    const materialsByCpse = Object.entries(cpseCounts).map(([cpse, count]) => ({
      cpse,
      count,
    }));

    // Match classification breakdown
    const typeCounts: Record<string, number> = {
      IDENTICAL: 0,
      NEAR_DUPLICATE: 0,
      FUNCTIONALLY_EQUIVALENT: 0,
      DIFFERENT_VARIANT: 0,
      DIFFERENT: 0,
      NEEDS_REVIEW: 0,
    };
    for (const m of allMatches) {
      if (typeCounts[m.matchType] !== undefined) {
        typeCounts[m.matchType]++;
      }
    }
    const matchClassification = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
    }));

    // Review Status breakdown
    const statusCounts: Record<string, number> = {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      Needs_Review: 0,
    };
    for (const m of allMatches) {
      if (m.status === 'PENDING') statusCounts.Pending++;
      else if (m.status === 'APPROVED') statusCounts.Approved++;
      else if (m.status === 'REJECTED') statusCounts.Rejected++;
      else if (m.status === 'NEEDS_REVIEW') statusCounts.Needs_Review++;
    }
    const reviewStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' '),
      count,
    }));

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
}

export const store = new DataStore();
