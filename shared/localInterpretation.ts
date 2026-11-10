import type { Analysis } from './analysis';
import { goals, symptoms, type HealthVault } from './profile';
import { outcomeOf } from './observations';

/** Offline, deterministic profile interpretation; it makes no provider call or disease inference. */
export function localInterpretation(analysis: Analysis, vault: HealthVault, scenario = false) {
  const findings: { text: string; basis: string }[] = [];
  const profile = vault.profile;
  if (profile.symptoms.length)
    findings.push({
      text: `Takip ettiğin yakınmalar: ${profile.symptoms.map((id) => symptoms[id]).join(', ')}. Bu bildirimler, etiketteki herhangi bir içeriğin sende belirtiye neden olduğunu göstermez.`,
      basis: 'Profilindeki kendi bildirimin',
    });
  const recent = vault.diary
    .filter((entry) => Boolean(entry.demo) === scenario && outcomeOf(entry) !== 'pending')
    .slice(0, 20);
  const normalizeIngredient = (name: string): string =>
    name.trim().normalize('NFC').toLocaleLowerCase('tr-TR');
  const labelIngredients = new Map(
    analysis.ingredients.map((item) => [normalizeIngredient(item.name), item]),
  );
  let diaryMatches = 0;
  for (const [key, item] of labelIngredients) {
    const matching = recent.filter(
      (entry) =>
        Date.parse(entry.at) <= Date.now() &&
        entry.ingredients?.some((ingredient) => normalizeIngredient(ingredient) === key),
    );
    const observed = matching.filter((entry) => outcomeOf(entry) === 'symptoms');
    const latest = observed[0];
    if (!latest) continue;
    const date = new Date(latest.at).toLocaleDateString('tr-TR');
    const reported = latest.symptoms.map((id) => symptoms[id]).join(', ');
    findings.push({
      text: `Bu etikette ${item.name} var. ${date} tarihli “${latest.meal}” öğününde de bu bileşeni kaydettin. Öğün sonrasında bildirdiğin belirtiler: ${reported}. Bu bileşenin kayıtlı olduğu ${matching.length} tamamlanmış öğünün ${observed.length} tanesinde belirti, ${matching.length - observed.length} tanesinde belirti yok. Ürünü değerlendirirken bu gözlemi dikkate alabilirsin. Öğündeki diğer bileşenler de etkili olmuş olabilir.`,
      basis: `Etikette “${item.evidence}” ve kendi öğün günlüğün`,
    });
    diaryMatches++;
    if (diaryMatches === 3) break;
  }
  if (recent.length) {
    const symptomatic = recent.filter((d) => d.symptoms.length).length;
    findings.push({
      text: `Son ${recent.length} öğün kaydının ${symptomatic} tanesinde belirti, ${recent.length - symptomatic} tanesinde belirti yok olarak kayıt var. Bu sayılar bir ürün veya içeriği neden olarak belirlemez.`,
      basis: 'Cihazındaki son 20 günlük kaydı',
    });
  }
  if (profile.conditions.trim())
    findings.push({
      text: `${profile.diagnosisSource === 'reported_diagnosis' ? 'Hekim tanısı aldığını bildirdiğin durum' : profile.diagnosisSource === 'suspected' ? 'Kendi şüphen veya gözlemin' : 'Paylaştığın sağlık bağlamı'}: ${profile.conditions}. Yerel değerlendirme bu kayıttan gıda yasağı veya tedavi önerisi çıkarmaz.`,
      basis: 'Profilindeki kendi bildirimin; uygulama tanıyı doğrulamaz',
    });
  if (!findings.length)
    findings.push({
      text: 'Amaçlarını ve kendi gözlemlerini profiline ekleyerek etiketi kişisel bağlamında inceleyebilirsin.',
      basis: 'Cihazdaki profil',
    });
  const goalLabels = profile.goals
    .map((id) => (id in goals ? goals[id as keyof typeof goals] : undefined))
    .filter((v): v is (typeof goals)[keyof typeof goals] => v !== undefined);
  return {
    title: goalLabels.length ? goalLabels.join(' · ') : 'Kendi amaçlarına göre oku',
    findings,
  };
}
