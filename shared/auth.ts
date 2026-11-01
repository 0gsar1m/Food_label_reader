import { z } from 'zod';
/** Identity claims are accepted only after server-side Google signature and audience validation. */
export const userSchema = z.object({
  id: z.string().regex(/^[0-9]{1,64}$/),
  email: z.string().email().max(320),
  name: z.string().max(150),
});
/** Short-lived application session, separate from the Google credential and API service key. */
export const sessionSchema = z.object({
  token: z.string().min(20).max(4096),
  expiresAt: z.string().datetime(),
  user: userSchema,
  origin: z.string().url(),
});
/** Minimal account identity, with no mailbox scopes. */
export type AuthUser = z.infer<typeof userSchema>;
/** Client keeps native sessions in SecureStore and web sessions in tab storage. */
export type AuthSession = z.infer<typeof sessionSchema>;
