import { contracts } from '@/lib/mock-data/contracts';

export const dynamic = 'force-dynamic';

// GET /api/contracts
// Returns: Contract[]
// 🤖 AI INTEGRATION POINT — replace mock data source with real backend/DB call
export async function GET() {
  return Response.json(contracts);
}
