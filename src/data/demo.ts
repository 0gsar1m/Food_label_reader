import { validateAnalysis, type Analysis } from '../../shared/analysis';

/** Fictional teaching label, never substituted for a user's photo or saved as a real scan. */
export const demoAnalysis: Analysis = validateAnalysis({
  readability: 'clear',
  productName: 'Kakaolu yulaflı bisküvi',
  rawText:
    'ÖRNEK ETİKET\nKakaolu yulaflı bisküvi\nİçindekiler: Yulaf ezmesi (%32), buğday unu, şeker, ayçiçek yağı, kakao (%6), yağsız süt tozu, kabartıcı (sodyum hidrojen karbonat, E500), tuz.\nAlerjenler: Gluten ve süt içerir. Eser miktarda fındık ve soya içerebilir.',
  summary:
    'İlk sırada yulaf ezmesi var. Etikette süt ve gluten beyanı bulunuyor. Kabartıcı olarak E500 kullanılmış.',
  ingredients: [
    {
      name: 'Yulaf ezmesi',
      explanation: 'Bisküvinin tahıl temelini oluşturur. Etikette oranı %32 olarak belirtilmiş.',
      evidence: 'Yulaf ezmesi (%32)',
    },
    {
      name: 'Buğday unu',
      explanation: 'Hamurun yapısını oluşturur. Buğday, gluten içeren bir tahıldır.',
      evidence: 'buğday unu',
    },
    {
      name: 'Şeker',
      explanation: 'Tatlılık sağlar. Listeden ürünün toplam şeker miktarı hesaplanamaz.',
      evidence: 'şeker',
    },
    {
      name: 'Ayçiçek yağı',
      explanation: 'Hamurun dokusuna katkı sağlayan bitkisel yağdır.',
      evidence: 'ayçiçek yağı',
    },
    {
      name: 'Kakao',
      explanation: 'Kakao tadı ve rengi verir. Etikette oranı %6 olarak belirtilmiş.',
      evidence: 'kakao (%6)',
    },
    {
      name: 'Yağsız süt tozu',
      explanation: 'Sütün suyu uzaklaştırılmış bir bileşenidir. Süt alerjeni içerir.',
      evidence: 'yağsız süt tozu',
    },
    {
      name: 'Sodyum hidrojen karbonat',
      explanation: 'Pişirme sırasında kabarmaya yardımcı olur.',
      evidence: 'sodyum hidrojen karbonat, E500',
    },
    { name: 'Tuz', explanation: 'Tadı düzenlemek için kullanılır.', evidence: 'tuz' },
  ],
  allergens: [
    { id: 'gluten', presence: 'contains', evidence: 'Gluten ve süt içerir' },
    { id: 'milk', presence: 'contains', evidence: 'Gluten ve süt içerir' },
    { id: 'nuts', presence: 'may_contain', evidence: 'Eser miktarda fındık ve soya içerebilir' },
    { id: 'soy', presence: 'may_contain', evidence: 'Eser miktarda fındık ve soya içerebilir' },
  ],
  additives: [
    {
      name: 'Sodyum hidrojen karbonat',
      code: 'E500',
      purpose:
        'Kabartıcı. Pişerken gaz açığa çıkararak hamurun kabarmasına yardımcı olur. E kodu, katkının tanımlayıcısıdır.',
      evidence: 'kabartıcı (sodyum hidrojen karbonat, E500)',
    },
  ],
  uncertainties: [],
});
