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
 * Generates coherent simulated transcript with perfect punctuation for Spanish audio.
 */
export function generateMockTranscript(previousTextTail?: string): string {
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
    return randomSentence;
  }

  const lastChar = tail.slice(-1);
  const isTerminated = ['.', '!', '?', ';', '\n'].includes(lastChar);

  if (isTerminated) {
    return randomSentence;
  }

  // Lowercase first letter if continuing an unclosed sentence
  return randomSentence.charAt(0).toLowerCase() + randomSentence.slice(1);
}

/**
 * Generates coherent mystical numbered affirmations connected to centralTheme.
 */
export function generateMockRampage(
  centralTheme: string,
  batchIndex: number = 0,
  batchSize: number = 3
): string[] {
  const theme = centralTheme.trim() || 'mi paz y plenitud';

  const templates = [
    [
      `Mi mente y mi corazón vibran en perfecta armonía con ${theme}.`,
      `Permito que la energía de ${theme} fluya libre y poderosamente en mi vida.`,
      `Agradezco con certeza que ${theme} ya se manifiesta en cada uno de mis pasos.`,
    ],
    [
      `Elijo soltar cualquier resistencia y abrirme a la plenitud de ${theme}.`,
      `Cada respiración me conecta más profundamente con la frecuencia de ${theme}.`,
      `Soy un canal abierto para recibir y expandir todo lo relacionado con ${theme}.`,
    ],
    [
      `Reconozco mi poder creador y decreto la victoria de ${theme} en mi día a día.`,
      `El universo conspira a mi favor para anclar firmemente ${theme} en mi realidad.`,
      `Me siento en paz sabiendo que ${theme} es una verdad inmutable en mi presente.`,
    ],
    [
      `Mi energía magnética atrae todas las condiciones perfectas para ${theme}.`,
      `Celebro anticipadamente los frutos hermosos que nacen desde ${theme}.`,
      `En este instante sagrado, reclamo y sostengo la plenitud de ${theme}.`,
    ],
  ];

  const pool = templates[batchIndex % templates.length];
  return pool.slice(0, batchSize);
}

/**
 * Transcribe audio using Google GenAI or fallback smoothly.
 */
export async function transcribeAudioWithGemini(
  audioBuffer: Buffer,
  mimeType: string,
  previousTextTail?: string
): Promise<{ text: string; source: 'GEMINI_LIVE'; totalTokens: number }> {
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const modelsToTry = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-2.5-flash',
  ];

  const prompt = `Eres un transcriptor editorial experto para una aplicación espiritual y de manifestación (Manifest).
Tu tarea es transcribir el audio en español con impecable ortografía y puntuación editorial.

REGLAS ESTRICTAS:
1. Elimina completamente muletillas involuntarias ("eh", "este", "mmm", "o sea", "y bueno", "bueno") y repeticiones involuntarias.
2. Inyecta signos de puntuación exactos y naturales (comas, puntos, punto y coma, signos de interrogación y exclamación: ¿?, ¡!).
3. Mantén la primera persona y el tono emocional, espiritual y de manifestación del hablante.
4. Si se proporciona previousTextTail: "${(previousTextTail || '').slice(-60)}", asegúrate de que la transcripción encaje armónicamente al concatenarse (minúscula inicial si continúa una frase, o mayúscula si sigue a un punto).
5. Devuelve ÚNICAMENTE el texto limpio transcribido, sin comentarios, sin comillas envolventes ni explicaciones adicionales.`;

  const base64Data = audioBuffer.toString('base64');
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: base64Data,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      const text = (response.text || '').trim();
      const totalTokens = response.usageMetadata?.totalTokenCount || 0;

      return {
        text,
        source: 'GEMINI_LIVE',
        totalTokens,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Transcribe] Failed with model ${model}:`, err?.message || err);
    }
  }

  throw lastError || new Error('No se pudo procesar la transcripción con Gemini.');
}

/**
 * Generates Rampage batch of affirmations using Gemini.
 */
export async function generateRampageWithGemini(
  centralTheme: string,
  specifications?: string,
  previousAffirmations: string[] = [],
  batchSize: number = 3
): Promise<{ affirmations: string[]; source: 'GEMINI_LIVE'; totalTokens: number }> {
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const modelsToTry = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-2.5-flash',
  ];

  const prompt = `Eres una guía mística de manifestación consciente para la app Manifest.
Genera exactamente ${batchSize} afirmaciones poderosas, concisas y rítmicas para una sesión de Rampage (secuencia de alta vibración).

TEMA CENTRAL: "${centralTheme}"
${specifications ? `ESPECIFICACIONES / MATICES A CONSIDERAR: "${specifications}"` : ''}
${
  previousAffirmations && previousAffirmations.length > 0
    ? `AFIRMACIONES PREVIAS (NO REPETIR ESTAS IDEAS NI ESTRUCTURAS):
${previousAffirmations.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
    : ''
}

REGLAS DE ORO:
1. En primera persona del presente ("Yo soy...", "Decreto...", "Merezco...", "Permito...", "Agradezco...").
2. Tono inspirador, expansivo, seguro y sin negatividad.
3. Máximo 1 a 2 oraciones por afirmación.
4. Responde ÚNICAMENTE con un array JSON válido de strings con las ${batchSize} afirmaciones, sin código markdown ni texto adicional.
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
