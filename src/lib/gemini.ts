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
 * Cleans real spoken text when offline / fallback. Never generates fake decrees.
 */
export function generateMockTranscript(
  previousTextTail?: string,
  spokenText?: string
): { text: string; detectedTone: string } {
  const detectedTone = 'calma, firme, íntima';

  if (spokenText && spokenText.trim().length > 0) {
    return {
      text: cleanSpokenText(spokenText, previousTextTail),
      detectedTone,
    };
  }

  return {
    text: '',
    detectedTone,
  };
}

/**
 * Short, natural 2-7 word subliminal affirmations (zero template concatenations).
 */
export function generateMockRampage(
  centralTheme: string,
  batchIndex: number = 0,
  batchSize: number = 3
): string[] {
  const theme = (centralTheme || '').trim().replace(/^(mi|el|la|los|las|un|una)\s+/i, '');
  const pool = [
    [
      theme ? `Soy ${theme}.` : 'Soy Dios.',
      'Todo fluye a mi favor.',
      'Soy profundamente amado.',
    ],
    [
      'Siempre me eligen.',
      theme ? `Merezco ${theme}.` : 'Merezco todo lo bueno.',
      'Soy deseado.',
    ],
    [
      'Mi mente está en paz.',
      'Todo se acomoda perfecto.',
      'Soy magnético.',
    ],
    [
      'Confío en mi poder.',
      'La abundancia me busca.',
      'Soy paz infinita.',
    ],
  ];

  const set = pool[batchIndex % pool.length];
  return set.slice(0, batchSize);
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
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
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

export interface RampageGenerationOptions {
  centralTheme?: string;
  specifications?: string;
  userAffirmations?: string[];
  journalHighlights?: string[];
  userScope?: string;
  detectedTone?: string;
  previousAffirmations?: string[];
  batchSize?: number;
}

/**
 * Generates Rampage batch of 3 subliminal affirmations using Gemini Flash and user dynamic popurrí.
 */
export async function generateRampageWithGemini(
  centralThemeOrOptions: string | RampageGenerationOptions,
  specifications?: string,
  detectedTone?: string,
  previousAffirmations: string[] = [],
  batchSize: number = 3
): Promise<{ affirmations: string[]; source: 'GEMINI_LIVE'; totalTokens: number }> {
  const options: RampageGenerationOptions =
    typeof centralThemeOrOptions === 'object'
      ? centralThemeOrOptions
      : {
          centralTheme: centralThemeOrOptions,
          specifications,
          detectedTone,
          previousAffirmations,
          batchSize,
        };

  const count = options.batchSize || 3;
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const modelsToTry = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
  ];

  const prompt = `Eres el motor de Reprogramación Subliminal y Rampage AYA.
Tu objetivo es generar lotes de ${count} afirmaciones en primera persona para escuchar en bucle subliminal con auriculares en modo automático o mientras duermes.

FUENTES DEL USUARIO PARA EL POPURRÍ VIVO:
${options.userAffirmations && options.userAffirmations.length > 0 ? `✦ Afirmaciones personales guardadas por el usuario:\n${options.userAffirmations.slice(0, 8).map((a) => `  - "${a}"`).join('\n')}` : ''}
${options.journalHighlights && options.journalHighlights.length > 0 ? `✦ Fragmentos e intenciones del diario del usuario:\n${options.journalHighlights.slice(0, 5).map((j) => `  - "${j}"`).join('\n')}` : ''}
${options.specifications ? `✦ Deseos y matices específicos dictados/escritos para hoy: "${options.specifications}"` : ''}
${options.centralTheme ? `✦ Enfoque complementario: "${options.centralTheme}"` : ''}
${options.previousAffirmations && options.previousAffirmations.length > 0 ? `✦ Afirmaciones previas ya pronunciadas (no repetir idénticas):\n${options.previousAffirmations.map((a, i) => `  ${i + 1}. ${a}`).join('\n')}` : ''}

REGLAS ESTRICTAS DE ESTILO SUBLIMINAL (CERO TEXTOS POÉTICOS LARGOS):
1. SIMPLICIDAD Y LONGITUD ESTRICTA: Cada afirmación debe tener estrictamente entre 2 y 7 palabras como máximo.
2. NATURALIDAD Y LENGUAJE DIRECTO: Usa lenguaje cotidiano, asertivo, íntimo y poderoso en tiempo presente o certeza absoluta.
   Ejemplos del estilo requerido:
   - "Soy Dios."
   - "Soy profundamente amado."
   - "Soy deseado."
   - "Todo fluye a mi favor."
   - "Siempre me eligen."
   - "Mi cabello es muy sedoso."
   - "El dinero llega constante."
   - "Soy magnético."
3. SÍNTESIS DE POPURRÍ: Conecta de manera armónica las afirmaciones guardadas y los matices del usuario en frases cortas y contundentes.
4. Devuelve ÚNICAMENTE un JSON { "affirmations": string[] } con ${count} afirmaciones nuevas encadenadas.`;

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
      let items: string[] = [];
      if (Array.isArray(parsed)) {
        items = parsed;
      } else if (parsed && Array.isArray(parsed.affirmations)) {
        items = parsed.affirmations;
      }

      if (items.length > 0) {
        return {
          affirmations: items.slice(0, batchSize).map((s) => String(s).trim()),
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
