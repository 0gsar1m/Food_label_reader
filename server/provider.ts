import { z } from 'zod';
import { analysisSchema, validateAnalysis, type Analysis } from '../shared/analysis';
import { labelPrompt } from './prompt';

const providerResponse = z.object({
  candidates: z
    .array(
      z.object({
        finishReason: z.string().optional(),
        content: z
          .object({
            parts: z.array(
              z.object({ text: z.string().optional(), thought: z.boolean().optional() }),
            ),
          })
          .optional(),
      }),
    )
    .optional(),
});

/** Provider failures carry no raw response or API key into client messages. */
export class ProviderError extends Error {
  constructor(
    public readonly code: 'RATE_LIMITED' | 'PROVIDER_UNAVAILABLE' | 'INVALID_RESULT' | 'TIMEOUT',
  ) {
    super(code);
  }
}

/** Injectable transport supports realistic contract tests without paid model calls. */
export type VisionConfig = { apiKey: string; model: string; fetcher?: typeof fetch };

/** A single bounded multimodal call; invalid/blocked/truncated responses fail closed. */
export async function analyzeImage(
  image: string,
  mimeType: string,
  config: VisionConfig,
  signal: AbortSignal,
): Promise<Analysis> {
  const schema = z.toJSONSchema(analysisSchema);
  const response = await (config.fetcher ?? fetch)(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`,
    {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: labelPrompt }] },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: image } },
              { text: 'Bu gıda etiketini oku ve açıkla.' },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseJsonSchema: schema,
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingLevel: 'low' },
        },
      }),
    },
  );
  if (!response.ok)
    throw new ProviderError(response.status === 429 ? 'RATE_LIMITED' : 'PROVIDER_UNAVAILABLE');
  try {
    const parsed = providerResponse.parse(await response.json());
    const candidate = parsed.candidates?.[0];
    if (candidate?.finishReason !== 'STOP') throw new Error('Incomplete provider response.');
    const output = candidate.content?.parts
      .filter((part) => !part.thought)
      .map((part) => part.text ?? '')
      .join('');
    return validateAnalysis(JSON.parse(output ?? ''));
  } catch {
    throw new ProviderError('INVALID_RESULT');
  }
}
