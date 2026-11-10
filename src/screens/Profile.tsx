import { useState } from 'react';
import { Platform, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import {
  goals,
  symptoms,
  questions,
  followUps,
  profileSchema,
  emptyProfile,
  type Profile as ProfileData,
} from '../../shared/profile';
import { Button, Notice, ScreenHeader } from '../components/Controls';
import { theme, ui } from '../theme';
import { requestPersonal } from '../lib/personalApi';

/** Reusable choice exposes checked state on native and web without relying on color. */
export function Choice({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      aria-checked={checked}
      onPress={onPress}
      style={[
        ui.between,
        { minHeight: 52, borderBottomWidth: 1, borderColor: theme.color.line, paddingVertical: 12 },
      ]}
    >
      <Text style={[ui.body, { flex: 1 }]}>{label}</Text>
      <Text style={ui.strong}>{checked ? 'Seçili' : 'Seç'}</Text>
    </Pressable>
  );
}
/** Labeled, bounded fields preserve Turkish input and always remain editable. */
export function Field({
  label,
  value,
  onChange,
  max = 600,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  max?: number;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={ui.strong}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        multiline
        value={value}
        onChangeText={onChange}
        maxLength={max}
        style={ui.input}
      />
    </View>
  );
}
/** Progressive onboarding collects goals before sensitive details and offers an explicit skip. */
export function ProfileScreen({
  initial,
  onSave,
  onBack,
  onErase,
  exportData,
  apiUrl,
  token,
}: {
  initial: ProfileData;
  onSave: (profile: ProfileData) => Promise<void>;
  onBack: () => void;
  onErase: () => Promise<void>;
  exportData: () => string;
  apiUrl: string;
  token: string;
}) {
  const [draft, setDraft] = useState(initial);
  const [avoidedText, setAvoidedText] = useState((initial.avoidedFoods ?? []).join(', '));
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [erase, setErase] = useState(false);
  const [ordered, setOrdered] = useState<(keyof typeof questions)[] | null>(null);
  const titles = [
    'Sana ne iyi gelir?',
    'Neleri takip edelim?',
    'Sağlık bağlamın.',
    'Bir gününü tanıyalım.',
    'Biraz daha yakından.',
    'Verinin kontrolü sende.',
  ];
  const change = <K extends keyof ProfileData>(key: K, value: ProfileData[K]): void =>
    setDraft((old) => ({ ...old, [key]: value }));
  async function finish(skip = false): Promise<void> {
    setBusy(true);
    setError('');
    try {
      await onSave(
        profileSchema.parse(
          skip
            ? { ...emptyProfile, completed: true }
            : {
                ...draft,
                avoidedFoods: avoidedText
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean),
                completed: true,
              },
        ),
      );
    } catch {
      setError('Profil kaydedilemedi. Yeniden dene.');
    } finally {
      setBusy(false);
    }
  }
  async function adapt(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      const reply = await requestPersonal(apiUrl, token, {
        consent: true,
        profile: draft,
        diary: [],
        analysis: null,
        task: 'questions',
      });
      setOrdered(reply.result.questionIds);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Sorular düzenlenemedi. Yerel sorularla devam edebilirsin.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={ui.page}>
      <ScreenHeader title="Kullanım profilin" onBack={step ? () => setStep(step - 1) : onBack} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>
        <Text style={ui.eyebrow}>TANIŞMA / {step + 1} / 6</Text>
        <Text accessibilityRole="header" style={ui.title}>
          {titles[step]}
        </Text>
        {step === 0 && (
          <>
            <Text style={ui.body}>
              Etiketi ne amaçla okuyorsun? Birden fazla amaç seçebilirsin. Bu profil dilediğin zaman
              değişir.
            </Text>
            {Object.entries(goals).map(([id, label]) => (
              <Choice
                key={id}
                label={label}
                checked={draft.goals.includes(id as ProfileData['goals'][number])}
                onPress={() => {
                  const value = id as ProfileData['goals'][number];
                  change(
                    'goals',
                    draft.goals.includes(value)
                      ? draft.goals.filter((v) => v !== value)
                      : [...draft.goals, value],
                  );
                }}
              />
            ))}
          </>
        )}
        {step === 1 && (
          <>
            <Text style={ui.body}>
              Takip etmek istediğin yakınmaları seç. Bunlar senin bildirimin olarak tutulur.
            </Text>
            {Object.entries(symptoms).map(([id, label]) => (
              <Choice
                key={id}
                label={label}
                checked={draft.symptoms.includes(id as ProfileData['symptoms'][number])}
                onPress={() => {
                  const value = id as ProfileData['symptoms'][number];
                  change(
                    'symptoms',
                    draft.symptoms.includes(value)
                      ? draft.symptoms.filter((v) => v !== value)
                      : [...draft.symptoms, value],
                  );
                }}
              />
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <Text style={ui.small}>
              Örnekler: IBS-D / IBS-C / IBS-M, reflü, laktoz hassasiyeti, çölyak, SIBO, Crohn veya
              ülseratif kolit. Yalnız kendi bildiğin durumu yaz.
            </Text>
            <Field
              label="Paylaşmak istediğin sağlık durumu veya hassasiyet"
              value={draft.conditions}
              onChange={(v) => change('conditions', v)}
            />
            {(
              [
                ['none', 'Tanı bilgisi paylaşmıyorum'],
                ['reported_diagnosis', 'Hekim tanısı aldığımı bildiriyorum'],
                ['suspected', 'Kendi şüphem / gözlemim'],
              ] as const
            ).map(([id, label]) => (
              <Choice
                key={id}
                label={label}
                checked={draft.diagnosisSource === id}
                onPress={() => change('diagnosisSource', id)}
              />
            ))}
            <Text style={ui.small}>
              Uygulama tanıyı doğrulamaz. Gerekmeyen kişisel bilgileri paylaşma.
            </Text>
            <Field
              label="Kendi tercihinle kaçındığın gıdalar (virgülle ayır)"
              value={avoidedText}
              onChange={setAvoidedText}
              max={1000}
            />
          </>
        )}
        {step === 3 && (
          <>
            <Field
              label="Genellikle kahvaltıda ne yersin?"
              value={draft.breakfast}
              onChange={(v) => change('breakfast', v)}
            />
            <Field
              label="Yemekten sonra yakınma olursa ne zaman başlıyor?"
              value={draft.timing}
              onChange={(v) => change('timing', v)}
              max={400}
            />
            <Field
              label="Öğün düzenin ve günlük hareketin"
              value={draft.routine}
              onChange={(v) => change('routine', v)}
            />
          </>
        )}
        {step === 4 && (
          <>
            {(ordered?.length ? ordered : followUps(draft)).map((id) => (
              <Field
                key={id}
                label={questions[id]}
                value={draft.answers[id] ?? ''}
                onChange={(v) => change('answers', { ...draft.answers, [id]: v })}
              />
            ))}
            <Text style={ui.small}>
              Sorular seçimlerine göre bu cihazda hazırlanır. İstersen aktarım iznini açıp Gemini
              ile sırasını özelleştirebilirsin.
            </Text>
            <Choice
              label="Profil özetimi kişisel yorum ve soru seçimi için sunucu üzerinden Google Gemini'e göndermeye izin veriyorum"
              checked={draft.geminiConsent}
              onPress={() => change('geminiConsent', !draft.geminiConsent)}
            />
            <Button
              label="Soruları modelle özelleştir"
              secondary
              disabled={!draft.geminiConsent || busy}
              onPress={() => {
                void adapt();
              }}
            />
          </>
        )}
        {step === 5 && (
          <>
            <Text style={ui.body}>
              Profilin ve öğün günlüğün cihazda AES-GCM ile şifrelenir. Google'a gönderilen etiket
              fotoğrafına profil eklenmez. Kişisel yorum isteğinde yalnız izin verdiğin profil ve
              son 20 günlük kaydı Google Gemini'e aktarılır.
            </Text>
            {Platform.OS === 'web' && (
              <Notice>
                Web demosunda sağlık verisi yalnız bu sekme oturumunda tutulur. Sekme kapanınca
                kalıcı profil bekleme.
              </Notice>
            )}
            <Choice
              label="Profil ve günlüğüm kişisel yorum için Google Gemini'e aktarılabilir"
              checked={draft.geminiConsent}
              onPress={() => change('geminiConsent', !draft.geminiConsent)}
            />
            <Button
              label="Sağlık verisini JSON olarak dışa aktar"
              secondary
              onPress={() => {
                void Share.share({ message: exportData() }).catch(() =>
                  setError('Dışa aktarma açılamadı.'),
                );
              }}
            />
            <Text style={ui.small}>
              Dışa aktarılan dosya açık sağlık bilgisi içerir. Güvenli bir yerde sakla.
            </Text>
            <Button
              label={erase ? 'Silme işlemini onayla' : 'Profil ve günlüğü sil'}
              secondary
              disabled={busy}
              onPress={() => {
                if (!erase) {
                  setErase(true);
                  return;
                }
                setBusy(true);
                void onErase()
                  .then(onBack)
                  .catch(() => setError('Veriler silinemedi.'))
                  .finally(() => setBusy(false));
              }}
            />
            {erase && <Button label="Silmekten vazgeç" secondary onPress={() => setErase(false)} />}
          </>
        )}
        {error ? <Notice>{error}</Notice> : null}
        <Button
          label={step === 5 ? 'Profili kaydet' : 'Devam et'}
          disabled={busy}
          onPress={() => {
            if (step < 5) setStep(step + 1);
            else void finish();
          }}
        />
        {!initial.completed && (
          <Button
            label="Şimdilik geç"
            secondary
            disabled={busy}
            onPress={() => {
              void finish(true);
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}
