import { z } from 'zod';

/** GS1 check digit rejects incomplete and mistyped EAN/UPC/GTIN codes before network access. */
export function validGtin(code: string): boolean {
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
  const digits = [...code].map(Number);
  const check = digits.pop();
  const sum = digits
    .reverse()
    .reduce((total, digit, index) => total + digit * (index % 2 ? 1 : 3), 0);
  return check === (10 - (sum % 10)) % 10;
}
export const barcodeProductSchema = z.object({
  code: z.string().refine(validGtin),
  name: z.string().min(1).max(600),
  brands: z.string().max(600),
  ingredientsText: z.string().max(12000),
  updatedAt: z.number().nonnegative().nullable(),
});
export type BarcodeProduct = z.infer<typeof barcodeProductSchema>;
