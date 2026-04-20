import { complianceRecords, filingDeadlines, overallMetrics } from '@/lib/mock-data/compliance';

export const dynamic = 'force-dynamic';

// GET /api/compliance
// Returns: { records: ComplianceRecord[], deadlines: FilingDeadline[], metrics: OverallMetrics }
// 🤖 AI INTEGRATION POINT — replace mock data source with real backend/DB call
export async function GET() {
  return Response.json({ records: complianceRecords, deadlines: filingDeadlines, metrics: overallMetrics });
}
