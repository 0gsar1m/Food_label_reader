import { expect, it } from 'vitest';
import { extractLabelText } from '../shared/labelText';

it('keeps explicit Turkish allergen evidence and rejects broken additive spans', () => {
  const label = extractLabelText(
    'İçindekiler: Buğday Unu, Palm Yağı, Kıvam Arttırıcı (Guar Gam), Renklendirici (Rib fl\n' +
      'Karışım İçeriği: Tuz, Aroma Arttırıcı (Glutamat)\nAlerjen: Glüten ve Kereviz içerir.',
  );
  expect(label.readability).toBe('partial');
  expect(label.allergens.map(({ id, evidence }) => [id, evidence])).toEqual([
    ['gluten', 'Alerjen: Glüten ve Kereviz içerir.'],
    ['celery', 'Alerjen: Glüten ve Kereviz içerir.'],
  ]);
  expect(label.additives.map(({ name }) => name)).toEqual(['Guar Gam', 'Glutamat']);
});

it('returns no ingredient claims for text without an ingredient section', () => {
  const label = extractLabelText('Paket servis bilgisi');
  expect(label.readability).toBe('unreadable');
  expect(label.ingredients).toEqual([]);
});
