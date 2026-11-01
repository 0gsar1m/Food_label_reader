import { describe, it, expect } from 'vitest';
import { issueSession, verifySession, googleConfigured, googleUser } from '../server/auth';
import { SignJWT } from 'jose';

const user = { id: '123456789012345678901', email: 'demo@example.com', name: 'Demo' };
const config = {
  sessionSecret: 'test-only-signing-key-with-32-characters',
  googleClientIds: ['test-web-client'],
};
describe('Google identity and application session', () => {
  it('does not claim configuration from missing credentials', () => {
    expect(googleConfigured({})).toBe(false);
    expect(googleConfigured({ ...config, sessionSecret: 'short' })).toBe(false);
  });
  it('issues and validates a correctly scoped signed session', async () => {
    const session = await issueSession(user, config);
    expect(await verifySession(session.token, config)).toEqual(user);
    expect(Date.parse(session.expiresAt)).toBeGreaterThan(Date.now());
  });
  it('rejects tampering, the wrong key and unsigned identity strings', async () => {
    const session = await issueSession(user, config);
    await expect(verifySession(session.token.slice(0, -5) + 'abcde', config)).rejects.toThrow();
    await expect(
      verifySession(session.token, {
        ...config,
        sessionSecret: 'different-test-signing-key-32-characters',
      }),
    ).rejects.toThrow();
    await expect(googleUser('not-a-signed-google-token', config)).rejects.toThrow();
  });
  it('rejects expired sessions even when the signature is valid', async () => {
    const token = await new SignJWT({ email: user.email, name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuer('etiket-api')
      .setAudience('etiket-mobile')
      .setExpirationTime(Math.floor(Date.now() / 1000) - 1)
      .sign(new TextEncoder().encode(config.sessionSecret));
    await expect(verifySession(token, config)).rejects.toThrow();
  });
  it('rejects wrong issuer and audience', async () => {
    const token = await new SignJWT({ email: user.email, name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuer('unrelated-api')
      .setAudience('other-app')
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(config.sessionSecret));
    await expect(verifySession(token, config)).rejects.toThrow();
  });
  it('validates the testing verifier output just like production claims', async () => {
    await expect(
      googleUser('test', {
        ...config,
        verifyGoogle: async () => ({ ...user, id: '../other-owner' }),
      }),
    ).rejects.toThrow();
  });
});
