import { fundingNodes, fundingEdges, anomalyAlerts } from '@/lib/mock-data/funding-flows';

export const dynamic = 'force-dynamic';

// GET /api/funding
// Returns: { nodes: FlowNode[], edges: FlowEdge[], anomalies: AnomalyAlert[] }
// 🤖 AI INTEGRATION POINT — replace mock data source with real backend/DB call
export async function GET() {
  return Response.json({ nodes: fundingNodes, edges: fundingEdges, anomalies: anomalyAlerts });
}
