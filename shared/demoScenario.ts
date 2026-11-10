import { emptyProfile, type DiaryEntry, type HealthVault } from './profile';

/** Fictional data for the example result. It is never saved into the user's vault. */
export function makeDemoVault(now = Date.now()): HealthVault {
  const meal = (
    daysAgo: number,
    description: Omit<DiaryEntry, 'id' | 'at' | 'demo'>,
  ): DiaryEntry => ({
    ...description,
    id: `scenario-${daysAgo}`,
    at: new Date(now - daysAgo * 86_400_000).toISOString(),
    demo: true,
  });
  return {
    version: 1,
    profile: {
      ...emptyProfile,
      completed: true,
      goals: ['symptoms', 'awareness'],
      symptoms: ['bloating'],
      routine: 'Hafta içi kahvaltı porsiyonu değişebiliyor.',
    },
    diary: [
      meal(1, {
        meal: 'Yulaf kasesi',
        amount: '60 g yulaf ezmesi',
        ingredients: ['Yulaf ezmesi'],
        symptoms: ['bloating'],
        outcome: 'symptoms',
        severity: 2,
        delay: '90 dakika',
        notes: 'Kahvaltıdan sonra şişkinlik kaydı girildi. Yanında ne tüketildiği henüz yazılmadı.',
      }),
      meal(3, {
        meal: 'Suyla pişen yulaf',
        amount: '30 g yulaf ezmesi',
        ingredients: ['Yulaf ezmesi', 'Su'],
        symptoms: [],
        outcome: 'symptom_free',
        delay: '',
        notes: 'Takip tamamlandı.',
      }),
      meal(5, {
        meal: 'Pirinç pilavı ve sebze',
        amount: 'Bir tabak',
        ingredients: ['Pirinç', 'Havuç'],
        symptoms: [],
        outcome: 'symptom_free',
        delay: '',
        notes: 'Takip tamamlandı.',
      }),
    ],
  };
}
