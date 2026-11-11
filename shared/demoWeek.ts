import { emptyProfile, type DiaryEntry, type HealthVault } from './profile';

export const demoWeekOwner = 'demo-week';
export const demoWeekScanId = 'demo-week-biscuit';
export const demoGranolaScanId = 'demo-week-granola';
export const demoCrackerScanId = 'demo-week-cracker';

type Meal = {
  name: string;
  ingredients: string[];
  notes: string;
  symptom?: 'bloating' | 'reflux' | 'indigestion';
  delay?: string;
  hour?: number;
  scanId?: string;
};

const week: Meal[][] = [
  [
    {
      name: 'Sütlü yulaf ve muz',
      ingredients: ['Yulaf ezmesi', 'Süt', 'Muz'],
      notes: 'Bir kâse yedim, kahvemi de sütlü içtim.',
      symptom: 'bloating',
      delay: '90 dakika',
    },
    {
      name: 'Mercimek çorbası ve ekmek',
      ingredients: ['Mercimek', 'Soğan', 'Buğday ekmeği'],
      notes: 'Öğle molasında acele ettim.',
      symptom: 'bloating',
      delay: '1–2 saat',
    },
    {
      name: 'Fırın tavuk ve patates',
      ingredients: ['Tavuk', 'Patates', 'Zeytinyağı'],
      notes: 'Evde yavaş yedim, akşam rahattım.',
    },
  ],
  [
    {
      name: 'Peynirli tost',
      ingredients: ['Buğday ekmeği', 'Kaşar'],
      notes: 'Yanında açık çay içtim.',
    },
    {
      name: 'Tavuklu pirinç pilavı',
      ingredients: ['Tavuk', 'Pirinç', 'Havuç'],
      notes: 'Öğleden sonra yürüyüş yaptım.',
    },
    {
      name: 'Domatesli makarna',
      ingredients: ['Makarna', 'Domates', 'Sarımsak'],
      notes: 'Akşam geç yedim, sonra uzandım.',
      symptom: 'reflux',
      delay: 'İlk 30 dakika',
      hour: 21,
    },
  ],
  [
    {
      name: 'Suyla pişmiş yulaf',
      ingredients: ['Yulaf ezmesi', 'Su', 'Muz'],
      notes: 'Küçük kâse, yanında sade çay. Öğleye kadar rahattım.',
    },
    {
      name: 'Etli nohut ve pilav',
      ingredients: ['Nohut', 'Soğan', 'Pirinç', 'Dana eti'],
      notes: 'Biraz fazla yedim.',
      symptom: 'bloating',
      delay: '2 saatten sonra',
    },
    {
      name: 'Fırın balık ve kabak',
      ingredients: ['Balık', 'Kabak', 'Zeytinyağı'],
      notes: 'Akşamı hafif geçirdim.',
    },
  ],
  [
    {
      name: 'Haşlanmış yumurta ve tost',
      ingredients: ['Yumurta', 'Buğday ekmeği'],
      notes: 'Toplantıdan önce kahvaltı yaptım.',
    },
    {
      name: 'Zeytinyağlı taze fasulye',
      ingredients: ['Taze fasulye', 'Domates', 'Pirinç'],
      notes: 'Yanında bir kaşık pilav vardı.',
    },
    {
      name: 'Kakaolu yulaflı bisküvi',
      ingredients: ['Yulaf ezmesi', 'Buğday unu', 'Kakao'],
      notes: 'İki bisküviyi sade çayla yedim. Akşama kadar belirti olmadı.',
      hour: 16,
      scanId: demoWeekScanId,
    },
    {
      name: 'Peynirli omlet',
      ingredients: ['Yumurta', 'Peynir', 'Tereyağı'],
      notes: 'Yanında birkaç zeytin yedim.',
      hour: 19,
    },
  ],
  [
    {
      name: 'Yoğurtlu granola',
      scanId: demoGranolaScanId,
      ingredients: ['Yoğurt', 'Yulaf ezmesi', 'Kuru üzüm'],
      notes: 'Bu kez yarım kâse yedim.',
      symptom: 'bloating',
      delay: '30–60 dakika',
    },
    {
      name: 'Izgara köfte ve salata',
      ingredients: ['Dana eti', 'Soğan', 'Marul', 'Salatalık'],
      notes: 'Ek sos istemedim.',
    },
    {
      name: 'Sebzeli bulgur pilavı',
      ingredients: ['Bulgur', 'Kabak', 'Havuç'],
      notes: 'Öğünden sonra kısa yürüyüş yaptım.',
    },
  ],
  [
    {
      name: 'Yumurta ve domates',
      ingredients: ['Yumurta', 'Domates', 'Zeytin'],
      notes: 'Kahvaltıyı evde yaptım.',
    },
    {
      name: 'Baharatlı tavuk dürüm',
      ingredients: ['Tavuk', 'Buğday lavaşı', 'Acı biber', 'Soğan'],
      notes: 'Acı soslu söyledim, yanında kola içtim.',
      symptom: 'reflux',
      delay: '30–60 dakika',
    },
    { name: 'Elma ve ceviz', ingredients: ['Elma', 'Ceviz'], notes: 'İkindi ara öğünü.', hour: 16 },
    {
      name: 'Yoğurtlu kabak',
      ingredients: ['Kabak', 'Yoğurt', 'Dereotu'],
      notes: 'Küçük bir tabak, akşam rahattım.',
      hour: 19,
    },
  ],
  [
    {
      name: 'Muzlu yulaf ve su',
      ingredients: ['Yulaf ezmesi', 'Muz', 'Su'],
      notes: 'Üç kaşık yulafı suyla pişirdim. Öğlene kadar belirti olmadı.',
    },
    {
      name: 'Patatesli tavuk çorbası',
      ingredients: ['Tavuk', 'Patates', 'Havuç'],
      notes: 'Evden getirdim.',
    },
    {
      name: 'Sütlü kahve ve kraker',
      scanId: demoCrackerScanId,
      ingredients: ['Kahve', 'Süt', 'Buğday unu'],
      notes: 'Öğleden sonra bir kupa içtim.',
      symptom: 'bloating',
      delay: '1–2 saat',
      hour: 15,
    },
    {
      name: 'Pirinç pilavı ve ızgara sebze',
      ingredients: ['Pirinç', 'Patlıcan', 'Kabak'],
      notes: 'Akşam erken yedim.',
      hour: 19,
    },
  ],
];

