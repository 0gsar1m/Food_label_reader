import { validateAnalysis, type Analysis, type ScanRecord } from '../../shared/analysis';
import {
  demoCrackerScanId,
  demoGranolaScanId,
  demoWeekScanId,
  makeDemoWeek,
} from '../../shared/demoWeek';
import { demoAnalysis } from './demo';

const granola = validateAnalysis({
  ...demoAnalysis,
  productName: 'Kuru üzümlü granola',
  rawText:
    'ÖRNEK ETİKET\nİçindekiler: Yulaf ezmesi, kuru üzüm, ayçiçek yağı.\nEser miktarda fındık içerebilir.',
  summary: 'Bu örnek granolada yulaf ezmesi ve kuru üzüm var.',
  ingredients: [
    { name: 'Yulaf ezmesi', evidence: 'Yulaf ezmesi', explanation: 'Granolanın tahıl bileşeni.' },
    { name: 'Kuru üzüm', evidence: 'kuru üzüm', explanation: 'Kuruyemiş karışımına tat katar.' },
    {
      name: 'Ayçiçek yağı',
      evidence: 'ayçiçek yağı',
      explanation: 'Karışımın dokusuna katkı sağlar.',
    },
  ],
  allergens: [
    { id: 'nuts', presence: 'may_contain', evidence: 'Eser miktarda fındık içerebilir.' },
  ],
  additives: [],
  nutrition: null,
});
const cracker = validateAnalysis({
  ...demoAnalysis,
  productName: 'Sade kraker',
  rawText: 'ÖRNEK ETİKET\nİçindekiler: Buğday unu, ayçiçek yağı, tuz.\nGluten içerir.',
  summary: 'Örnek kraker buğday unu içeriyor. Etikette gluten beyanı var.',
  ingredients: [
    {
      name: 'Buğday unu',
      evidence: 'Buğday unu',
      explanation: 'Kraker hamurunun temelini oluşturur.',
    },
    {
      name: 'Ayçiçek yağı',
      evidence: 'ayçiçek yağı',
      explanation: 'Hamurun dokusuna katkı sağlar.',
    },
    { name: 'Tuz', evidence: 'tuz', explanation: 'Krakerin tadını verir.' },
  ],
  allergens: [{ id: 'gluten', presence: 'contains', evidence: 'Gluten içerir.' }],
  additives: [],
  nutrition: null,
});
const labels = new Map<string, Analysis>([
  [demoWeekScanId, demoAnalysis],
  [demoGranolaScanId, granola],
  [demoCrackerScanId, cracker],
]);

export function makeDemoReadings(): ScanRecord[] {
  return makeDemoWeek().diary.flatMap(({ scanId, at }) => {
    const analysis = scanId && labels.get(scanId);
    return scanId && analysis ? [{ id: scanId, createdAt: at, demo: true, analysis }] : [];
  });
}
