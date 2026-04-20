import { processDocument } from '@/lib/ai-processor';

export const dynamic = 'force-dynamic';

// POST /api/process-doc
// Body: { text: string; fileName?: string; mimeType?: string }
// Returns: ProcessingResult (entities[], riskScore, riskFlags, documentType, confidence, summary)
//
// 🤖 AI INTEGRATION POINT — replace the mock processDocument() call below with
//   your real AI/ML model. Example:
//
//   const aiResult = await fetch(process.env.AI_SERVICE_URL + '/extract', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
//     body: JSON.stringify({ text, fileName }),
//   }).then(r => r.json());
//   return Response.json(aiResult);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, fileName } = body as { text: string; fileName?: string };

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'text field is required' }, { status: 400 });
    }

    // Mock rule-based NLP — replace with real ML pipeline
    const result = processDocument(text);

    return Response.json(result);
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
