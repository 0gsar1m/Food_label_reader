import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { googleConfigured, googleUser, issueSession, verifySession, type AuthConfig } from './auth';
import { personalRequestSchema } from '../shared/profile';
import { personalize, type PersonalConfig } from './personal';
import { scanRequestSchema } from '../shared/analysis';
import { analyzeImage, analyzeFood, ProviderError, type VisionConfig } from './provider';
import { foodRequestSchema } from '../shared/foodContext';
import { lookupBarcode } from './barcode';
import { validGtin } from '../shared/barcode';

/** All deployment dependencies are explicit so tests never depend on machine secrets. */
export type ApiConfig = VisionConfig &
  AuthConfig &
  PersonalConfig & {
    accessToken?: string;
    origins: string[];
    production?: boolean;
    timeoutMs?: number;
    trustProxy?: number;
    catalogueFetcher?: typeof fetch;
    guestAccessUntil?: number;
    guestRequestLimit?: number;
  };

function authorized(expected: string, header: string | undefined): boolean {
  const supplied = Buffer.from(header?.startsWith('Bearer ') ? header.slice(7) : '');
  const actual = Buffer.from(expected);
  return supplied.length === actual.length && timingSafeEqual(supplied, actual);
}

function validImage(image: string, mime: string): boolean {
  const bytes = Buffer.from(image, 'base64');
  if (bytes.length > 5_000_000 || bytes.length < 16 || bytes.toString('base64') !== image)
    return false;
  return mime === 'image/jpeg'
    ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
}

