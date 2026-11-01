import { describe, expect, it } from 'vitest';
import { validateAnalysis, scanRequestSchema, preferencesSchema } from '../shared/analysis';
import { validateApiUrl } from '../shared/connection';
import { demoAnalysis } from '../src/data/demo';

describe('evidence-based extraction', () => {
  it('keeps contains and precautionary traces distinct', () => {
    const result = validateAnalysis(demoAnalysis);
    expect(result.allergens.find((item) => item.id === 'milk')?.presence).toBe('contains');
    expect(result.allergens.find((item) => item.id === 'nuts')?.presence).toBe('may_contain');
  });
  it('rejects an allergen without exact transcribed evidence', () => {
    expect(() =>
      validateAnalysis({
        ...demoAnalysis,
        allergens: [{ id: 'egg', presence: 'contains', evidence: 'yumurta içerir' }],
      }),
    ).toThrow('evidence');
  });
  it('rejects ingredient explanations without label evidence', () => {
    expect(() =>
      validateAnalysis({
        ...demoAnalysis,
        ingredients: [{ name: 'Bal', explanation: 'Tatlandırıcı.', evidence: 'Bal' }],
      }),
    ).toThrow('evidence');
  });
  it('tolerates Turkish casing and whitespace without changing source text', () => {
    const result = validateAnalysis({
      ...demoAnalysis,
      ingredients: [
        { name: 'Yağsız süt tozu', explanation: 'Süt bileşeni.', evidence: 'YAĞSIZ  SÜT TOZU' },
      ],
    });
    expect(result.ingredients[0]?.evidence).toBe('YAĞSIZ  SÜT TOZU');
  });
  it('does not accept clear output without readable ingredients', () => {
    expect(() => validateAnalysis({ ...demoAnalysis, ingredients: [] })).toThrow('ingredients');
  });
  it('requires an explanation for incomplete photographs', () => {
    expect(() => validateAnalysis({ ...demoAnalysis, readability: 'partial' })).toThrow(
      'uncertainty',
    );
  });
  it('rejects findings for unreadable photographs', () => {
    expect(() => validateAnalysis({ ...demoAnalysis, readability: 'unreadable' })).toThrow(
      'Unreadable',
    );
  });
  it('accepts unreadable without inventing a product', () => {
    expect(
      validateAnalysis({
        readability: 'unreadable',
        productName: null,
        rawText: '',
        summary: 'İçindekiler okunamıyor. Tekrar çek.',
        ingredients: [],
        allergens: [],
        additives: [],
        uncertainties: ['Fotoğraf bulanık.'],
      }).productName,
    ).toBeNull();
  });
  it('does not require E codes where none were printed', () => {
    expect(
      validateAnalysis({
        ...demoAnalysis,
        additives: [{ ...demoAnalysis.additives[0], code: null }],
      }).additives[0]?.code,
    ).toBeNull();
  });
  it('rejects provider URLs and unknown profile IDs at the input boundary', () => {
    expect(
      scanRequestSchema.safeParse({ image: 'https://internal/secret', mimeType: 'image/jpeg' })
        .success,
    ).toBe(false);
    expect(preferencesSchema.safeParse(['unverified-allergen']).success).toBe(false);
  });
});

describe('endpoint handling', () => {
  it.each([
    'https://api.example.com',
    'http://localhost:8787',
    'http://192.168.1.10:8787',
    'http://10.0.2.2:8787',
  ])('allows %s', (url) => expect(validateApiUrl(url)).toBe(url));
  it.each([
    'http://api.example.com',
    'https://user:password@example.com',
    'https://api.example.com/path',
    'https://api.example.com?token=secret',
    'file:///secret',
    'http://192.168.attacker.com',
  ])('rejects %s', (url) => expect(() => validateApiUrl(url)).toThrow());
});
