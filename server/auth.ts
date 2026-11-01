import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';
import { userSchema, type AuthUser } from '../shared/auth';
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
/** Verification transport is replaceable only by tests, never by request parameters. */
export type AuthConfig = {
  googleClientIds?: string[];
  sessionSecret?: string;
  requireGoogleAuth?: boolean;
  verifyGoogle?: (token: string) => Promise<AuthUser>;
};
/** Google readiness never assumes that a fabricated client ID exists. */
export function googleConfigured(config: AuthConfig): boolean {
  return Boolean(
    config.googleClientIds?.length && config.sessionSecret && config.sessionSecret.length >= 32,
  );
}
/** Verifies Google's signature, issuer, expiry, audience and verified email before using stable sub. */
export async function googleUser(token: string, config: AuthConfig): Promise<AuthUser> {
  if (config.verifyGoogle) return userSchema.parse(await config.verifyGoogle(token));
  const { payload } = await jwtVerify(token, googleKeys, {
    audience: config.googleClientIds,
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    algorithms: ['RS256'],
  });
  if (payload.email_verified !== true) throw new Error('Unverified Google email.');
  return userSchema.parse({
    id: payload.sub,
    email: payload.email,
    name: typeof payload.name === 'string' ? payload.name : '',
  });
}
/** Stateless 24-hour application sessions; the raw Google token is not persisted. */
export async function issueSession(user: AuthUser, config: AuthConfig) {
  if (!googleConfigured(config)) throw new Error('Session signing is not configured.');
  const expiresAt = new Date(Date.now() + 86400_000).toISOString();
  const token = await new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuer('etiket-api')
    .setAudience('etiket-mobile')
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(config.sessionSecret));
  return { token, expiresAt, user };
}
/** Rejects tampered, expired or incorrectly scoped bearer tokens on every protected request. */
export async function verifySession(token: string, config: AuthConfig): Promise<AuthUser> {
  if (!config.sessionSecret || config.sessionSecret.length < 32)
    throw new Error('Session signing is not configured.');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(config.sessionSecret), {
    algorithms: ['HS256'],
    issuer: 'etiket-api',
    audience: 'etiket-mobile',
  });
  return userSchema.parse({ id: payload.sub, email: payload.email, name: payload.name });
}
