import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { analysisSchema, validateAnalysis, type Analysis } from '../../shared/analysis';
import { copy } from '../content';
import { validateApiUrl } from '../../shared/connection';

let webToken = '';
const secretKey = 'etiket.api-token';

/** The optional service token is Keychain/Keystore-backed on device and session-only on web. */
export async function loadAccessToken(): Promise<string> {
  return Platform.OS === 'web' ? webToken : ((await SecureStore.getItemAsync(secretKey)) ?? '');
}

/** Clearing a token deletes its device secret rather than storing an empty value. */
export async function saveAccessToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    webToken = token;
    return;
  }
  if (token) await SecureStore.setItemAsync(secretKey, token);
  else await SecureStore.deleteItemAsync(secretKey);
}

/** Public, localized errors never expose provider text or credentials. */
export class ScanError extends Error {
  constructor(public readonly code: keyof typeof copy.errors) {
    super(copy.errors[code]);
  }
}

/** Single request with caller cancellation; the server enforces its own stricter timeout. */
export async function requestAnalysis(
  url: string,
  image: string,
  token: string,
  signal: AbortSignal,
): Promise<Analysis> {
  let response: Response;
  try {
    response = await fetch(`${validateApiUrl(url)}/api/analyze`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ image, mimeType: 'image/jpeg' }),
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new ScanError('NETWORK');
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = z.object({ error: z.string() }).safeParse(payload);
    const code = parsed.success ? parsed.data.error : 'UNKNOWN';
    throw new ScanError(
      Object.hasOwn(copy.errors, code) ? (code as keyof typeof copy.errors) : 'UNKNOWN',
    );
  }
  try {
    return validateAnalysis(z.object({ analysis: analysisSchema }).parse(payload).analysis);
  } catch {
    throw new ScanError('INVALID_RESULT');
  }
}

/** Health checks are bounded and expose only deployment readiness, never the API key. */
export async function checkConnection(url: string): Promise<string> {
  const response = await fetch(`${validateApiUrl(url)}/health`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Sunucuya ulaşılamadı.');
  const health = z
    .object({
      status: z.literal('ok'),
      configured: z.boolean(),
      model: z.string(),
      authenticationRequired: z.boolean(),
    })
    .parse(await response.json());
  return health.configured
    ? `Sunucu hazır. Model: ${health.model}.${health.authenticationRequired ? ' Erişim anahtarı gerekli.' : ''}`
    : 'Sunucuya bağlanıldı. Sunucuda Gemini API anahtarı eksik.';
}
