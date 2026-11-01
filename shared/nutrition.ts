import { z } from 'zod';
const value = z.number().finite().min(0).max(100000).nullable();
/** Missing nutrients remain unknown; values refer to the explicitly printed basis. */
export const nutritionSchema = z.object({
  basisAmount: z.number().positive().max(10000),
  basisUnit: z.enum(['g', 'ml']),
  energyKcal: value,
  proteinG: value,
  carbohydrateG: value,
  fatG: value,
  fiberG: value,
  saltG: value,
  micros: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        value: z.number().finite().min(0).max(100000),
        unit: z.enum(['mg', 'µg', 'g']),
        evidence: z.string().min(1).max(300),
      }),
    )
    .max(20),
  evidence: z.string().min(1).max(2000),
});
/** Verified nutrition extraction from the image. */
export type Nutrition = z.infer<typeof nutritionSchema>;
/** Portion calculations are exact scaling operations, independent of LLM wording. */
export function portionValues(n: Nutrition, amount: number, unit: 'g' | 'ml') {
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000 || unit !== n.basisUnit)
    throw new Error('Porsiyon ve etiket birimi eşleşmeli.');
  const factor = amount / n.basisAmount;
  const scale = (v: number | null): number | null =>
    v === null ? null : Math.round(v * factor * 100) / 100;
  return {
    energyKcal: scale(n.energyKcal),
    proteinG: scale(n.proteinG),
    carbohydrateG: scale(n.carbohydrateG),
    fatG: scale(n.fatG),
    fiberG: scale(n.fiberG),
    saltG: scale(n.saltG),
    micros: n.micros.map((m) => ({ ...m, value: scale(m.value) })),
  };
}
