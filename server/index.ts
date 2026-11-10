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
      .default('gemini-3.8-flash'),
    ANTHROPIC_API_KEY: z.string().default(''),
    PERSONAL_MODEL: z
      .string()
      .regex(/^[a-zA-Z0-9._-]+$/)
      .default('claude-sonnet-5-5'),
    GOOGLE_CLIENT_IDS: z.string().default(''),
    SESSION_SECRET: z.string().min(32).optional(),
    REQUIRE_GOOGLE_AUTH: z.enum(['true', 'false']).default('false'),
    APP_ACCESS_TOKEN: z.string().min(24).optional(),
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
  personalKey: environment.ANTHROPIC_API_KEY,
  personalModel: environment.PERSONAL_MODEL,
  model: environment.GEMINI_MODEL,
  accessToken: environment.APP_ACCESS_TOKEN,
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
