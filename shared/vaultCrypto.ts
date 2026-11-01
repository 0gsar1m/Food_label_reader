import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex, hexToBytes } from '@noble/ciphers/utils.js';
import { z } from 'zod';
import { vaultSchema, type HealthVault } from './profile';
const envelope = z
  .object({
    v: z.literal(1),
    nonce: z.string().regex(/^[a-f0-9]{24}$/),
    ciphertext: z
      .string()
      .regex(/^[a-f0-9]+$/)
      .max(2_000_000),
  })
  .strict();

function encodeUtf8(text: string): Uint8Array {
  const escaped = encodeURIComponent(text);
  const bytes: number[] = [];
  for (let i = 0; i < escaped.length; i++) {
    if (escaped[i] === '%') {
      bytes.push(Number.parseInt(escaped.slice(i + 1, i + 3), 16));
      i += 2;
    } else bytes.push(escaped.charCodeAt(i));
  }
  return Uint8Array.from(bytes);
}
function decodeUtf8(bytes: Uint8Array): string {
  return decodeURIComponent(
    Array.from(bytes, (b) => `%${b.toString(16).padStart(2, '0')}`).join(''),
  );
}
/** AES-256-GCM authenticates encrypted device data; callers provide a fresh random nonce. */
export function sealVault(data: HealthVault, key: Uint8Array, nonce: Uint8Array): string {
  if (key.length !== 32 || nonce.length !== 12)
    throw new Error('Invalid cryptographic parameters.');
  const plaintext = encodeUtf8(JSON.stringify(vaultSchema.parse(data)));
  return JSON.stringify({
    v: 1,
    nonce: bytesToHex(nonce),
    ciphertext: bytesToHex(gcm(key, nonce).encrypt(plaintext)),
  });
}
/** Authentication failure never falls back to plaintext or silently resets health data. */
export function openVault(raw: string, key: Uint8Array): HealthVault {
  const parsed = envelope.parse(JSON.parse(raw));
  const decoded = gcm(key, hexToBytes(parsed.nonce)).decrypt(hexToBytes(parsed.ciphertext));
  return vaultSchema.parse(JSON.parse(decodeUtf8(decoded)));
}
