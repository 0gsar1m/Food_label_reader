import type { Analysis } from './analysis';
import { goals, symptoms, type HealthVault } from './profile';
import { outcomeOf } from './observations';

/** Offline, deterministic profile interpretation; it makes no provider call or disease inference. */
export function localInterpretation(analysis: Analysis, vault: HealthVault) {
  const findings: { text: string; basis: string }[] = [];
  const profile = vault.profile;
  if (profile.goals.includes('protein'))
    findings.push({
      text:
        analysis.nutrition?.proteinG != null
          ? `Etiketin ${analysis.nutrition.basisAmount} ${analysis.nutrition.basisUnit} temelinde ${analysis.nutrition.proteinG} g protein var. Tüketeceğin miktarı porsiyon alanında hesaplayabilirsin.`
          : 'Protein hedefin için ürünün miktarı henüz bilinmiyor; okunmuş bir besin tablosu gerekli.',
      basis: 'Seçtiğin amaç ve etiket tablosu',
    });
  if (profile.goals.includes('weight'))
    findings.push({
      text:
        analysis.nutrition?.energyKcal != null
          ? `Etiketin ${analysis.nutrition.basisAmount} ${analysis.nutrition.basisUnit} temelinde ${analysis.nutrition.energyKcal} kcal var. Değerlendirmede kendi porsiyonunu kullan; tek ürün günlük enerji dengesini göstermez.`
          : 'Kilo yönetimi amacın için kalori tahmini yapılmadı. Besin tablosunu ekleyebilirsin.',
      basis: 'Seçtiğin amaç ve etiket tablosu',
    });
  if (profile.symptoms.length)
    findings.push({
      text: `Takip ettiğin yakınmalar: ${profile.symptoms.map((id) => symptoms[id]).join(', ')}. Bu bildirimler, etiketteki herhangi bir içeriğin sende belirtiye neden olduğunu göstermez.`,
      basis: 'Profilindeki kendi bildirimin',
    });
  const recent = vault.diary
    .filter((entry) => !entry.demo && outcomeOf(entry) !== 'pending')
    .slice(0, 20);
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
  return {
    title: profile.goals.length
      ? profile.goals.map((id) => goals[id]).join(' · ')
      : 'Kendi amaçlarına göre oku',
    findings,
  };
}
