import { validateAnalysis, type AllergenId, type Analysis } from './analysis';

const allergenTerms: Record<AllergenId, RegExp> = {
  gluten: /gl[üu]ten|bu[ğg]day|arpa|[çc]avdar|yulaf/iu,
  milk: /s[üu]t|laktoz/iu,
  egg: /yumurta/iu,
  peanut: /yer\s*f[ıi]st[ıi][ğg][ıi]/iu,
  nuts: /f[ıi]nd[ıi]k|badem|ceviz|kaju|antep\s*f[ıi]st[ıi][ğg][ıi]/iu,
  soy: /soya/iu,
  sesame: /susam/iu,
  fish: /bal[ıi]k/iu,
  crustaceans: /kabuklular|karides|yenge[çc]|[ıi]stakoz/iu,
  molluscs: /yumu[şs]ak[çc]a|midye|kalamar/iu,
  celery: /kereviz/iu,
  mustard: /hardal/iu,
  lupin: /acı\s*bakla|lupin/iu,
  sulphites: /s[üu]lfit|k[üu]k[üu]rt\s*dioksit/iu,
};

const additiveRoles = [
  { match: /asitlik d[üu]zenleyici\s*\(([^)]+)\)/giu, purpose: 'Asitliği düzenler.' },
  { match: /k[ıi]vam art[tıi]+r[ıi]c[ıi]\s*\(([^)]+)\)/giu, purpose: 'Kıvamı artırır.' },
  { match: /renklendirici\s*\(([^)]+)\)/giu, purpose: 'Renk verir.' },
  { match: /aroma art[tıi]+r[ıi]c[ıi]\s*\(([^)]+)\)/giu, purpose: 'Tadı belirginleştirir.' },
];

/** Interpret only explicit text. OCR can miss lines, so absence is never proof of safety. */
export function extractLabelText(ocrText: string, tableText = ''): Analysis {
  const rawText = [ocrText, tableText]
    .map((part) => part.trim())
    .filter(Boolean)
    .join('\n')
    .slice(0, 12000);
  const label = ocrText.slice(0, 10000).replace(/\s+/g, ' ').trim();
  const section = /(?:[iİı]çindekiler|[iİı]çerik|ingredients)\s*:/iu.exec(label);
  const contents = section
    ? label
        .slice(section.index + section[0].length)
        .split(/(?:alerjen|besin de[ğg]er|nutrition facts)\s*[:(]?/iu, 1)[0]
    : '';
  const ingredients = [
    ...new Set(
      contents
        .split(/,(?!\d)(?![^()]*\))|[.;]\s+(?=[A-ZÇĞİÖŞÜ])/u)
        .map((piece) => piece.trim())
        .filter((piece) => piece.length > 1 && piece.length <= 120),
    ),
  ]
    .slice(0, 60)
    .map((name) => ({ name, evidence: name, explanation: 'İçindekiler listesinde okunuyor.' }));

  if (!ingredients.length)
    return validateAnalysis({
      readability: 'unreadable',
      productName: null,
      rawText,
      summary: 'İçindekiler başlığı veya listesi okunamadı.',
      ingredients: [],
      allergens: [],
      additives: [],
      uncertainties: ['İçindekiler ve alerjen satırını kadraja alarak yeniden çek.'],
    });

  const allergens: Analysis['allergens'] = [];
  const declarations = label.matchAll(
    /(?:alerjen\s*:\s*[^.]+|(?:eser miktarda|may contain)[^.]+)(?:\.|$)/giu,
  );
  for (const [statement] of declarations) {
    const evidence = statement.trim().slice(0, 500);
    if (/i[çc]ermez|i[çc]ermiyor|does not contain|free from/iu.test(evidence)) continue;
    if (!/i[çc]erir|i[çc]erebilir|contains|may contain|eser miktarda/iu.test(evidence)) continue;
    const presence = /eser miktarda|i[çc]erebilir|may contain/iu.test(evidence)
      ? 'may_contain'
      : 'contains';
    for (const [id, pattern] of Object.entries(allergenTerms)) {
      if (
        pattern.test(evidence) &&
        !allergens.some((item) => item.id === id && item.presence === presence)
      )
        allergens.push({ id: id as AllergenId, presence, evidence });
    }
  }
  const additives: Analysis['additives'] = [];
  for (const { match, purpose } of additiveRoles) {
    for (const [evidence, names] of contents.matchAll(match)) {
      if (evidence.length > 500 || /[:()]/.test(names)) continue;
      for (const name of names
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)) {
        if (name.length <= 120) additives.push({ name, code: null, purpose, evidence });
      }
    }
  }
  for (const [printed] of contents.matchAll(/\bE\s*\d{3,4}[a-z]?(?:\([ivx]+\))?\b/gi)) {
    const code = printed.replace(/\s/g, '').replace(/^e/i, 'E');
    additives.push({ name: code, code, evidence: printed, purpose: 'Etikette basılı katkı kodu.' });
  }
  const uncertainties = [
    'Kamera okuması satır atlayabilir. Alerjen beyanını ambalajdan da kontrol et.',
  ];
  if (tableText)
    uncertainties.push(
      'Besin tablosu metni aktarıldı. Sütunlar doğrulanamadığı için miktar hesaplanmadı.',
    );
  return validateAnalysis({
    readability: 'partial',
    productName: null,
    rawText,
    summary: 'Etikette okunabilen içerik ve alerjen beyanları.',
    ingredients,
    allergens,
    additives: additives.slice(0, 30),
    uncertainties,
  });
}
