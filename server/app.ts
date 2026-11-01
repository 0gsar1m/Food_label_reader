import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { timingSafeEqual } from 'node:crypto';
import { scanRequestSchema } from '../shared/analysis';
import { analyzeImage, ProviderError, type VisionConfig } from './provider';

/** All deployment dependencies are explicit so tests never depend on machine secrets. */
export type ApiConfig = VisionConfig & {
  accessToken?: string;
  origins: string[];
  production?: boolean;
  timeoutMs?: number;
  trustProxy?: number;
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
  if (config.production && (!config.accessToken || config.accessToken.length < 24)) {
    throw new Error('Production requires APP_ACCESS_TOKEN with at least 24 characters.');
  }
  const app = express();
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
      authenticationRequired: Boolean(config.accessToken),
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
  app.use('/api', (req, res, next) => {
    if (config.accessToken && !authorized(config.accessToken, req.headers.authorization)) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }
    next();
  });
  app.use(express.json({ limit: '7mb', strict: true }));
  app.post('/api/analyze', async (req, res) => {
    const input = scanRequestSchema.safeParse(req.body);
    if (!input.success || !validImage(input.data.image, input.data.mimeType)) {
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
      const analysis = await analyzeImage(
        input.data.image,
        input.data.mimeType,
        config,
        controller.signal,
      );
      res.json({ analysis, model: config.model });
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
