import { z } from 'zod';
import { analysisSchema } from './analysis';

/** Goal choices affect presentation, never create a diagnosis. */
export const goals = {
  awareness: 'İçeriği anlamak',
  weight: 'Kilo yönetimi',
  protein: 'Protein takibi',
  symptoms: 'Belirtilerimi anlamak',
} as const;
/** Symptom choices remain self-reported observations. */
export const symptoms = {
  bloating: 'Şişkinlik',
  constipation: 'Kabızlık',
  reflux: 'Mide yanması',
  indigestion: 'Hazımsızlık',
  eczema: 'Egzama / cilt yakınması',
} as const;
/** A bounded sensitive profile; diagnosis provenance is explicit. */
export const profileSchema = z.object({
  completed: z.boolean(),
  goals: z.array(z.enum(['awareness', 'weight', 'protein', 'symptoms'])).max(4),
  symptoms: z.array(z.enum(['bloating', 'constipation', 'reflux', 'indigestion', 'eczema'])).max(5),
  conditions: z.string().max(600),
  diagnosisSource: z.enum(['none', 'reported_diagnosis', 'suspected']),
  breakfast: z.string().max(600),
  timing: z.string().max(400),
  routine: z.string().max(600),
  cloudConsent: z.boolean(),
  answers: z.partialRecord(
    z.enum(['portion', 'protein', 'timing', 'context', 'skin', 'routine']),
    z.string().max(600),
  ),
});
/** The blank profile can be completed progressively without an account. */
export const emptyProfile: Profile = {
  completed: false,
  goals: [],
  symptoms: [],
  conditions: '',
  diagnosisSource: 'none',
  breakfast: '',
  timing: '',
  routine: '',
  cloudConsent: false,
  answers: {},
};
/** Validated local profile. */
export type Profile = z.infer<typeof profileSchema>;
/** Both symptomatic and symptom-free meals are recorded to avoid selective recall. */
export const diarySchema = z.object({
  id: z.string().max(100),
  at: z.string().datetime(),
  meal: z.string().min(1).max(600),
  amount: z.string().max(100),
  symptoms: z.array(z.enum(['bloating', 'constipation', 'reflux', 'indigestion', 'eczema'])).max(5),
  delay: z.string().max(100),
  notes: z.string().max(600),
});
/** Local meal observation, not a causal inference. */
export type DiaryEntry = z.infer<typeof diarySchema>;
/** Single encrypted document avoids partial cross-file updates. */
export const vaultSchema = z.object({
  version: z.literal(1),
  profile: profileSchema,
  diary: z.array(diarySchema).max(100),
});
/** The complete sensitive device data. */
export type HealthVault = z.infer<typeof vaultSchema>;
/** Questions are selected from a fixed bank and remain editable. */
export const questions = {
  portion: 'Genellikle ne kadar tüketirsin? Porsiyonunu nasıl belirlersin?',
  protein: 'Günlük öğünlerinde hangi protein kaynakları bulunur?',
  timing: 'Yakınma yemekten ne kadar sonra başlar ve ne sıklıkta olur?',
  context: 'Aynı öğünde başka neler yersin? Belirtisiz tükettiğin günler de oluyor mu?',
  skin: 'Cilt yakınması ile yemek arasında kendi gözlemlediğin bir ilişki var mı? Hekim değerlendirmesi oldu mu?',
  routine: 'Öğün düzenin ve günlük hareketin nasıl?',
} as const;
/** Local follow-ups work offline; the LLM may reorder only these allowed IDs. */
export function followUps(profile: Profile): (keyof typeof questions)[] {
  const list: (keyof typeof questions)[] = ['routine'];
  if (profile.goals.includes('weight')) list.push('portion');
  if (profile.goals.includes('protein')) list.push('protein');
  if (profile.symptoms.length) list.push('timing', 'context');
  if (profile.symptoms.includes('eczema')) list.push('skin');
  return list;
}
/** Consent is required independently of authentication for health data transfer. */
export const personalRequestSchema = z
  .object({
    consent: z.literal(true),
    profile: profileSchema,
    diary: z.array(diarySchema).max(20),
    analysis: analysisSchema.nullable(),
    task: z.enum(['questions', 'interpret']),
  })
  .strict();
/** Findings point to provided evidence IDs; unsupported IDs are rejected by the API. */
export const personalResponseSchema = z.object({
  summary: z.string().min(1).max(1000),
  findings: z
    .array(
      z.object({
        text: z.string().min(1).max(800),
        evidenceIds: z.array(z.string().max(80)).min(1).max(8),
      }),
    )
    .max(8),
  questionIds: z
    .array(z.enum(['portion', 'protein', 'timing', 'context', 'skin', 'routine']))
    .max(6),
});
