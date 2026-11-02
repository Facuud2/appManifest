import { NextRequest, NextResponse } from 'next/server';
import {
  isSandboxRequest,
  sleep,
  generateMockRampage,
  generateRampageWithGemini,
} from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const sandbox = isSandboxRequest(req);
    const body = await req.json().catch(() => ({}));
    const {
      centralTheme,
      specifications = '',
      previousAffirmations = [],
      batchSize = 3,
      batchIndex = 0,
    } = body;

    const theme = (centralTheme || '').trim();
    if (!theme) {
      return NextResponse.json(
        { error: 'El tema central es requerido para generar afirmaciones de Rampage.' },
        { status: 400 }
      );
    }

    // 1. Sandbox / Mock Mode
    if (sandbox) {
      await sleep(500);
      const computedBatchIdx =
        typeof batchIndex === 'number'
          ? batchIndex
          : Math.floor((previousAffirmations?.length || 0) / 3);
      const affirmations = generateMockRampage(theme, computedBatchIdx, batchSize);

      return NextResponse.json({
        affirmations,
        source: 'SANDBOX_MOCK',
        totalTokens: 0,
      });
    }

    // 2. Gemini Live Call
    try {
      const result = await generateRampageWithGemini(
        theme,
        specifications,
        previousAffirmations,
        batchSize
      );

      return NextResponse.json({
        affirmations: result.affirmations,
        source: result.source,
        totalTokens: result.totalTokens,
      });
    } catch (apiError: any) {
      console.warn('[API rampage] Fallback to mock on Gemini error:', apiError?.message);
      const computedBatchIdx = Math.floor((previousAffirmations?.length || 0) / 3);
      const fallbackAffirmations = generateMockRampage(theme, computedBatchIdx, batchSize);

      return NextResponse.json({
        affirmations: fallbackAffirmations,
        source: 'SANDBOX_MOCK',
        totalTokens: 0,
        fallbackReason: apiError?.message,
      });
    }
  } catch (err: any) {
    console.error('[API rampage error]', err);
    return NextResponse.json(
      { error: err?.message || 'Error al generar lote de Rampage.' },
      { status: 500 }
    );
  }
}
