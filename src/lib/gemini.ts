import { GoogleGenAI } from '@google/genai';

export interface AiTelemetryResponse {
  source: 'SANDBOX_MOCK' | 'GEMINI_LIVE';
  totalTokens: number;
}

export function getGeminiApiKey(): string {
  return (
    process.env.RAMPAGE_GEMINI_KEY ||
    process.env.GEMINI_API_KEY ||
    ''
  ).trim();
}

export function isSandboxRequest(req: Request): boolean {
  if (process.env.AI_MOCK_MODE === 'true') {
    return true;
  }
  const sandboxHeader = req.headers.get('x-ai-sandbox');
  if (sandboxHeader === 'true' || sandboxHeader === '1') {
    return true;
  }
  const key = getGeminiApiKey();
  if (!key) {
    return true;
  }
  return false;
}

export function sleep(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clean and punctuate spoken text (removing fillers, formatting casing and ending punctuation).
 */
export function cleanSpokenText(spokenText: string, previousTextTail?: string): string {
  let cleaned = (spokenText || '').trim();
  if (!cleaned) return '';

  // Remove filler words in Spanish ("eh", "este", "mmm", "o sea", "y bueno")
  cleaned = cleaned.replace(/^(y\s+bueno|bueno|eh|este|mmm|o\s+sea)[,\s]*/i, '');
  cleaned = cleaned.replace(/\b(eh|mmm|este|o sea)\b/gi, '');
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  if (!cleaned) return '';

  // Casing depending on previous context
  if (previousTextTail && previousTextTail.trim()) {
    const lastChar = previousTextTail.trim().slice(-1);
    const continuesSentence = !['.', '!', '?', ';', '\n', ':'].includes(lastChar);
    if (continuesSentence) {
      cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    } else {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  } else {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Ensure trailing punctuation
  const lastC = cleaned.slice(-1);
  if (!['.', '!', '?', ';', ':'].includes(lastC)) {
    cleaned += '.';
  }
  return cleaned;
}

/**
 * Generates simulated transcript or cleans real spoken text when offline / sandbox.
 */
export function generateMockTranscript(
  previousTextTail?: string,
  spokenText?: string
): { text: string; detectedTone: string } {
  const detectedTone = 'calma, firme, íntima';

  // If user actually spoke words, NEVER replace them with random decrees
  if (spokenText && spokenText.trim().length > 0) {
    return {
      text: cleanSpokenText(spokenText, previousTextTail),
      detectedTone,
    };
  }

  const sampleSentences = [
    'Decreto abundancia en mi vida y recibo con gratitud cada bendición del universo.',
    'Estoy en perfecta alineación con la paz, el amor y la prosperidad que me rodean.',
    'Cada paso que doy abre nuevos caminos de éxito, tranquilidad y sabiduría.',
    'Confío plenamente en el proceso de la vida y elijo vibrar en mi más alta frecuencia.',
    'Hoy agradezco todo lo que soy, lo que tengo y todo lo maravilloso que está por manifestarse.',
  ];

  const randomSentence = sampleSentences[Math.floor(Math.random() * sampleSentences.length)];

  const tail = (previousTextTail || '').trim();
  if (!tail) {
    return { text: randomSentence, detectedTone };
  }

  const lastChar = tail.slice(-1);
  const isTerminated = ['.', '!', '?', ';', '\n'].includes(lastChar);

  if (isTerminated) {
    return { text: randomSentence, detectedTone };
  }

  return {
    text: randomSentence.charAt(0).toLowerCase() + randomSentence.slice(1),
    detectedTone,
  };
}

/**
 * Generates coherent mystical numbered affirmations connected to centralTheme (AYA Method prosody).
 */
export function generateMockRampage(
  centralTheme: string,
  batchIndex: number = 0,
  batchSize: number = 3
): string[] {
  const theme = centralTheme.trim() || 'mi paz y plenitud';

  const templates = [
    [
      `Siento cómo ${theme}... fluye ahora en mi pecho, con serenidad absoluta.`,
      `Permito que la certeza de ${theme} se expanda; mi cuerpo lo sabe real.`,
      `Yo soy la presencia viva de ${theme}, anclada para siempre en mi presente.`,
    ],
    [
      `Respiro hondo... y elijo soltar toda resistencia, recibiendo plenamente ${theme}.`,
      `Cada latido de mi corazón sintoniza, con gratitud profunda, la verdad de ${theme}.`,
      `Reclamo mi poder creador; ${theme} ya es una realidad palpable en mi vida.`,
    ],
    [
      `En este instante sagrado, reconozco que ${theme}... camina junto a mí.`,
      `Siento una calma infinita sabiendo que el universo ya orquestó ${theme}.`,
      `Mi energía vibra alta; sostengo con firmeza la victoria pacífica de ${theme}.`,
    ],
    [
      `Mi mente y mi voz declaran con amor: ${theme} ya habita en mi mundo.`,
      `Abro mis brazos con certeza plena... celebrando la llegada de ${theme}.`,
      `Agradezco aquí y ahora, porque ${theme} se manifiesta con perfecta sincronía.`,
    ],
  ];

  const pool = templates[batchIndex % templates.length];
  return pool.slice(0, batchSize);
}

/**
 * Transcribe audio using Google GenAI with gemini-flash-lite.
 * Returns both punctual text and detectedTone for vocal calibration.
 */
export async function transcribeAudioWithGemini(
  audioBuffer: Buffer,
  mimeType: string,
  previousTextTail?: string,
  spokenText?: string
): Promise<{ text: string; detectedTone: string; source: 'GEMINI_LIVE'; totalTokens: number }> {
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // Prioritize gemini-2.5-flash-lite, fallback to 3.5-flash-lite / 3.5-flash
  const modelsToTry = [
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
  ];

  const hasAudio = audioBuffer && audioBuffer.length > 200;
  const base64Data = hasAudio ? audioBuffer.toString('base64') : '';

  const prompt = `Actúa como un transcriptor neuro-acústico en español. Escucha el audio del usuario y devuelve un JSON con { "text": string, "detectedTone": string }.
1. En "text": Transcribe exactamente el mensaje eliminando por completo muletillas ('eh', 'este', 'mmm', 'o sea', 'y bueno'), falsos comienzos y repeticiones involuntarias. Aplica puntuación impecable (comas, puntos, punto y coma, signos de exclamación/interrogación: ¿?, ¡!) que refleje las pausas naturales del hablante.
2. En "detectedTone": Describe en 3 palabras la cadencia emocional de la voz (ej. 'calma, firme, íntima') para mantener esa misma energía en las afirmaciones.
${previousTextTail ? `Contexto previo: "${previousTextTail.slice(-60)}"` : ''}
${spokenText ? `Borrador fonético de referencia: "${spokenText}"` : ''}
Responde ÚNICAMENTE con el objeto JSON válido: { "text": "...", "detectedTone": "..." }`;

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const parts: any[] = [];

      if (hasAudio) {
        const cleanMime = mimeType.split(';')[0].trim() || 'audio/webm';
        parts.push({
          inlineData: {
            mimeType: cleanMime,
            data: base64Data,
          },
        });
      }

      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const raw = (response.text || '').trim();
      const cleaned = raw
        .replace(/^```json/i, '')
        .replace(/^```/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      const text = String(parsed.text || '').trim();
      const detectedTone = String(parsed.detectedTone || 'calma, firme, íntima').trim();
      const totalTokens = response.usageMetadata?.totalTokenCount || 0;

      if (text) {
        return {
          text,
          detectedTone,
          source: 'GEMINI_LIVE',
          totalTokens,
        };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Transcribe] Model ${model} attempt failed:`, err?.message || err);
    }
  }

  // Fallback: If spokenText exists, clean with Gemini
  if (spokenText && spokenText.trim().length > 0) {
    try {
      const textPrompt = `Puntúa y limpia editorialmente este texto dictado por voz en español:
"${spokenText}"
Elimina muletillas. Devuelve ÚNICAMENTE un JSON: { "text": "...", "detectedTone": "calma, reflexiva, serena" }`;

      const textRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: textPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const cleaned = (textRes.text || '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.text) {
        return {
          text: String(parsed.text).trim(),
          detectedTone: String(parsed.detectedTone || 'calma, firme, íntima').trim(),
          source: 'GEMINI_LIVE',
          totalTokens: textRes.usageMetadata?.totalTokenCount || 0,
        };
      }
    } catch (_) {}

    return {
      text: cleanSpokenText(spokenText, previousTextTail),
      detectedTone: 'calma, firme, íntima',
      source: 'GEMINI_LIVE',
      totalTokens: 0,
    };
  }

  throw lastError || new Error('No se pudo procesar la transcripción con Gemini.');
}

/**
 * Generates Rampage batch of 3 affirmations using Gemini Flash-Lite and AYA Method prompt.
 */
export async function generateRampageWithGemini(
  centralTheme: string,
  specifications?: string,
  detectedTone?: string,
  previousAffirmations: string[] = [],
  batchSize: number = 3
): Promise<{ affirmations: string[]; source: 'GEMINI_LIVE'; totalTokens: number }> {
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const modelsToTry = [
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
  ];

  const tone = detectedTone || 'calma, firme, íntima';

  const prompt = `Eres un arquitecto de reprogramación subconsciente estilo Método AYA. Genera un lote de exactamente ${batchSize} afirmaciones encadenadas en primera persona ('Yo...', 'Mi...', 'Siento cómo...') basadas en:
- Tema central: "${centralTheme}"
${specifications ? `- Especificaciones opcionales: "${specifications}"` : ''}
- Cadencia vocal del usuario: "${tone}"
${
  previousAffirmations && previousAffirmations.length > 0
    ? `- Afirmaciones previas inmediatas:
${previousAffirmations.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
    : ''
}

REGLAS DE ORO PARA REPRODUCCIÓN EN VOZ PROPIA:
1. Longitud hablada: Cada afirmación debe tener entre 8 y 16 palabras para poder pronunciarse en una sola respiración natural.
2. Puntuación prosódica obligatoria: Usa comas (,), puntos y coma (;) y puntos suspensivos (...) estratégicos para marcar pausas respiratorias naturales y dar peso emocional a las palabras clave.
3. Encadenamiento progresivo: La afirmación 1 conecta con la anterior; la 2 profundiza la sensación física del deseo cumplido; la 3 ancla la certeza absoluta en el presente.

Responde ÚNICAMENTE con un array JSON válido de exactamente ${batchSize} strings con las afirmaciones.
Ejemplo de formato:
["Primera afirmación...", "Segunda afirmación...", "Tercera afirmación..."]`;

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = (response.text || '').trim();
      const cleaned = rawText
        .replace(/^```json/i, '')
        .replace(/^```/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          affirmations: parsed.slice(0, batchSize).map((s) => String(s).trim()),
          source: 'GEMINI_LIVE',
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Rampage] Failed with model ${model}:`, err?.message || err);
    }
  }

  throw lastError || new Error('No se pudo generar el lote de Rampage con Gemini.');
}

/**
 * Synthesizes a valid playable WAV audio buffer in Node.js (RIFF format, 24kHz, 16-bit PCM).
 * Produces a warm, melodic vocal chant matching affirmation duration for sandbox/mock testing.
 */
export function generateSyntheticWavBuffer(
  text: string,
  targetDurationSeconds?: number
): Buffer {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;

  // Approximate duration: ~0.24s per word, minimum 2.4s, maximum 4.8s
  const wordCount = (text || '').trim().split(/\s+/).length || 10;
  const duration =
    targetDurationSeconds || Math.min(4.8, Math.max(2.4, wordCount * 0.26));
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = Buffer.alloc(totalSize);

  // 1. RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalSize - 8, 4);
  buffer.write('WAVE', 8);

  // 2. fmt Chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1Size
  buffer.writeUInt16LE(1, 20); // audioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // byteRate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // blockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);

  // 3. data Chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Base vocal fundamental frequencies (F0: ~160Hz with soft harmonics)
  const f0 = 165;
  const f1 = f0 * 2;
  const f2 = f0 * 3;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Smooth envelope: 200ms attack, gentle release at end
    const attack = Math.min(1, t / 0.25);
    const release = Math.min(1, (duration - t) / 0.35);
    const envelope = attack * Math.max(0, release);

    // Subtle human pitch modulation (prosodic cadence)
    const pitchMod = Math.sin(2 * Math.PI * 1.5 * t) * 6;
    const currentF0 = f0 + pitchMod;

    // Harmonic blend
    const wave =
      Math.sin(2 * Math.PI * currentF0 * t) * 0.65 +
      Math.sin(2 * Math.PI * f1 * t) * 0.25 +
      Math.sin(2 * Math.PI * f2 * t) * 0.1;

    // Amplitude modulation for word rhythm pulses
    const pulseMod = 0.8 + 0.2 * Math.sin(2 * Math.PI * 3.8 * t);

    const sample = Math.floor(wave * envelope * pulseMod * 16000);
    const clamped = Math.max(-32768, Math.min(32767, sample));

    buffer.writeInt16LE(clamped, headerSize + i * 2);
  }

  return buffer;
}

/**
 * Standard client telemetry logger
 */
export function logAiTelemetry(
  endpoint: string,
  source: 'SANDBOX_MOCK' | 'GEMINI_LIVE',
  totalTokens: number,
  extra?: Record<string, any>
) {
  if (typeof window !== 'undefined') {
    console.debug(`[AI Telemetry] ${endpoint}`, {
      source,
      totalTokens,
      ...(extra || {}),
      timestamp: new Date().toISOString(),
    });
  }
}