/** API does not persist or log photos, provider output, tokens, or user preferences. */
export function createApi(config: ApiConfig): express.Express {
  const requireAccount = Boolean(
    config.requireGoogleAuth || (config.production && !config.accessToken),
  );
  if (
    config.production &&
    (!config.accessToken || config.accessToken.length < 24) &&
    !googleConfigured(config)
  ) {
    throw new Error('Production requires APP_ACCESS_TOKEN with at least 24 characters.');
  }
  if (config.requireGoogleAuth && !googleConfigured(config))
    throw new Error('Google authentication is required but not configured.');
  const app = express();
  let guestRequestsRemaining = config.guestRequestLimit ?? 30;
  const guestAccessOpen = () =>
    !requireAccount && Boolean(config.guestAccessUntil && Date.now() < config.guestAccessUntil);
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => callback(null, !origin || config.origins.includes(origin)),
    }),
  );
  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.get('/health', (_req, res) =>
    res.json({
      status: 'ok',
      configured: Boolean(config.apiKey),
      model: config.model,
      personalConfigured: Boolean(config.personalKey),
      personalModel: config.personalModel ?? 'gemini-3.5-flash-lite',
      authenticationRequired: (Boolean(config.accessToken) || requireAccount) && !guestAccessOpen(),
      googleConfigured: googleConfigured(config),
    }),
  );
  app.use(
    '/api',
    rateLimit({
      windowMs: 60_000,
      limit: 10,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'RATE_LIMITED' },
    }),
  );
  app.post('/api/auth/google', express.json({ limit: '16kb' }), async (req, res) => {
    const parsed = z
      .object({ idToken: z.string().min(20).max(12000) })
      .strict()
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'INVALID_CREDENTIAL' });
      return;
    }
    if (!googleConfigured(config)) {
      res.status(503).json({ error: 'GOOGLE_NOT_CONFIGURED' });
      return;
    }
    try {
      const user = await googleUser(parsed.data.idToken, config);
      res.json(await issueSession(user, config));
    } catch {
      res.status(401).json({ error: 'INVALID_CREDENTIAL' });
    }
  });
  app.use('/api', async (req, res, next) => {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : '';
    if (bearer && config.sessionSecret) {
      try {
        await verifySession(bearer, config);
        next();
        return;
      } catch {
        /* Service credentials are checked separately below. */
      }
    }
    if (
      requireAccount ||
      (config.accessToken && !authorized(config.accessToken, req.headers.authorization))
    ) {
      if (!bearer && guestAccessOpen()) {
        if (guestRequestsRemaining <= 0) {
          res.status(429).json({ error: 'RATE_LIMITED' });
          return;
        }
        guestRequestsRemaining--;
        next();
        return;
      }
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }
    next();
  });
  app.use(express.json({ limit: '14mb', strict: true }));
  app.get('/api/barcode/:code', async (req, res) => {
    const parsed = z.string().refine(validGtin).safeParse(req.params.code);
    if (!parsed.success) {
      res.status(400).json({ error: 'INVALID_BARCODE' });
      return;
    }
    try {
      res.json({ product: await lookupBarcode(parsed.data, config.catalogueFetcher) });
    } catch {
      res.status(502).json({ error: 'CATALOGUE_UNAVAILABLE' });
    }
  });
  app.post('/api/food-context', async (req, res) => {
    const input = foodRequestSchema.safeParse(req.body);
    if (!input.success || !validImage(input.data.image, input.data.mimeType)) {
      res.status(400).json({ error: 'INVALID_IMAGE' });
      return;
    }
    if (!config.apiKey) {
      res.status(503).json({ error: 'NOT_CONFIGURED' });
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs ?? 35_000);
    const cancel = (): void => {
      if (!res.writableEnded) controller.abort();
    };
    res.on('close', cancel);
    try {
      let usage: { inputTokens: number; outputTokens: number } | undefined;
      let model = config.model;
      const result = await analyzeFood(
        input.data.image,
        input.data.mimeType,
        input.data.mode,
        {
          ...config,
          reportModel: (value) => {
            model = value;
          },
          reportUsage: (value) => {
            usage = value;
          },
        },
        controller.signal,
      );
      if (!res.destroyed) res.json({ result, model, ...(usage ? { usage } : {}) });
    } catch (error) {
      const code = controller.signal.aborted
        ? 'TIMEOUT'
        : error instanceof ProviderError
          ? error.code
          : 'PROVIDER_UNAVAILABLE';
      if (!res.destroyed)
        res
          .status(code === 'TIMEOUT' ? 504 : code === 'RATE_LIMITED' ? 429 : 502)
          .json({ error: code });
    } finally {
      clearTimeout(timer);
      res.off('close', cancel);
    }
  });
  app.post('/api/analyze', async (req, res) => {
    const input = scanRequestSchema.safeParse(req.body);
    if (
      !input.success ||
      !validImage(input.data.image, input.data.mimeType) ||
      (input.success &&
        input.data.nutritionImage &&
        !validImage(input.data.nutritionImage, 'image/jpeg'))
    ) {
      res.status(400).json({ error: 'INVALID_IMAGE' });
      return;
    }
    if (!config.apiKey) {
      res.status(503).json({ error: 'NOT_CONFIGURED' });
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 35_000);
    const cancel = (): void => {
      if (!res.writableEnded) controller.abort();
    };
    res.on('close', cancel);
    try {
      let usage: { inputTokens: number; outputTokens: number } | undefined;
      let model = config.model;
      const analysis = await analyzeImage(
        input.data.image,
        input.data.mimeType,
        {
          ...config,
          reportModel: (value) => {
            model = value;
          },
          reportUsage: (value) => {
            usage = value;
          },
        },
        controller.signal,
        input.data.nutritionImage,
      );
      res.json({ analysis, model, ...(usage ? { usage } : {}) });
    } catch (error) {
      const code = controller.signal.aborted
        ? 'TIMEOUT'
        : error instanceof ProviderError
          ? error.code
          : 'PROVIDER_UNAVAILABLE';
      const status = code === 'RATE_LIMITED' ? 429 : code === 'TIMEOUT' ? 504 : 502;
      if (!res.destroyed) res.status(status).json({ error: code });
    } finally {
      clearTimeout(timeout);
      res.off('close', cancel);
    }
  });
  app.post('/api/personalize', async (req, res) => {
    const parsed = personalRequestSchema.safeParse(req.body);
    if (
      !parsed.success ||
      !(config.personalProvider === 'openai'
        ? parsed.data.profile.openaiConsent
        : parsed.data.profile.geminiConsent) ||
      (parsed.data.task === 'interpret' && !parsed.data.analysis)
    ) {
      res.status(400).json({ error: 'CONSENT_OR_INPUT_REQUIRED' });
      return;
    }
    if (!config.personalKey) {
      res.status(503).json({ error: 'NOT_CONFIGURED' });
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs ?? 35_000);
    const cancel = (): void => {
      if (!res.writableEnded) controller.abort();
    };
    res.on('close', cancel);
    try {
      res.json(await personalize(parsed.data, config, controller.signal));
    } catch (error) {
      if (!res.destroyed)
        res.status(controller.signal.aborted ? 504 : 502).json({
          error: controller.signal.aborted
            ? 'TIMEOUT'
            : error instanceof ProviderError
              ? error.code
              : 'INVALID_RESULT',
        });
    } finally {
      clearTimeout(timer);
      res.off('close', cancel);
    }
  });
  app.use((_req, res) => {
    res.status(404).json({ error: 'NOT_FOUND' });
  });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    const sizeError =
      error instanceof Error && 'type' in error && error.type === 'entity.too.large';
    res
      .status(sizeError ? 413 : 400)
      .json({ error: sizeError ? 'IMAGE_TOO_LARGE' : 'INVALID_REQUEST' });
  };
  app.use(errors);
  return app;
}
