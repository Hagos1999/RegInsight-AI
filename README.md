# RegInsight AI — Nigerian Regulatory Intelligence Platform

> A production-grade, centralized RegTech platform for the Nigerian market, built with Next.js 14 (App Router) and the IBM Carbon Design System.

## Overview

**RegInsight AI** is a centralized regulatory intelligence platform designed for Nigerian government agencies, regulators, and auditors. It aggregates data across three key regulatory bodies—**FIRS (Tax)**, **CAC (Corporate Affairs)**, and **BPP (Procurement)**—into a unified, AI-enhanced, and tamper-evident dashboard.

The application has been fully architected using the Carbon Design System to ensure robust accessibility, enterprise-grade UX, and a premium "Nigeria-first" brand look and feel.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 14 (App Router)                       │
│  ┌────────────────┐  ┌────────────────────────────────────────┐  │
│  │ Carbon Client   │  │        Next.js API Routes              │  │
│  │ Components      │  │  /api/contracts  /api/compliance       │  │
│  │ (6 main views)  │  │  /api/funding    /api/process-doc      │  │
│  └────────────────┘  └────────────────────────────────────────┘  │
│                    ↕  @carbon/react + @carbon/charts-react        │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    Mock Data Layer (TypeScript)                   │
│   contracts.ts  │  compliance.ts  │  funding-flows.ts            │
│   audit-log.ts  │  ai-processor.ts                               │
└─────────────────────────────────────────────────────────────────┘
```

**Stack Details:**
- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Design System:** IBM Carbon Design System v11 (`@carbon/react`)
- **Theme Config:** Prebuilt Carbon CSS + Nigerian Custom SCSS (Green/Gold/Dark Mode Native)
- **Charts:** `@carbon/charts-react` (Line, Area, Custom Gauge implementations)
- **Network Graph:** ReactFlow (`@xyflow/react`) for funding flow visualization
- **Icons:** `@carbon/icons-react`
- **State Management:** React Context API (Role and Theme state)

---

## Core Modules

### 1. 🏛️ Unified Agency Dashboard (`/dashboard`)
- Real-time Carbon KPI tiles for FIRS, CAC, and BPP metrics.
- 6-month compliance trend chart using Carbon Area Chart.
- Live anomaly alert feed using Carbon InlineNotifications.
- High-level contract value and risk summary widgets.

### 2. 🤖 AI Document Processor (`/documents`)
- File upload interface and Carbon Tabs separating summary/text views.
- **AI Integration Point (`/api/process-doc`)** ready to be hooked into the backend ML extraction pipeline.
- Color-coded entity highlight view mapping extracted names, currency amounts, TINs, and risk flags to Carbon color tags.

### 3. 📋 Contract Tracker (`/contracts`)
- Interactive HTML5 drag-and-drop Kanban board for Procurement tracking.
- Carbon tag overlays for risk levels and status.
- Stage tracking: Awarded → In Progress → Completed.
- Role-restricted card movement (Agency/Admin only).

### 4. 💸 Funding Flow Visualizer (`/funding`)
- Interactive, zoom-capable ReactFlow network graph mapping capital movement.
- Distinctly colored nodes for Agencies (Blue), Contractors (Green), and Sub-vendors (Purple).
- Pulse animations bridging to an "Anomalies Only" Carbon Toggle switch.
- Supporting Alert DataTable showing detailed descriptions of financial splitting/shell-company risks.

### 5. 📊 Compliance Scorecard (`/compliance`)
- Custom SVG radial gauge charts measuring Overall, Active %, and WHT compliance.
- Massive Carbon `DataTable` with expanding rows that dynamically render inline `@carbon/charts-react` Trend Line Charts.
- Filing deadline tracker detailing penalties and statuses for 8 parastatals.

### 6. 🔗 Blockchain Audit Log (`/audit-log`)
- Simulated tamper-evident hash chain displayed inside a Carbon DataTable.
- Includes a deterministic "Verify" action utilizing Carbon InlineLoading that simulates re-hashing blocks.
- Search and Filter roles applied globally.
- CSV Export function (restricted to Admin/Auditor roles).

---

## Backend Engineer Integration Guide

The frontend prototype is **100% ready** for backend hookups (FastAPI, Postgres, ML APIs). All API routes return strictly typed mock JSON responses. 

To connect the real backend:
1. Open the `/app/api/*/route.ts` files.
2. Locate the comments marked **`🤖 AI INTEGRATION POINT`**.
3. Replace the `Response.json(mockData)` line with `fetch('YOUR_REAL_INTERNAL_API_URL/endpoints')`.

**Available Endpoints:**
- `GET /api/contracts`
- `GET /api/compliance`
- `GET /api/funding`
- `GET /api/audit-log`
- `POST /api/process-doc` (Requires `{ text: string }` payload)

Note: For the document processing pipeline, update `lib/ai-processor.ts` `processDocument` function if you prefer fetching from the backend inside the client rather than the API route payload.

---

## Role-Based Access Control

The UI dynamically adapts based on the active role (toggleable via the top navigation bar):

| Feature | Admin (System Override) | Agency User (e.g. FIRS) | Auditor |
|---|---|---|---|
| View All Agencies | ✅ | ❌ (Own only) | ✅ |
| See Anomaly Alerts | ✅ | ❌ | ✅ |
| Upload AI Documents | ✅ | ✅ | ❌ |
| Move Kanban Cards | ✅ | ✅ | ❌ (View only) |
| Verify Audit Blocks | ✅ | ❌ | ✅ |
| Export Audit CSV | ✅ | ❌ | ✅ |

---

## Development

```bash
# Install dependencies
npm install

# Run the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
All development warnings related to Carbon `<svg>` keys in the browser console are standard library artifacts and do not break functionality.

---

### UI Design Configuration
The application does not use Tailwind. All structural layouts use custom clean CSS located in `app/globals.css`, alongside the full Carbon design system imported directly on initialization. The theming overrides `g100` defaults with specific hex values to match the Nigerian coat of arms representation without sacrificing accessible contrast.
