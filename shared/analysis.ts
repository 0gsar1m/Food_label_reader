import { z } from 'zod';
import { nutritionSchema } from './nutrition';

/** Supported label declarations; preferences never imply a complete allergy profile. */
export const allergenIds = [
  'gluten',
  'milk',
  'egg',
  'peanut',
  'nuts',
  'soy',
  'sesame',
  'fish',
  'crustaceans',
  'molluscs',
  'celery',
  'mustard',
  'lupin',
  'sulphites',
] as const;

/** Turkish labels shared by preferences and evidence-based results. */
export const allergenNames: Record<AllergenId, string> = {
  gluten: 'Gluten içeren tahıllar',
  milk: 'Süt',
  egg: 'Yumurta',
  peanut: 'Yer fıstığı',
  nuts: 'Sert kabuklu yemişler',
  soy: 'Soya',
  sesame: 'Susam',
  fish: 'Balık',
  crustaceans: 'Kabuklular',
  molluscs: 'Yumuşakçalar',
  celery: 'Kereviz',
  mustard: 'Hardal',
  lupin: 'Acı bakla',
  sulphites: 'Kükürt dioksit / sülfitler',
};

/** Stable IDs avoid name-based allergy matching across languages. */
export type AllergenId = (typeof allergenIds)[number];
const shortText = z.string().trim().min(1).max(600);
const evidence = z.string().trim().min(1).max(500);

/** Bounded extraction contract used for both provider output and local history. */
export const analysisSchema = z.object({
  readability: z.enum(['clear', 'partial', 'unreadable']),
  productName: z.string().trim().min(1).max(120).nullable(),
  rawText: z.string().max(12000),
  summary: shortText,
  ingredients: z
    .array(z.object({ name: z.string().min(1).max(120), explanation: shortText, evidence }))
    .max(60),
  allergens: z
    .array(
      z.object({
        id: z.enum(allergenIds),
        presence: z.enum(['contains', 'may_contain']),
        evidence,
      }),
    )
    .max(28),
  additives: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        code: z
          .string()
          .regex(/^E\d{3,4}[a-z]?(?:\([ivx]+\))?$/i)
          .nullable(),
        purpose: shortText,
        evidence,
      }),
    )
    .max(30),
  uncertainties: z.array(shortText).max(12),
  nutrition: nutritionSchema.nullable().optional(),
});

/** Validated extraction, without personal preferences or photo bytes. */
export type Analysis = z.infer<typeof analysisSchema>;

const normalized = (value: string): string =>
  value.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();

/** Rejects fabricated evidence and internally inconsistent readable outputs. */
export function validateAnalysis(input: unknown): Analysis {
  const result = analysisSchema.parse(input);
  if (
    result.readability !== 'unreadable' &&
    (!result.rawText.trim() || !result.ingredients.length)
  ) {
    throw new Error('Readable output requires transcribed ingredients.');
  }
  if (
    result.readability === 'unreadable' &&
    (result.ingredients.length || result.allergens.length || result.additives.length)
  ) {
    throw new Error('Unreadable photos cannot supply findings.');
  }
  if (result.readability === 'partial' && !result.uncertainties.length) {
    throw new Error('Partial output requires an uncertainty.');
  }
  const findings = [...result.ingredients, ...result.allergens, ...result.additives];
  for (const finding of findings) {
    if (!normalized(result.rawText).includes(normalized(finding.evidence))) {
      throw new Error('Finding lacks transcribed label evidence.');
    }
  }
  if (result.nutrition) {
    for (const item of [result.nutrition, ...result.nutrition.micros]) {
      if (!normalized(result.rawText).includes(normalized(item.evidence)))
        throw new Error('Nutrition lacks transcribed evidence.');
    }
    if (result.readability === 'unreadable') throw new Error('Unreadable nutrition.');
  }
  return result;
}

/** Only compressed images are accepted; remote URLs are deliberately unsupported. */
export const scanRequestSchema = z
  .object({
    image: z
      .string()
      .min(16)
      .max(7_000_000)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/),
    mimeType: z.enum(['image/jpeg', 'image/png']),
    nutritionImage: z
      .string()
      .min(16)
      .max(7_000_000)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/)
      .optional(),
  })
  .strict();

/** Persisted records contain text only; demo is always explicit. */
export const recordSchema = z.object({
  id: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
  demo: z.boolean(),
  analysis: analysisSchema,
});

/** Device-only history entry. */
export type ScanRecord = z.infer<typeof recordSchema>;

/** Local preferences are never forwarded to the model. */
export const preferencesSchema = z.array(z.enum(allergenIds)).max(14);
