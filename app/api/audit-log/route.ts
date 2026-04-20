import { auditLog } from '@/lib/mock-data/audit-log';

export const dynamic = 'force-dynamic';

// GET /api/audit-log
// Returns: AuditEntry[]
// 🤖 AI INTEGRATION POINT — replace mock data source with real backend/DB call
export async function GET() {
  return Response.json(auditLog);
}
