import { z } from 'zod';
import { personalRequestSchema, personalResponseSchema } from '../../shared/profile';
import { validateApiUrl } from '../../shared/connection';
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
    response = await fetch(`${validateApiUrl(url)}/api/personalize`, {
      method: 'POST',
      signal: AbortSignal.timeout(40000),
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(parsed),
    });
  } catch {
    throw new Error('Kişisel yorum hizmetine ulaşılamadı. Ağını kontrol et.');
  }
  if (!response.ok)
    throw new Error(
      response.status === 503
        ? 'Sunucuda kişisel yorum için Google Gemini anahtarı eksik. Profilin cihazda kullanılabilir.'
        : response.status === 401
          ? 'Sunucu erişim anahtarı eşleşmedi.'
          : 'Kişisel yorum tamamlanamadı. Biraz sonra tekrar dene.',
    );
  return personalEnvelope.parse(await response.json());
}
