# AI-Driven Standardization and Harmonization of Material Codes Across CPSEs
**Problem Statement ID: 26099 | Smart India Hackathon 2026**
* **Organization:** Ministry of Petroleum & Natural Gas (MoP&NG)
* **Department:** Chennai Petroleum Corporation Limited (CPCL)
* **Theme:** Smart Automation
* **Category:** Software

---

## 1. Project Overview

Central Public Sector Enterprises (CPSEs) under the Ministry of Petroleum & Natural Gas (including **CPCL, IOCL, BPCL, HPCL, and ONGC**) maintain legacy material catalogs with tens of thousands of individual Material Master SKUs. Disparate naming conventions, varying abbreviation styles (e.g., `SS` vs `STAINLESS STEEL`), mixed unit notations (`10MM` vs `10 mm`), and non-standardized engineering descriptions lead to massive inventory duplication, redundant procurement, and inability to share surplus spares across CPSEs.

This platform provides an **enterprise-grade, explainable AI-driven material harmonization system** that:
1. Ingests raw material catalogs (CSV/XLSX) from participating CPSEs.
2. Normalizes descriptions, units, and abbreviations without erasing technical specifications.
3. Automatically extracts structured engineering parameters (Material, Grade, Item Type, Diameter/Size, Length, Pressure Rating, Design Standard).
4. Identifies duplicate, near-duplicate, and equivalent materials using multi-attribute weighted scoring and NLP token similarity.
5. Provides **transparent, auditable explainability** (itemized checkmarks `✓` and differences `✕`) rather than an opaque percentage.
6. Empowers certified CPSE Material Experts with a **Human-in-the-Loop** validation workflow.
7. Deterministically generates and maps unified **National Material Codes (`NMC-0001001`)** with an immutable audit trail.

---

## 2. System Architecture

```text
React 19 + TypeScript + Tailwind CSS (Vite SPA)
                       ↓  (Axios / Fetch API)
Node.js + Express Server (Port 3000)
                       ↓
Material Processing Service & Validation
                       ↓
AI Matching Engine (Modular Micro-Kernel)
 ├── Normalizer (Abbreviation & Unit Standardization)
 ├── Specification Extractor (Material, Grade, Rating, Dimensions)
 ├── Scorer (Semantic 30%, Specs 30%, Material 20%, Dimensions 15%, Unit 5%)
 ├── Matcher (Candidate Ranking & Classification)
 ├── Explanation Generator (Checkmarks, Differences, Recommendations)
 └── Orchestrator (Multi-stage Pipeline Controller)
                       ↓
High-Fidelity Document Store (MongoDB / Persistent Memory Engine)
```

---

## 3. Technology Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Canvas Confetti
* **Backend:** Node.js, Express.js, TypeScript, Multer, XLSX, PapaParse, JSONWebToken, Bcrypt.js
* **Database & Persistence:** MongoDB / High-Fidelity In-Memory Document Store with JSON persistence
* **AI & Normalization:** Modular TypeScript Engine with NLP Token Overlap, RegEx Parameter Extraction, and ASME/ASTM Standard Rules

---

## 4. Key Application Screens & Workflows

1. **Government Portal Login:** Enterprise authentication with instant one-click demo role switcher (Admin, Material Expert, CPSE Officer).
2. **Standardization Dashboard:** Live metrics for total materials, potential duplicates, pending reviews, harmonized codes, and interactive charts (Materials by CPSE, Match Classification, Review Pipeline).
3. **Data Upload:** Ingest CPCL/IOCL/BPCL CSV or XLSX spreadsheets with live validation, automated normalization, and attribute extraction preview.
4. **Material Explorer:** High-density searchable catalog with multi-CPSE filters, category categorization, and technical specification profiles.
5. **AI Material Matching:** Side-by-side technical comparison with confidence scoring, attribute match matrix, and natural language recommendations.
6. **Review & Approval Queue:** Governance pipeline with tabs for Pending, Approved, Rejected, and Needs Review.
7. **National Material Master:** Centralized registry of unified `NMC` codes, mapped CPSE codes, and approval histories.
8. **Legacy Material Mapping:** Direct bidirectional cross-referencing between CPSE codes (e.g., `CPCL-BLT-001` → `NMC-0001001` ← `IOCL-BOLT-892`).
9. **Harmonization Analytics:** Projected procurement savings, SKU rationalization metrics, and dead stock elimination.
10. **Audit Logs:** Immutable audit log tracking user actions, timestamps, and previous vs updated values.

---

## 5. Demonstration Benchmark Test Cases

The application includes pre-configured benchmark cases specified in SIH Problem Statement 26099:

