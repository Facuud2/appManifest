import { NextRequest, NextResponse } from 'next/server';
import {
  isSandboxRequest,
  generateSyntheticWavBuffer,
  getGeminiApiKey,
  synthesizeSpeechWithGemini38FlashTTS,
  sleep,
} from '@/lib/gemini';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const sandbox = isSandboxRequest(req);
    const body = await req.json().catch(() => ({}));
    const {
      text,
      voiceProfileId = 'voice_aya_default',
      detectedTone = 'calma, firme, íntima',
      matchedVoice,
      fundamentalFrequency,
    } = body;

    const spokenText = (text || '').trim();
    if (!spokenText) {
      return NextResponse.json(
        { error: 'El texto de la afirmación es requerido para síntesis vocal.' },
        { status: 400 }
      );
    }

    // 1. Primary Engine: Gemini 3.8 Flash TTS Voice Replication
    const geminiKey = getGeminiApiKey();
    if (geminiKey && !sandbox) {
      try {
        const { wavBuffer, voiceUsed } = await synthesizeSpeechWithGemini38FlashTTS({
          text: spokenText,
          matchedVoice,
          detectedTone,
          fundamentalFrequency,
        });

        return new Response(new Uint8Array(wavBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Length': String(wavBuffer.length),
            'Cache-Control': 'public, max-age=86400',
            'x-ai-source': 'GEMINI_3_8_FLASH_TTS',
            'x-voice-name': voiceUsed,
            'x-voice-profile-id': voiceProfileId,
          },
        });
      } catch (geminiTtsErr) {
        console.warn('[voice-synthesize] Gemini 3.8 Flash TTS error:', geminiTtsErr);
      }
    }

    // 2. Secondary Engine: ElevenLabs (if configured)
    const voiceApiKey =
      process.env.VOICE_CLONE_API_KEY ||
      process.env.ELEVENLABS_API_KEY ||
      process.env.CARTESIA_API_KEY ||
      '';

    if (voiceApiKey && (process.env.ELEVENLABS_API_KEY || process.env.VOICE_CLONE_API_KEY)) {
      const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VOICE_CLONE_API_KEY;
      const voiceId = voiceProfileId.startsWith('voice_aya_')
        ? '21m00Tcm4TlvDq8ikWAM'
        : voiceProfileId;

      const elevenRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey!,
          },
          body: JSON.stringify({
            text: spokenText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.90,
              style: 0.2,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (elevenRes.ok) {
        const audioStream = elevenRes.body;
        return new Response(audioStream, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'x-ai-source': 'ELEVENLABS_LIVE',
            'x-voice-profile-id': voiceProfileId,
          },
        });
      }
    }

    // 3. Fallback to client Web Speech API if offline
    return NextResponse.json({
      useLocalSynthesis: true,
      text: spokenText,
      voiceProfileId,
      detectedTone,
      source: 'LOCAL_SPEECH_SYNTHESIS',
    });
  } catch (err: any) {
    console.error('[API voice-synthesize error]', err);
    return NextResponse.json(
      { error: err?.message || 'Error en síntesis vocal con voz clonada.' },
      { status: 500 }
    );
  }
}
