import { NextRequest, NextResponse } from 'next/server';
import {
  isSandboxRequest,
  generateSyntheticWavBuffer,
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
    } = body;

    const spokenText = (text || '').trim();
    if (!spokenText) {
      return NextResponse.json(
        { error: 'El texto de la afirmación es requerido para síntesis vocal.' },
        { status: 400 }
      );
    }

    const voiceApiKey =
      process.env.VOICE_CLONE_API_KEY ||
      process.env.ELEVENLABS_API_KEY ||
      process.env.CARTESIA_API_KEY ||
      '';

    // 1. If no paid voice cloning API key is configured, tell client to use calibrated local engine or user recorded voice
    if (!voiceApiKey) {
      return NextResponse.json({
        useLocalSynthesis: true,
        text: spokenText,
        voiceProfileId,
        detectedTone,
        source: 'LOCAL_SPEECH_SYNTHESIS',
      });
    }

    // 2. ElevenLabs Instant Voice Cloning / TTS Integration
    if (process.env.ELEVENLABS_API_KEY || process.env.VOICE_CLONE_API_KEY) {
      const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VOICE_CLONE_API_KEY;
      const voiceId = voiceProfileId.startsWith('voice_aya_')
        ? '21m00Tcm4TlvDq8ikWAM' // Default neutral voice if custom cloned voice ID hasn't been uploaded yet
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

      console.warn(
        '[API voice-synthesize] ElevenLabs error, falling back to local synthesis:',
        elevenRes.status
      );
    }

    // 3. Graceful fallback to local synthetic audio buffer
    const fallbackBuffer = generateSyntheticWavBuffer(spokenText);
    return new Response(new Uint8Array(fallbackBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(fallbackBuffer.length),
        'x-ai-source': 'SANDBOX_MOCK',
        'x-voice-profile-id': voiceProfileId,
      },
    });
  } catch (err: any) {
    console.error('[API voice-synthesize error]', err);
    return NextResponse.json(
      { error: err?.message || 'Error en síntesis vocal con voz clonada.' },
      { status: 500 }
    );
  }
}
