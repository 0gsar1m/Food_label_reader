import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { createApi } from '../server/app';
import { makeDemoVault } from '../shared/demoScenario';
import { demoAnalysis } from '../src/data/demo';
import { personalEnvelope } from '../src/lib/personalApi';

const key = process.env.GEMINI_API_KEY ?? '';
const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const personalModel = process.env.PERSONAL_MODEL?.startsWith('gemini-')
  ? process.env.PERSONAL_MODEL
  : 'gemini-3.5-flash-lite';
const token = randomUUID();
const origin = 'http://localhost:8082';
const provider: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  console.log(JSON.stringify({ event: 'provider', status: response.status }));
  if (process.argv.includes('--inspect-synthetic') && response.ok) {
    const candidate = z
      .object({
        candidates: z.array(
          z.object({
            finishReason: z.string().optional(),
            content: z
              .object({
                parts: z.array(
                  z.object({
                    text: z.string().optional(),
                    thought: z.boolean().optional(),
                  }),
                ),
              })
              .optional(),
          }),
        ),
      })
      .safeParse(await response.clone().json());
    const first = candidate.success ? candidate.data.candidates[0] : undefined;
    console.log(
      JSON.stringify({
        event: 'synthetic-output',
        finish: first?.finishReason,
        text: first?.content?.parts
          .filter((part) => !part.thought)
          .map((part) => part.text)
          .join('')
          .slice(0, 2400),
      }),
    );
  }
  return response;
};
const app = createApi({
  apiKey: key,
  model,
  personalKey: key,
  personalModel,
  fetcher: provider,
  personalFetcher: provider,
  accessToken: token,
  production: true,
  origins: [origin],
});

async function main(): Promise<void> {
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No API address.');
    const base = `http://127.0.0.1:${address.port}`;
    let failures = 0;
    async function step(
      name: string,
      path: string,
      expected: number,
      body?: object,
      authorized = true,
    ) {
      const start = performance.now();
      try {
        const response = await fetch(base + path, {
          method: body ? 'POST' : 'GET',
          headers: {
            Origin: origin,
            ...(authorized ? { Authorization: `Bearer ${token}` } : {}),
            ...(body ? { 'Content-Type': 'application/json' } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(40_000),
        });
        const payload = z
          .object({
            status: z.string().optional(),
            configured: z.boolean().optional(),
            personalConfigured: z.boolean().optional(),
            googleConfigured: z.boolean().optional(),
            error: z.string().optional(),
            model: z.string().optional(),
            usage: z.unknown().optional(),
            result: z.unknown().optional(),
            evidence: z.unknown().optional(),
            analysis: z
              .object({ productName: z.string().nullable(), readability: z.string() })
              .optional(),
            product: z.unknown().optional(),
          })
          .parse(await response.json());
        if (response.status !== expected) failures++;
        console.log(
          JSON.stringify({
            step: name,
            status: response.status,
            expected,
            ms: Math.round(performance.now() - start),
            model: payload.model,
            error: payload.error,
            usage: payload.usage,
            analysis: payload.analysis,
            catalogueMatch: path.startsWith('/api/barcode') ? Boolean(payload.product) : undefined,
            googleConfigured: payload.googleConfigured,
            personalConfigured: payload.personalConfigured,
            result: payload.result,
          }),
        );
        return { payload, ok: response.ok };
      } catch {
        failures++;
        console.log(JSON.stringify({ step: name, error: 'TRANSPORT_OR_RESPONSE_FAILURE' }));
        return null;
      }
    }

    const scenario = makeDemoVault();
    const request = {
      consent: true,
      profile: { ...scenario.profile, geminiConsent: true },
      diary: scenario.diary,
      analysis: demoAnalysis,
      task: 'interpret',
      scenario: true,
    };
    if (process.argv.includes('--answer-only')) {
      const diary = scenario.diary.map((entry, index) =>
        index === 0
          ? {
              ...entry,
              notes:
                entry.notes +
                '\nTakip sorusu: Yulafı neyle yedin? Cevap: Yanında 200 ml süt içtim.',
            }
          : entry,
      );
      await step('scenario answer supplied directly', '/api/personalize', key ? 200 : 503, {
        ...request,
        diary,
      });
      process.exitCode = failures ? 1 : 0;
      return;
    }
    const label = {
      image: (await readFile('tests/fixtures/example-label.jpg')).toString('base64'),
      mimeType: 'image/jpeg',
    };
    const menu = {
      image: (await readFile('tests/fixtures/example-menu.png')).toString('base64'),
      mimeType: 'image/png',
      mode: 'menu',
    };
    await step('health', '/health', 200, undefined, false);
    await step('anonymous protected route', '/api/analyze', 401, label, false);
    await step('consent gate', '/api/personalize', 400, { ...request, consent: false });
    await step('google login without provider configuration', '/api/auth/google', 503, {
      idToken: 'synthetic-test-token-value',
    });
    if (!process.argv.includes('--comment-only'))
      await step('label vision with fictional fixture', '/api/analyze', key ? 200 : 503, label);
    const first = await step('scenario comparison', '/api/personalize', key ? 200 : 503, request);
    const parsed = personalEnvelope.safeParse(first?.payload);
    if (parsed.success && parsed.data.result.followUp) {
      const followUp = parsed.data.result.followUp;
      const index = Number(followUp.diaryId.slice('diary:'.length));
      const answer = index === 0 ? 'Yanında 200 ml süt içtim.' : 'Yanında başka gıda tüketmedim.';
      const updated = scenario.diary.map((entry, i) =>
        i === index
          ? {
              ...entry,
              notes: `${entry.notes}\nTakip sorusu: ${followUp.question} Cevap: ${answer}`,
            }
          : entry,
      );
      await step('scenario comparison after answer', '/api/personalize', 200, {
        ...request,
        diary: updated,
      });
    } else if (key) {
      failures++;
      console.log(
        JSON.stringify({ step: 'scenario comparison after answer', error: 'NO_FOLLOW_UP' }),
      );
    }
    await step('profile question selection', '/api/personalize', key ? 200 : 503, {
      ...request,
      task: 'questions',
      diary: [],
      analysis: null,
      scenario: undefined,
    });
    if (!process.argv.includes('--comment-only'))
      await step('menu vision with fictional fixture', '/api/food-context', key ? 200 : 503, menu);
    await step('catalogue lookup', '/api/barcode/3017620422003', 200);
    process.exitCode = failures ? 1 : 0;
  } finally {
    server.close();
  }
}

void main().catch(() => {
  console.error('Production rehearsal failed before completion.');
  process.exitCode = 1;
});
