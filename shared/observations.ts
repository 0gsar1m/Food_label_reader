import { type DiaryEntry, symptoms, goals, type HealthVault } from './profile';
import { allergenNames, type AllergenId } from './analysis';

/** Older diary entries were explicitly saved as symptom-free when no symptoms were selected. */
export function outcomeOf(entry: DiaryEntry): 'pending' | 'symptom_free' | 'symptoms' {
  return entry.outcome ?? (entry.symptoms.length ? 'symptoms' : 'symptom_free');
}
/** Counts describe recorded co-occurrence only; missing check-ins never become negative outcomes. */
export function observations(entries: DiaryEntry[], days: number, now = Date.now()) {
  const recent = entries.filter((entry) => {
    const age = now - Date.parse(entry.at);
    return !entry.demo && age >= 0 && age < days * 86_400_000;
  });
  const completed = recent.filter((entry) => outcomeOf(entry) !== 'pending');
  const names = new Map<string, string>();
  const normalize = (text: string): string => text.trim().toLocaleLowerCase('tr-TR');
  for (const entry of completed)
    for (const name of entry.ingredients ?? []) names.set(normalize(name), name.trim());
  const ingredients = [...names]
    .map(([key, name]) => {
      const withFood = completed.filter((entry) =>
        entry.ingredients?.some((item) => normalize(item) === key),
      );
      // Only records with explicitly supplied ingredients can form a comparison group.
      const withoutFood = completed.filter(
        (entry) =>
          Boolean(entry.ingredients?.length) &&
          !entry.ingredients?.some((item) => normalize(item) === key),
      );
      return {
        name,
        total: withFood.length,
        symptoms: withFood.filter((entry) => outcomeOf(entry) === 'symptoms').length,
        comparison: withoutFood.length,
        comparisonSymptoms: withoutFood.filter((entry) => outcomeOf(entry) === 'symptoms').length,
      };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'tr'));
  return {
    total: recent.length,
    pending: recent.length - completed.length,
    completed: completed.length,
    symptomFree: completed.filter((entry) => outcomeOf(entry) === 'symptom_free').length,
    ingredients,
    symptoms: Object.entries(symptoms).map(([id, name]) => ({
      name,
      count: completed.filter(
        (entry) => outcomeOf(entry) === 'symptoms' && entry.symptoms.some((s) => s === id),
      ).length,
    })),
  };
}
/** The restaurant card discloses selected restrictions, not diagnoses or the full profile. */
export function restaurantCard(allergens: AllergenId[], avoided: string[]): string {
  const lines = ['Yemek hazırlığı hakkında bilgi rica ediyorum.'];
  if (allergens.length)
    lines.push(
      `Kontrol ettiğim alerjenler: ${allergens.map((id) => allergenNames[id]).join(', ')}.`,
    );
  if (avoided.length) lines.push(`Kendi tercihimle kaçındıklarım: ${avoided.join(', ')}.`);
  lines.push(
    'Bu malzemeler yemekte, sosta veya garnitürde var mı? Ortak ekipman ve çapraz temas ihtimali hakkında bilgi verebilir misiniz?',
  );
  return lines.join('\n\n');
}
/** A plain-language report keeps pending, simulated and completed observations distinct. */
export function healthReport(vault: HealthVault, days: number, now = Date.now()): string {
  const stats = observations(vault.diary, days, now);
  const entries = vault.diary.filter(
    (entry) =>
      !entry.demo && Date.parse(entry.at) <= now && Date.parse(entry.at) > now - days * 86_400_000,
  );
  return [
    `Nazif / Son ${days} gün gözlem raporu`,
    `Oluşturulma: ${new Date(now).toLocaleDateString('tr-TR')}`,
    'Kişinin kendi kayıtlarıdır. Tanı, tetikleyici kanıtı veya tüketim güvenliği değerlendirmesi içermez.',
    `Amaçlar: ${vault.profile.goals.map((id) => (id in goals ? goals[id as keyof typeof goals] : id)).join(', ') || 'Belirtilmedi'}`,
    `Sağlık bağlamı (${{ none: 'Tanı bilgisi yok', reported_diagnosis: 'Hekim tanısı aldığını bildiriyor', suspected: 'Kendi şüphesi veya gözlemi' }[vault.profile.diagnosisSource]}): ${vault.profile.conditions || 'Belirtilmedi'}`,
    `${stats.total} öğün / ${stats.completed} tamamlanan kontrol / ${stats.pending} bekleyen / ${stats.symptomFree} belirtisiz. Örnek kayıtlar dışlandı.`,
    ...entries.map(
      (entry) =>
        `${new Date(entry.at).toLocaleString('tr-TR')} | ${entry.meal} | ${entry.amount || 'Miktar yok'}\n${outcomeOf(entry) === 'pending' ? 'Henüz değerlendirilmedi' : outcomeOf(entry) === 'symptom_free' ? 'Belirti yok' : entry.symptoms.map((s) => symptoms[s]).join(', ')} | Şiddet: ${entry.severity ?? 'Belirtilmedi'} / 3 | Başlama: ${entry.delay || 'Belirtilmedi'}\nBileşenler (kullanıcı teyidi): ${(entry.ingredients ?? []).join(', ') || 'Belirtilmedi'}\nDışkı tipi: ${entry.stool ?? 'Belirtilmedi'} | Bağlam: ${entry.context || 'Belirtilmedi'}\nNot: ${entry.notes || 'Yok'}`,
    ),
  ].join('\n\n');
}
/** Escaping all user content prevents active markup in locally generated printable reports. */
export function reportHtml(text: string): string {
  const escaped = text.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
  );
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Nazif gözlem raporu</title><style>body{font-family:Arial,sans-serif;color:#202820;padding:28px;font-size:13px;line-height:1.65}pre{white-space:pre-wrap;font:inherit;overflow-wrap:anywhere}</style></head><body><h1>Nazif / Gözlem raporu</h1><pre>${escaped}</pre></body></html>`;
}
