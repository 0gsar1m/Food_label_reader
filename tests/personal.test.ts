import { describe, it, expect, vi } from 'vitest';
import {
  emptyProfile,
  followUps,
  personalRequestSchema,
  type HealthVault,
} from '../shared/profile';
import { sealVault, openVault } from '../shared/vaultCrypto';
import { portionValues } from '../shared/nutrition';
import { demoAnalysis } from '../src/data/demo';
import { personalize } from '../server/personal';
import { estimateCosts, baseCosts } from '../shared/costs';

const profile = {
  ...emptyProfile,
  completed: true,
  geminiConsent: true,
  goals: ['weight' as const],
  symptoms: ['bloating' as const],
};
const input = {
  consent: true as const,
  profile,
  diary: [],
  analysis: demoAnalysis,
  task: 'interpret' as const,
};
const success = {
  summary: 'Etikette yulaf var. Şişkinlik bildirimin tek başına kişisel neden göstermez.',
  findings: [{ text: 'Yulaf etikette belirtilmiş.', evidenceIds: ['label:text'] }],
  questionIds: ['context'],
};
function transport(result: unknown = success, stop = 'STOP') {
  return vi.fn<typeof fetch>().mockResolvedValue(
    Response.json({
      candidates: [
        {
          finishReason: stop,
          content: { parts: [{ thought: true }, { text: JSON.stringify(result) }] },
        },
      ],
      usageMetadata: { promptTokenCount: 1600, candidatesTokenCount: 700, thoughtsTokenCount: 100 },
    }),
  );
}
describe('sensitive health vault', () => {
  const key = new Uint8Array(32).fill(8);
  const nonce = new Uint8Array(12).fill(9);
  const vault: HealthVault = {
    version: 1,
    profile: { ...profile, conditions: 'Türkçe sağlık bildirimi: şişkinlik' },
    diary: [],
  };
  it('round trips Turkish data without storing plaintext', () => {
    const raw = sealVault(vault, key, nonce);
    expect(raw).not.toContain('şişkinlik');
    expect(openVault(raw, key)).toEqual(vault);
  });
  it('rejects a modified authentication tag', () => {
    const envelope = JSON.parse(sealVault(vault, key, nonce));
    envelope.ciphertext = envelope.ciphertext.slice(0, -2) + '00';
    expect(() => openVault(JSON.stringify(envelope), key)).toThrow();
  });
  it('rejects the wrong device key', () =>
    expect(() => openVault(sealVault(vault, key, nonce), new Uint8Array(32).fill(2))).toThrow());
  it('produces different ciphertext with fresh nonces', () =>
    expect(sealVault(vault, key, nonce)).not.toEqual(
      sealVault(vault, key, new Uint8Array(12).fill(10)),
    ));
  it('validates cryptographic parameters and stored schema', () => {
    expect(() => sealVault(vault, new Uint8Array(8), nonce)).toThrow();
    expect(() =>
      sealVault({ ...vault, version: 2 } as unknown as HealthVault, key, nonce),
    ).toThrow();
  });
});
describe('portion and goal logic', () => {
  const n = demoAnalysis.nutrition!;
  it('scales 100g values to 40g without an LLM', () =>
    expect(portionValues(n, 40, 'g')).toMatchObject({
      energyKcal: 160,
      proteinG: 3.2,
      carbohydrateG: 24,
    }));
  it('never converts missing nutrients to zero', () =>
    expect(portionValues({ ...n, proteinG: null }, 40, 'g').proteinG).toBeNull());
  it.each([0, -1, NaN, Infinity, 10001])('rejects invalid portion %s', (value) =>
    expect(() => portionValues(n, value, 'g')).toThrow(),
  );
  it('refuses incompatible mass and volume units', () =>
    expect(() => portionValues(n, 40, 'ml')).toThrow());
  it('tailors questions without making everyone answer skin questions', () => {
    expect(followUps(profile)).toContain('portion');
    expect(followUps(profile)).toContain('context');
    expect(followUps(profile)).not.toContain('skin');
    expect(followUps({ ...profile, symptoms: ['eczema'] })).toContain('skin');
  });
  it('cost scenarios are reproducible with independent fixed and variable charges', () => {
    const c = estimateCosts(baseCosts);
    expect(c.total).toBeCloseTo(1011.61);
    expect(estimateCosts({ ...baseCosts, priceWindow: 'standard2027' }).total).toBeCloseTo(1235.86);
    expect(estimateCosts({ ...baseCosts, personalFraction: 1 }).total).toBeCloseTo(1747.61);
    expect(c.scans).toBe(20000);
    expect(estimateCosts({ ...baseCosts, personalModel: 'sonnet' }).total).toBeCloseTo(639.93);
    expect(() => estimateCosts({ ...baseCosts, personalFraction: 2 })).toThrow();
  });
});
describe('grounded health-language contract', () => {
  it('requires consent at schema boundary', () =>
    expect(personalRequestSchema.safeParse({ ...input, consent: false }).success).toBe(false));
  it('uses current JSON output API, no forced tools and returns measured usage', async () => {
    const fetcher = transport();
    const result = await personalize(
      input,
      { personalKey: 'test', personalFetcher: fetcher },
      new AbortController().signal,
    );
    expect(result.usage.output_tokens).toBe(800);
    const body = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(body.tool_choice).toBeUndefined();
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.generationConfig.responseJsonSchema.properties.summary.type).toBe('string');
    expect(body.systemInstruction.parts[0].text).toContain('not causation');
    expect(body.contents[0].parts[0].text).not.toContain('image/jpeg');
  });
  it('keeps new question wording and drops repeated or answered topics', async () => {
    const text = 'Şişkinlik yaşadığın son öğünde ne yedin?';
    const result = await personalize(
      {
        ...input,
        task: 'questions',
        analysis: null,
        profile: { ...profile, answers: { routine: 'Meyve' } },
      },
      {
        personalKey: 'test',
        personalFetcher: transport({
          ...success,
          summary: '',
          findings: [],
          questionIds: [],
          questionSuggestions: [
            { id: 'context', text },
            { id: 'timing', text },
            { id: 'routine', text: 'Ara öğünde ne yersin?' },
          ],
        }),
      },
      new AbortController().signal,
    );
    expect(result.result.questionSuggestions).toEqual([{ id: 'context', text }]);
  });
  it('rejects invented medical citations', async () => {
    await expect(
      personalize(
        input,
        {
          personalKey: 'test',
          personalFetcher: transport({
            ...success,
            findings: [{ text: 'Uydurma', evidenceIds: ['source:invented'] }],
          }),
        },
        new AbortController().signal,
      ),
    ).rejects.toThrow('INVALID_RESULT');
  });
  it('rejects unrelated follow-up questions', async () => {
    await expect(
      personalize(
        input,
        { personalKey: 'test', personalFetcher: transport({ ...success, questionIds: ['skin'] }) },
        new AbortController().signal,
      ),
    ).rejects.toThrow('INVALID_RESULT');
  });
  it('rejects a valid-looking truncated response', async () => {
    await expect(
      personalize(
        input,
        { personalKey: 'test', personalFetcher: transport(success, 'MAX_TOKENS') },
        new AbortController().signal,
      ),
    ).rejects.toThrow('INVALID_RESULT');
  });
  it('enforces bounded content even when provider grammar does not', async () => {
    await expect(
      personalize(
        input,
        {
          personalKey: 'test',
          personalFetcher: transport({ ...success, summary: 'x'.repeat(1001) }),
        },
        new AbortController().signal,
      ),
    ).rejects.toThrow('INVALID_RESULT');
  });
  it('does not send unsupported or fabricated product extractions', async () => {
    const fetcher = transport();
    await expect(
      personalize(
        {
          ...input,
          analysis: {
            ...demoAnalysis,
            ingredients: [{ name: 'Yumurta', explanation: 'x', evidence: 'olmayan içerik' }],
          },
        },
        { personalKey: 'test', personalFetcher: fetcher },
        new AbortController().signal,
      ),
    ).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
