import { z } from 'zod';
import { barcodeProductSchema, validGtin, type BarcodeProduct } from '../shared/barcode';

const upstreamSchema = z.object({
  product: z
    .object({
      product_name_tr: z.string().max(600).optional(),
      product_name: z.string().max(600).optional(),
      brands: z.string().max(600).optional(),
      ingredients_text_tr: z.string().max(12000).optional(),
      ingredients_text: z.string().max(12000).optional(),
      last_modified_t: z.number().nonnegative().optional(),
    })
    .optional(),
});
/** Public catalogue data only: no profile, symptoms, account identity or photo leaves this endpoint. */
export async function lookupBarcode(
  code: string,
  fetcher: typeof fetch = fetch,
): Promise<BarcodeProduct | null> {
  if (!validGtin(code)) throw new Error('Invalid GTIN.');
  const fields =
    'product_name_tr,product_name,brands,ingredients_text_tr,ingredients_text,last_modified_t';
  const response = await fetcher(
    `https://world.openfoodfacts.org/api/v3.6/product/${code}.json?fields=${fields}`,
    {
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
      headers: {
        'User-Agent': 'Etiket/1.0 (https://github.com/0gsar1m/Food_label_reader)',
        Accept: 'application/json',
      },
    },
  );
  if (response.status === 404) return null;
  if (!response.ok || !response.body) throw new Error('Catalogue unavailable.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 128000) {
        await reader.cancel();
        throw new Error('Catalogue response too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const parsed = upstreamSchema.parse(
    JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown,
  );
  if (!parsed.product) return null;
  const item = parsed.product;
  return barcodeProductSchema.parse({
    code,
    name: item.product_name_tr || item.product_name || 'Adı belirtilmemiş ürün',
    brands: item.brands ?? '',
    ingredientsText: item.ingredients_text_tr || item.ingredients_text || '',
    updatedAt: item.last_modified_t ?? null,
  });
}
