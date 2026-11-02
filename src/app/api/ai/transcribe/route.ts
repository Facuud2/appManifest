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

    // Guardrail: Sandbox / Mock Mode
    if (sandbox || !audioFile) {
      await sleep(500);
      const mockText = generateMockTranscript(previousTextTail);
      return NextResponse.json({
        text: mockText,
        source: 'SANDBOX_MOCK',
        totalTokens: 0,
      });
    }

    const mimeType = audioFile.type || 'audio/webm';
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 100) {
      return NextResponse.json(
        { error: 'El archivo de audio está vacío o dañado.' },
        { status: 400 }
      );
    }

    try {
      const result = await transcribeAudioWithGemini(
        buffer,
        mimeType,
        previousTextTail
      );

      return NextResponse.json({
        text: result.text,
        source: result.source,
        totalTokens: result.totalTokens,
      });
    } catch (apiError: any) {
      console.warn('[API transcribe] Fallback to mock on Gemini error:', apiError?.message);
      // Fallback smoothly if Gemini encounters temporary quota or 503
      const fallbackText = generateMockTranscript(previousTextTail);
      return NextResponse.json({
        text: fallbackText,
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
