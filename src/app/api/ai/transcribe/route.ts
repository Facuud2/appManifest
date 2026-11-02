import { NextRequest, NextResponse } from 'next/server';
import {
  isSandboxRequest,
  sleep,
  generateMockTranscript,
  transcribeAudioWithGemini,
} from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const sandbox = isSandboxRequest(req);

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const previousTextTail = (formData.get('previousTextTail') as string) || '';
    const spokenText = (formData.get('spokenText') as string) || '';

    // 1. Guardrail: Sandbox / Mock Mode
    if (sandbox || (!audioFile && !spokenText)) {
      await sleep(400);
      const mockResult = generateMockTranscript(previousTextTail, spokenText);
      return NextResponse.json({
        text: mockResult.text,
        detectedTone: mockResult.detectedTone,
        source: 'SANDBOX_MOCK',
        totalTokens: 0,
      });
    }

    let buffer = Buffer.alloc(0);
    let mimeType = 'audio/webm';

    if (audioFile) {
      mimeType = audioFile.type || 'audio/webm';
      const arrayBuffer = await audioFile.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    try {
      const result = await transcribeAudioWithGemini(
        buffer,
        mimeType,
        previousTextTail,
        spokenText
      );

      return NextResponse.json({
        text: result.text,
        detectedTone: result.detectedTone,
        source: result.source,
        totalTokens: result.totalTokens,
      });
    } catch (apiError: any) {
      console.warn('[API transcribe] Fallback on error:', apiError?.message);
      const fallbackResult = generateMockTranscript(previousTextTail, spokenText);
      return NextResponse.json({
        text: fallbackResult.text,
        detectedTone: fallbackResult.detectedTone,
        source: 'SANDBOX_MOCK',
        totalTokens: 0,
        fallbackReason: apiError?.message,
      });
    }
  } catch (err: any) {
    console.error('[API transcribe error]', err);
    return NextResponse.json(
      { error: err?.message || 'Error interno del servidor en transcripción.' },
      { status: 500 }
    );
  }
}