/** Fictional week loaded only in the dedicated demo storage scope. */
export function makeDemoWeek(now = new Date()): HealthVault {
  const diary = week.flatMap((meals, day) =>
    meals.map((meal, index): DiaryEntry => {
      const at = new Date(now);
      at.setDate(at.getDate() - (week.length - day));
      at.setHours(meal.hour ?? [8, 13, 19][index], index % 2 ? 15 : 30, 0, 0);
      return {
        id: `demo-week-${day}-${index}`,
        at: at.toISOString(),
        meal: meal.name,
        amount: '',
        ingredients: meal.ingredients,
        notes: meal.notes,
        symptoms: meal.symptom ? [meal.symptom] : [],
        delay: meal.delay ?? '',
        outcome: meal.symptom ? 'symptoms' : 'symptom_free',
        severity: meal.symptom ? 2 : 0,
        scanId: meal.scanId,
      };
    }),
  );
  return {
    version: 1,
    profile: {
      ...emptyProfile,
      completed: true,
      goals: ['awareness', 'symptoms'],
      symptoms: ['bloating', 'reflux'],
      diagnosisSource: 'suspected',
      conditions:
        'Sütlü kahvaltılardan sonra bazen şişkinlik oluyor. Tanı almadım. Akşam geç yediğimde ara sıra midem yanıyor.',
      breakfast:
        'İşe giderken tost, evdeysem muzlu yulaf yiyorum. Bazen suyla, bazen sütle hazırlıyorum.',
      timing:
        'Şişkinlik çoğunlukla bir saat civarı, mide yanması bazen yarım saat içinde başlıyor.',
      routine:
        'Kahvaltı 08.30, öğle 13.00, akşam 19.00 gibi. Toplantı uzarsa akşam yemeği gecikiyor.',
      avoidedFoods: ['Acı sos'],
      openaiConsent: true,
      answers: {
        timing: 'Şişkinlik daha çok kahvaltı sonrası oluyor. Her yulaf yediğim gün olmuyor.',
        context:
          'Sütlü yulafla bazen sütlü kahve de içiyorum. Suyla hazırladığım günlerde yanında sade çay oluyor.',
        routine: 'Hafta içi ofiste hızlı yiyorum, hafta sonu acelem olmuyor.',
      },
    },
    diary: diary.reverse(),
  };
}
