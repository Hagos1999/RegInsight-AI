# RegInsight AI — Nigerian Regulatory Intelligence Platform

> A centralized RegTech prototype for the Nigerian market, built with Next.js 14 and Tailwind CSS.

## Overview

**RegInsight AI** is a centralized regulatory intelligence platform designed for Nigerian government agencies, regulators, and auditors. It aggregates data across three key regulatory bodies—FIRS (Tax), CAC (Corporate Affairs), and BPP (Procurement)—into a unified, AI-enhanced dashboard.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 14 (App Router)                       │
│  ┌────────────────┐  ┌────────────────────────────────────────┐  │
│  │  React Client   │  │        Next.js API Routes              │  │
│  │  Components     │  │  /api/contracts  /api/compliance       │  │
│  │  (6 views)      │  │  /api/funding    /api/process-doc      │  │
│  └────────────────┘  └────────────────────────────────────────┘  │
│                    ↕  Tailwind CSS + Recharts + ReactFlow         │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    Mock Data Layer (TypeScript)                   │
│   contracts.ts  │  compliance.ts  │  funding-flows.ts            │
│   audit-log.ts  │  ai-processor.ts  │  blockchain-sim.ts         │
└─────────────────────────────────────────────────────────────────┘
```

**Stack:**
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS v4 + custom design tokens (Nigerian green/white)
- **Charts:** Recharts (area, line, radial bar charts)
- **Network Graph:** ReactFlow (interactive funding flow visualizer)
- **Animations:** Framer Motion ready
- **Icons:** Lucide React
- **Deployment:** Vercel (serverless, one-click deploy)

---

## Features

### 1. 🏛️ Unified Agency Dashboard (`/dashboard`)
- Real-time KPI overview for FIRS, CAC, and BPP
- 6-month compliance trend chart
- Live anomaly alert feed (role-restricted)
- Contract value and risk summary widgets

### 2. 🤖 AI Document Processor (`/documents`)
- Drag-and-drop document upload (TXT, PDF, DOCX)
- Rule-based NLP entity extraction using regex patterns:
  - **Currency amounts** — ₦ amounts in any format
  - **Dates** — multiple Nigerian date formats
  - **FIRS Tax IDs / TINs** — pattern-matched against FIRS format
  - **CAC Registration Numbers** — RC, BN, CAC/XX formats
  - **Nigerian Government Organizations** — 30+ entity dictionary
  - **Risk keywords** — shell company indicators, fraud terms
- Color-coded entity highlight view
- Risk score calculation + flag summary
- 3 sample documents pre-loaded: contract, tax filing, CAC registration

### 3. 📋 Contract Tracker (`/contracts`)
- Kanban board: Awarded → In Progress → Completed
- HTML5 drag-and-drop to move cards between stages
- Filter by: Ministry, Risk Level
- Click-to-expand card modal with full contract details
- Payment progress bars per contract
- Risk badges + flagged contract alerts (role-restricted)

### 4. 💸 Funding Flow Visualizer (`/funding`)
- Interactive ReactFlow network graph
- Nodes: Government Agencies, Contractors, Sub-vendors
- Edges: Payment flows with ₦ amounts labeled
- Red-highlighted nodes/edges for anomalies
- Anomaly types detected: Duplicate payment, Shell company, Offshore transfer, Split payment
- "Anomalies Only" filter toggle
- Full anomaly alert table below graph

### 5. 📊 Compliance Scorecard (`/compliance`)
- Radial gauge charts: Overall, Filed On Time, CAC Active %, WHT Compliant %
- 6-month trend line chart (per parastatal)
- Expandable scorecard table for each parastatal (VAT, CIT, WHT, CAC status)
- Filing deadline tracker with penalty information
- Days-remaining countdown per filing

### 6. 🔗 Blockchain Audit Log (`/audit-log`)
- Simulated 15-entry hash chain (SHA-256 style deterministic hashing)
- Each block: Hash, Previous Hash, Timestamp, User, Role, Action, Entity, IP
- "Verify" button to re-compute integrity per block
- Search/filter by role, action, user
- CSV export (Admin/Auditor only)
- Expandable rows showing full hash chain

---

## Role-Based Access Control

| Feature | Admin (Regulator) | Agency User | Auditor |
|---|---|---|---|
| View all agencies | ✅ | ⚠️ Own agency | ✅ |
| See anomaly alerts | ✅ | ❌ | ✅ |
| Upload documents | ✅ | ✅ | ❌ |
| Move Kanban cards | ✅ | ✅ | ❌ |
| Verify audit blocks | ✅ | ❌ | ✅ |
| Export audit log | ✅ | ❌ | ✅ |

Switch roles using the dropdown in the top header.

---

## Mock Data

| Dataset | Records | Coverage |
|---|---|---|
| Contracts | 12 | Min. Works, Health, Education, Transport, Power, Finance, Justice, Petroleum, Agriculture |
| Compliance Records | 8 parastatals | NNPC, CBN, NCC, FIRS, NERC, NPA, BOA, NWRI |
| Filing Deadlines | 10 | VAT, CIT, WHT, CAC returns |
| Funding Flow Nodes | 12 | 3 agencies, 5 contractors, 4 sub-vendors |
| Funding Flow Edges | 14 | Including 4 anomalous flows |
| Audit Log Entries | 15 | Full blockchain chain |
| Sample Documents | 3 | Contract, Tax Filing, CAC Registration |

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Deployment (Vercel)

This app is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

---

## Design System

- **Primary:** `#008751` (Nigerian government green)
- **Dark:** `#005f38`
- **Accent:** `#f0a500` (gold for alerts)
- **Danger:** `#dc2626` (anomaly highlights)
- **Font:** Inter (Google Fonts)
- **Cards:** Glass-morphism with green border accents
- **Mobile:** Fully responsive with slide-in sidebar

---

## Future Enhancements

- [ ] Real FastAPI backend (Python) on Railway
- [ ] PostgreSQL database with real data ingestion
- [ ] FIRS API integration for live tax filing status
- [ ] CAC API integration for real registration lookup
- [ ] Advanced ML models for fraud detection (replacing rule-based AI)
- [ ] PDF parsing with OCR for scanned documents
- [ ] Real-time notifications via WebSockets
- [ ] Multi-factor authentication for government users
- [ ] Audit trail export to actual blockchain (Hyperledger Fabric)

---

*Built for the Nigerian RegTech ecosystem. All data is simulated for prototype demonstration purposes.*