* **Case 1 — IDENTICAL (96%+ Confidence):**
  * *Source (CPCL):* `SS304 HEX BOLT M10 X 50` (`CPCL-BLT-001`)
  * *Candidate (IOCL):* `STAINLESS STEEL SS304 HEX BOLT 10MM X 50MM` (`IOCL-BOLT-892`)
  * *AI Decision:* Same material (Stainless Steel), same grade (SS304), same type (Hex Bolt), same diameter (10 mm), same length (50 mm).
* **Case 2 — DIFFERENT VARIANT:**
  * *Source (CPCL):* `SS304 HEX BOLT M10 X 50` (`CPCL-BLT-001`)
  * *Candidate (BPCL):* `SS304 HEX BOLT M12 X 50` (`BPCL-FST-102`)
  * *AI Decision:* Dimensional variance detected (Diameter 10 mm vs 12 mm). Requires separate National Material Codes.
* **Case 3 — DIFFERENT MATERIAL:**
  * *Source (CPCL):* `SS304 HEX BOLT M10 X 50` (`CPCL-BLT-001`)
  * *Candidate (HPCL):* `CARBON STEEL HEX BOLT M10 X 50` (`HPCL-BLT-440`)
  * *AI Decision:* Incompatible metallurgy (Stainless Steel vs Carbon Steel). Match rejected.
* **Case 4 — NEAR DUPLICATE (Gate Valve):**
  * *Source (CPCL):* `GATE VALVE 2 INCH CLASS 150# FLANGED RF WCB BODY` (`CPCL-VLV-101`)
  * *Candidate (IOCL):* `2" 150# RF FLANGED GATE VALVE ASTM A216 WCB` (`IOCL-VLV-710`)
  * *AI Decision:* Equivalent pressure class (150#), size (2 inch), body metallurgy (ASTM A216 WCB).

---

## 6. Demo Credentials (Prototype Environment)

| Role | User Label | Email | Password | Entity / Context |
| :--- | :--- | :--- | :--- | :--- |
| **Material Expert** | Demo User (Material Expert) | `expert@demo.local` | `sih2026` | CPCL Demo Dataset |
| **Central Admin** | Demo User (Governance Admin) | `admin@demo.local` | `sih2026` | National Material Governance |
| **CPSE Officer** | Demo User (CPSE Officer) | `officer@demo.local` | `sih2026` | IOCL Demo Dataset |

---

## 7. Running the Prototype Locally

### Prerequisites
* Node.js v18+ or v20+
* npm v9+

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start the integrated Full-Stack Server (Express backend + Vite frontend on port 3000)
npm run dev

# 3. Access in browser
http://localhost:3000
```

### Docker Deployment
```bash
docker-compose up --build -d
```

---

## 8. Modular AI Kernel & Future Python Architecture

The current backend is strictly decoupled into a modular micro-service (`server/ai/`):
* `normalizer.ts`: Standardizes syntax, metric units, and CPSE abbreviations.
* `specificationExtractor.ts`: Extracts engineering parameters into structured JSON.
* `scorer.ts`: Computes multidimensional weighted scores.
* `matcher.ts`: Identifies candidate matches across the CPSE catalog.
* `explanation.ts`: Synthesizes transparent rationale with checkmarks and differences.
* `orchestrator.ts`: Controls the multi-stage harmonization pipeline.

### Future Production Architecture
The frontend REST API contracts are completely decoupled, allowing zero-friction transition to:
```text
React / Vite UI
       ↓ (REST / gRPC)
FastAPI Gateway (Python 3.11)
       ↓
Agentic AI Orchestrator (LangGraph / CrewAI)
 ├── Material Understanding Agent
 ├── Specification Extraction Agent (Fine-tuned LLM / NER)
 ├── Dense Embedding Agent (Sentence-Transformers / BAAI/bge-large)
 ├── Reranking Agent (Cross-Encoder)
 └── Rule & Compliance Validation Agent
       ↓
Vector Database (pgvector / Qdrant) + PostgreSQL
```

---

## 9. Security & Governance

* **Authentication:** Stateless JSON Web Tokens (JWT) with HMAC SHA-256 signing.
* **Access Control:** Role-Based Access Control (`ADMIN`, `CPSE_OFFICER`, `MATERIAL_EXPERT`).
* **Deterministic Codification:** National Material Codes (`NMC-0001001`) are sequentially generated via deterministic server sequences to guarantee global uniqueness.
* **Audit Logging:** Every approval, rejection, upload, and mapping is captured in an append-only audit trail.
#   S I H _ 2 6 0 9 9  
 