import { describe, it, expect } from 'vitest';
import { localInterpretation } from '../shared/localInterpretation';
import { emptyProfile, type HealthVault } from '../shared/profile';
import { demoAnalysis } from '../src/data/demo';
import { baseCosts, economyCosts, estimateCosts } from '../shared/costs';
describe('offline personal interpretation', () => {
  const vault: HealthVault = {
    version: 1,
    profile: {
      ...emptyProfile,
      completed: true,
      goals: ['protein', 'weight'],
      symptoms: ['bloating'],
    },
    diary: [],
  };
  it('provides goal-based label context without cloud consent or a provider', () => {
    const result = localInterpretation(demoAnalysis, vault);
    expect(result.findings.some((f) => f.text.includes('8 g protein'))).toBe(true);
    expect(result.findings.some((f) => f.text.includes('400 kcal'))).toBe(true);
    expect(result.findings.some((f) => f.text.includes('neden olduğunu göstermez'))).toBe(true);
  });
  it('does not invent nutrition when the label table is missing', () => {
    const result = localInterpretation({ ...demoAnalysis, nutrition: null }, vault);
    expect(result.findings.some((f) => f.text.includes('henüz bilinmiyor'))).toBe(true);
    expect(result.findings.some((f) => f.text.includes('400'))).toBe(false);
  });
  it('counts symptom-free diary entries as observations, not causal triggers', () => {
    const entry = {
      id: 'one',
      at: new Date().toISOString(),
      meal: 'Yulaflı öğün',
      amount: '40g',
      symptoms: [] as HealthVault['diary'][number]['symptoms'],
      delay: '',
      notes: '',
    };
    const result = localInterpretation(demoAnalysis, {
      ...vault,
      diary: [entry, { ...entry, id: 'two', symptoms: ['bloating'] }],
    });
    expect(result.findings.some((f) => f.text.includes('1 tanesinde belirti yok'))).toBe(true);
  });
  it('connects an exact label ingredient to completed, real meal observations', () => {
    const ingredient = demoAnalysis.ingredients[0];
    const entry: HealthVault['diary'][number] = {
      id: 'one',
      at: '2026-01-01T12:00:00Z',
      meal: 'Kahvaltı',
      amount: '',
      ingredients: [ingredient.name.toLocaleUpperCase('tr-TR')],
      symptoms: ['bloating'],
      delay: '',
      notes: '',
    };
    const result = localInterpretation(demoAnalysis, {
      ...vault,
      diary: [
        { ...entry, id: 'demo', meal: 'Kurgu öğün', demo: true },
        { ...entry, id: 'pending', meal: 'Bekleyen öğün', outcome: 'pending', symptoms: [] },
        {
          ...entry,
          id: 'different',
          meal: 'Farklı öğün',
          ingredients: [`${ingredient.name} aroması`],
        },
        entry,
        { ...entry, id: 'free', symptoms: [] },
      ],
    });
    const match = result.findings.find((finding) => finding.basis.includes(ingredient.evidence));
    expect(match?.text).toContain('“Kahvaltı”');
    expect(match?.text).toContain('Şişkinlik');
    expect(match?.text).toContain('2 tamamlanmış öğünün 1 tanesinde belirti');
  });
  it('separates reported diagnosis from suspicion', () => {
    const result = localInterpretation(demoAnalysis, {
      ...vault,
      profile: { ...vault.profile, conditions: 'Egzama', diagnosisSource: 'suspected' },
    });
    expect(result.findings.some((f) => f.text.startsWith('Kendi şüphen'))).toBe(true);
  });
  it('shows the economic reduction without calling the whole application free', () => {
    expect(
      estimateCosts({
        ...baseCosts,
        users: 1,
        scansPerUser: 3,
        personalFraction: 1,
        newProfiles: 0,
        retries: 0,
        hosting: 0,
        subscription: 0,
        personalModel: 'sonnet',
      }).api,
    ).toBeCloseTo(0.12525, 5);
    const current = estimateCosts(economyCosts);
    expect(current.personal).toBe(0);
    expect(current.api).toBeCloseTo(86.25);
    expect(current.total).toBeCloseTo(111.25);
    expect(current.total).toBeLessThan(estimateCosts(baseCosts).total / 8);
    expect(
      estimateCosts({ ...economyCosts, personalFraction: 0.5, newProfiles: 100 }).total,
    ).toBeCloseTo(129.834);
  });
});
