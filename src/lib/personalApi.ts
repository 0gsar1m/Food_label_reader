import { z } from 'zod';
import { personalRequestSchema, personalResponseSchema } from '../../shared/profile';
import { validateApiUrl } from '../../shared/connection';
import { fetchWithTimeout } from './fetchWithTimeout';

export class PersonalConnectionError extends Error {
  constructor(public readonly code: 'network' | 'unauthorized') {
    super(
      code === 'unauthorized'
        ? 'Sunucu erişim anahtarı eşleşmedi.'
        : 'Kişisel yorum hizmetine ulaşılamadı. Ağını kontrol et.',
    );
  }
}
/** Attributions returned by the API are rendered with their original evidence labels. */
export const personalEnvelope = z.object({
  result: personalResponseSchema,
  model: z.string(),
  evidence: z.array(
    z.object({ id: z.string(), text: z.string(), url: z.string().url().optional() }),
  ),
  usage: z.object({ input_tokens: z.number(), output_tokens: z.number() }),
});
/** Explicit button action only: caller must pass the independently stored health-data consent. */
export async function requestPersonal(
  url: string,
  token: string,
  input: z.infer<typeof personalRequestSchema>,
) {
  const parsed = personalRequestSchema.parse(input);
  if (!parsed.profile.geminiConsent)
    throw new Error('Kişisel yorum için profil aktarım iznini aç.');
  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${validateApiUrl(url)}/api/personalize`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(parsed),
      },
      40000,
    );
  } catch {
    throw new PersonalConnectionError('network');
  }
  if (response.status === 401) throw new PersonalConnectionError('unauthorized');
  if (!response.ok)
    throw new Error(
      response.status === 503
        ? 'Sunucuda kişisel yorum için Google Gemini anahtarı eksik. Profilin cihazda kullanılabilir.'
        : 'Kişisel yorum tamamlanamadı. Biraz sonra tekrar dene.',
    );
  return personalEnvelope.parse(await response.json());
}
