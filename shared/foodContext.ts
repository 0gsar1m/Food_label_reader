import { z } from 'zod';
import { scanRequestSchema } from './analysis';

/** Meal and menu descriptions never masquerade as transcribed packaged-food ingredients. */
export const foodRequestSchema = scanRequestSchema
  .omit({ nutritionImage: true })
  .extend({ mode: z.enum(['menu', 'meal']) })
  .strict();
export const foodContextSchema = z.object({
  title: z.string().min(1).max(160),
  visibleText: z.string().max(6000),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        basis: z.enum(['printed', 'visual']),
        evidence: z.string().min(1).max(400),
      }),
    )
    .max(20),
  questions: z.array(z.string().min(1).max(300)).max(6),
  uncertainties: z.array(z.string().min(1).max(400)).min(1).max(8),
});
export type FoodContext = z.infer<typeof foodContextSchema>;
/** Printed claims must have a matching transcription; visual descriptions remain explicitly tentative. */
export function validateFoodContext(input: unknown, mode: 'menu' | 'meal'): FoodContext {
  const value = foodContextSchema.parse(input);
  for (const item of value.items) {
    if (item.basis === 'printed' && !value.visibleText.includes(item.evidence))
      throw new Error('Missing text evidence.');
    if (mode === 'menu' && item.basis !== 'printed')
      throw new Error('Menus require printed evidence.');
  }
  return value;
}
