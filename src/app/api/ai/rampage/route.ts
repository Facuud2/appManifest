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
      centralTheme = '',
      specifications = '',
      userAffirmations = [],
      journalHighlights = [],
      userScope = 'facu',
      detectedTone = 'calma, firme, íntima',
      previousAffirmations = [],
      batchSize = 3,
      batchIndex = 0,
    } = body;

    const theme = (centralTheme || '').trim() || (specifications || '').trim() || (userAffirmations?.[0] || 'Manifestación');

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

    // 2. Gemini Live Call with AYA Method prosody prompt and dynamic popurrí
    try {
      const result = await generateRampageWithGemini({
        centralTheme: theme,
        specifications,
        userAffirmations,
        journalHighlights,
        userScope,
        detectedTone,
        previousAffirmations,
        batchSize,
      });

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
