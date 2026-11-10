import 'dotenv/config';
import { z } from 'zod';
import { createApi } from './app';

const environment = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535).default(8787),
    GEMINI_API_KEY: z.string().default(''),
    GEMINI_MODEL: z
      .string()
      .regex(/^[a-zA-Z0-9._-]+$/)
      .default('gemini-3.5-flash-lite'),
    PERSONAL_MODEL: z
      .string()
      .regex(/^[a-zA-Z0-9._-]+$/)
      .default('gemini-3.5-flash-lite'),
    GEMINI_FALLBACK_MODEL: z.string().regex(/^[a-zA-Z0-9._-]+$/).optional(),
    PERSONAL_FALLBACK_MODEL: z.string().regex(/^[a-zA-Z0-9._-]+$/).optional(),
    GOOGLE_CLIENT_IDS: z.string().default(''),
    SESSION_SECRET: z.string().min(32).optional(),
    REQUIRE_GOOGLE_AUTH: z.enum(['true', 'false']).default('false'),
    APP_ACCESS_TOKEN: z.string().min(24).optional(),
    GUEST_ACCESS_UNTIL: z.iso.datetime({ offset: true }).optional(),
    GUEST_REQUEST_LIMIT: z.coerce.number().int().min(1).max(90).optional(),
    ALLOWED_ORIGINS: z.string().default('http://localhost:8081,http://localhost:8082'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  })
  .parse(process.env);

const app = createApi({
  apiKey: environment.GEMINI_API_KEY,
  googleClientIds: environment.GOOGLE_CLIENT_IDS.split(',')
    .map((v) => v.trim())
    .filter(Boolean),
  sessionSecret: environment.SESSION_SECRET,
  requireGoogleAuth: environment.REQUIRE_GOOGLE_AUTH === 'true',
  personalKey: environment.GEMINI_API_KEY,
  personalModel: environment.PERSONAL_MODEL,
  personalFallbackModel: environment.PERSONAL_FALLBACK_MODEL,
  model: environment.GEMINI_MODEL,
  fallbackModel: environment.GEMINI_FALLBACK_MODEL,
  accessToken: environment.APP_ACCESS_TOKEN,
  guestAccessUntil: environment.GUEST_ACCESS_UNTIL
    ? Date.parse(environment.GUEST_ACCESS_UNTIL)
    : undefined,
  guestRequestLimit: environment.GUEST_REQUEST_LIMIT,
  origins: environment.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()),
  production: environment.NODE_ENV === 'production',
  trustProxy: environment.TRUST_PROXY_HOPS,
});
const server = app.listen(environment.PORT, '0.0.0.0', () =>
  console.info(
    `Nazif API listening on port ${environment.PORT}; model ${environment.GEMINI_MODEL}`,
  ),
);
server.requestTimeout = 45_000;
server.headersTimeout = 10_000;
process.on('SIGTERM', () => server.close());
