import {
  User,
  Material,
  MaterialMatch,
  NationalMaterial,
  MaterialMapping,
  AuditLog,
  DashboardStats,
  CPSE,
} from '../types';
import {
  clientStore,
  normalizeMaterialDescription,
  extractSpecifications,
} from './clientStore';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const api = {
  // 1. Auth: Accepts ANY email & password!
  async login(email: string, password?: string): Promise<{ token: string; user: User }> {
    const cleanEmail = (email || 'expert@demo.local').trim().toLowerCase();
    
    let role: 'ADMIN' | 'CPSE_OFFICER' | 'MATERIAL_EXPERT' = 'MATERIAL_EXPERT';
    let name = 'Demo User (Material Expert)';
    let cpse = 'CPCL Demo Dataset';

    if (cleanEmail.includes('admin') || cleanEmail.includes('gov')) {
      role = 'ADMIN';
      name = 'Demo User (Governance Admin)';
      cpse = 'National Material Governance (MoP&NG)';
    } else if (cleanEmail.includes('officer') || cleanEmail.includes('iocl') || cleanEmail.includes('cpse')) {
      role = 'CPSE_OFFICER';
      name = 'Demo User (CPSE Officer)';
      cpse = 'IOCL Demo Dataset';
    } else if (cleanEmail.includes('expert')) {
      role = 'MATERIAL_EXPERT';
      name = 'Demo User (Material Expert)';
      cpse = 'CPCL Demo Dataset';
    } else {
      // Custom user
      const localPart = cleanEmail.split('@')[0] || 'user';
      name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
      cpse = 'CPCL Material Registry';
    }

    const user: User = {
      id: `usr-${Date.now()}`,
      name,
      email: cleanEmail,
      role,
      cpse,
    };

    const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return { token, user };
  },

  // 2. Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return clientStore.getDashboardStats();
  },

  // 3. CPSEs
  async getCpses(): Promise<CPSE[]> {
    return clientStore.cpses;
  },

  // 4. Materials
  async getMaterials(params?: {
    cpse?: string;
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Material[]; total: number; page: number; limit: number; totalPages: number }> {
    let list = [...clientStore.materials];

    if (params?.cpse && params.cpse !== 'ALL') {
      list = list.filter(m => m.cpseCode === params.cpse);
    }
    if (params?.category && params.category !== 'ALL') {
      list = list.filter(m => m.category === params.category);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter(m => m.status === params.status);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        m =>
          m.materialCode.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.normalizedDescription.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = list.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  },

  async getMaterialById(id: string): Promise<{ material: Material; matches: MaterialMatch[] }> {
    const mat = clientStore.materials.find(m => m.id === id || m.materialCode === id);
    if (!mat) throw new Error('Material not found');
    const matches = clientStore.matches.filter(m => m.materialAId === mat.id || m.materialBId === mat.id);
    return { material: mat, matches };
  },

  // 5. Upload Materials (Client-side PapaParse & XLSX)
  async uploadMaterials(formData: FormData): Promise<{
    success: boolean;
    recordsUploaded: number;
    validRecords: number;
    invalidRecords: number;
    warnings: string[];
    samplePreview: Material[];
  }> {
    const file = formData.get('file') as File | null;
    const cpseCode = (formData.get('cpseCode') as string) || 'CPCL';
    const uploadedBy = (formData.get('uploadedBy') as string) || 'Demo Officer';

    if (!file) throw new Error('No file provided');

    let rows: Array<{
      materialCode?: string;
      code?: string;
      description?: string;
      desc?: string;
      category?: string;
      subcategory?: string;
      unit?: string;
      manufacturer?: string;
      partNumber?: string;
    }> = [];

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
      const text = await file.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      rows = (parsed.data as any[]).map(r => ({
        materialCode: r['Material Code'] || r['materialCode'] || r['Code'] || r['code'],
        description: r['Description'] || r['description'] || r['Desc'] || r['desc'],
        category: r['Category'] || r['category'] || 'General Hardware',
        subcategory: r['Subcategory'] || r['subcategory'] || 'Components',
        unit: r['Unit'] || r['unit'] || 'NOS',
        manufacturer: r['Manufacturer'] || r['manufacturer'] || 'Standard OEM',
        partNumber: r['Part Number'] || r['partNumber'] || '',
      }));
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheet];
      const json = XLSX.utils.sheet_to_json<any>(sheet);
      rows = json.map(r => ({
        materialCode: r['Material Code'] || r['materialCode'] || r['Code'] || r['code'],
        description: r['Description'] || r['description'] || r['Desc'] || r['desc'],
        category: r['Category'] || r['category'] || 'General Hardware',
        subcategory: r['Subcategory'] || r['subcategory'] || 'Components',
        unit: r['Unit'] || r['unit'] || 'NOS',
        manufacturer: r['Manufacturer'] || r['manufacturer'] || 'Standard OEM',
        partNumber: r['Part Number'] || r['partNumber'] || '',
      }));
    }

    const createdMaterials: Material[] = [];
    let validRecords = 0;
    let invalidRecords = 0;
    const warnings: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rawDesc = (row.description || row.desc || '').trim();
      if (!rawDesc) {
        invalidRecords++;
        warnings.push(`Row ${i + 1}: Missing material description`);
        continue;
      }

      validRecords++;
      const matCode = (row.materialCode || row.code || `${cpseCode}-ITEM-${Date.now().toString().slice(-4)}${i + 1}`).trim();
      const norm = normalizeMaterialDescription(rawDesc);
      const specs = extractSpecifications(norm.normalized);

      const newMat: Material = {
        id: `mat-${Date.now()}-${i + 1}`,
        cpseId: `cpse-${cpseCode.toLowerCase()}`,
        cpseCode,
        materialCode: matCode,
        description: rawDesc,
        normalizedDescription: norm.normalized,
        category: row.category || 'General Equipment',
        subcategory: row.subcategory || 'Standard Items',
        unit: row.unit || 'NOS',
        manufacturer: row.manufacturer || 'Standard OEM',
        partNumber: row.partNumber || '',
        specifications: specs,
        status: 'UNMAPPED',
        createdAt: new Date().toISOString(),
      };

      createdMaterials.push(newMat);
      clientStore.materials.unshift(newMat);
    }

    clientStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-uploader',
      userName: uploadedBy,
      entityType: 'DATA_UPLOAD',
      entityId: `upload-${Date.now()}`,
      action: `Uploaded ${validRecords} material records from ${file.name} for ${cpseCode}`,
      oldValue: 'None',
      newValue: `${validRecords} new catalog items ingested`,
      timestamp: new Date().toISOString(),
    });

    clientStore.save();

    return {
      success: true,
      recordsUploaded: rows.length,
      validRecords,
      invalidRecords,
      warnings,
      samplePreview: createdMaterials.slice(0, 5),
    };
  },

  // 6. AI Matching
  async runMatching(materialId: string): Promise<{ sourceMaterial: Material; candidates: any[] }> {
    return clientStore.runMatching(materialId);
  },

  async getMatches(params?: { status?: string; matchType?: string }): Promise<MaterialMatch[]> {
    let list = [...clientStore.matches];
    if (params?.status && params.status !== 'ALL') {
      list = list.filter(m => m.status === params.status);
    }
    if (params?.matchType && params.matchType !== 'ALL') {
      list = list.filter(m => m.matchType === params.matchType);
    }
    return list;
  },

  async approveMatch(
    matchId: string,
    comments?: string,
    nationalCode?: string
  ): Promise<{ success: boolean; message: string; match: MaterialMatch; nationalMaterial: NationalMaterial }> {
    return clientStore.approveMatch(matchId, comments, nationalCode);
  },

  async rejectMatch(matchId: string, comments?: string): Promise<{ success: boolean; message: string; match: MaterialMatch }> {
    return clientStore.rejectMatch(matchId, comments);
  },

  async flagNeedsReview(matchId: string, comments?: string): Promise<{ success: boolean; message: string; match: MaterialMatch }> {
    return clientStore.flagNeedsReview(matchId, comments);
  },

  // 7. National Materials
  async getNationalMaterials(params?: { search?: string; category?: string }): Promise<NationalMaterial[]> {
    let list = [...clientStore.nationalMaterials];
    if (params?.category && params.category !== 'ALL') {
      list = list.filter(nm => nm.category === params.category);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        nm =>
          nm.nationalCode.toLowerCase().includes(q) ||
          nm.standardDescription.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getNationalMaterialById(id: string): Promise<{
    nationalMaterial: NationalMaterial;
    mappings: Array<{ mapping: MaterialMapping; material?: Material }>;
  }> {
    const nm = clientStore.nationalMaterials.find(n => n.id === id || n.nationalCode === id);
    if (!nm) throw new Error('National material not found');
    const mappings = clientStore.mappings
      .filter(m => m.nationalCode === nm.nationalCode)
      .map(mapping => ({
        mapping,
        material: clientStore.materials.find(mat => mat.id === mapping.materialId),
      }));
    return { nationalMaterial: nm, mappings };
  },

  async createNationalMaterial(data: {
    standardDescription: string;
    category: string;
    subcategory?: string;
  }): Promise<NationalMaterial> {
    const code = `NMC-000${clientStore.nationalCodeSequence++}`;
    const norm = normalizeMaterialDescription(data.standardDescription);
    const specs = extractSpecifications(norm.normalized);

    const natMat: NationalMaterial = {
      id: `nmc-${Date.now()}`,
      nationalCode: code,
      standardDescription: norm.normalized,
      category: data.category,
      subcategory: data.subcategory,
      specifications: specs,
      status: 'ACTIVE',
      mappedCount: 0,
      sourceCpseList: [],
      createdAt: new Date().toISOString(),
      approvedBy: 'Demo User (Material Expert)',
    };

    clientStore.nationalMaterials.unshift(natMat);
    clientStore.save();
    return natMat;
  },

  // 8. Mappings
  async getMappings(): Promise<MaterialMapping[]> {
    return clientStore.mappings;
  },

  // 9. Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return clientStore.auditLogs;
  },

  // 10. Demo Reset
  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    clientStore.reset();
    return { success: true, message: 'System reset to pristine demo state' };
  },
};
