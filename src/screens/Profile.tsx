import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  goals,
  symptoms,
  promptForAnswer,
  followUps,
  profileSchema,
  type Profile as ProfileData,
  type ProfileDraft,
} from '../../shared/profile';
import { Button, Notice, ScreenHeader } from '../components/Controls';
import { theme, ui } from '../theme';
import { PersonalConnectionError, requestPersonal } from '../lib/personalApi';

/** Reusable choice exposes checked state on native and web without relying on color. */
export function Choice({
  label,
  checked,
  onPress,
  radio = false,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  radio?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={radio ? 'radio' : 'checkbox'}
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      aria-checked={checked}
      onPress={onPress}
      style={[
        ui.between,
        { minHeight: 52, borderBottomWidth: 1, borderColor: theme.color.line, paddingVertical: 12 },
      ]}
    >
      <Text style={[ui.body, { flex: 1, paddingRight: 12 }]}>{label}</Text>
      <Text
        style={[
          ui.strong,
          { fontSize: 18, color: checked ? theme.color.green : theme.color.muted },
        ]}
      >
        {radio ? (checked ? '●' : '○') : checked ? '✓' : '□'}
      </Text>
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
  initialDraft,
  onCheckpoint,
  onSave,
  onBack,
  onErase,
  exportData,
  apiUrl,
  token,
}: {
  initial: ProfileData;
  initialDraft?: ProfileDraft;
  onCheckpoint: (draft: ProfileDraft) => Promise<void>;
  onSave: (profile: ProfileData) => Promise<void>;
  onBack: () => void;
  onErase: () => Promise<void>;
  exportData: () => string;
  apiUrl: string;
  token: string;
}) {
  const [draft, setDraft] = useState(initialDraft?.profile ?? initial);
  const [avoidedText, setAvoidedText] = useState(
    initialDraft?.avoidedText ?? (initial.avoidedFoods ?? []).join(', '),
  );
  const [step, setStep] = useState(initialDraft ? 4 : 0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [erase, setErase] = useState(false);
  const [questionStatus, setQuestionStatus] = useState<
    'idle' | 'loading' | 'ready' | 'empty' | 'failed' | 'network' | 'unauthorized'
  >('idle');
  const questionLoading = questionStatus === 'loading';
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
  async function finish(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      await onSave(
        profileSchema.parse({
          ...draft,
          goals: draft.goals.filter((goal) => goal === 'awareness' || goal === 'symptoms'),
          avoidedFoods: avoidedText
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
          completed: true,
        }),
      );
    } catch {
      setError('Profil kaydedilemedi. Yeniden dene.');
    } finally {
      setBusy(false);
    }
  }
  async function adapt(): Promise<void> {
    setBusy(true);
    setQuestionStatus('loading');
    try {
      await onCheckpoint({ profile: draft, avoidedText });
      const reply = await requestPersonal(apiUrl, token, {
        consent: true,
        profile: draft,
        diary: [],
        analysis: null,
        task: 'questions',
      });
      const suggestions = (reply.result.questionSuggestions ?? []).filter(
        ({ id, text }) => !draft.answers[id]?.trim() && text !== promptForAnswer(draft, id),
      );
      setDraft((old) => {
        const answerPrompts = { ...old.answerPrompts };
        for (const { id, text } of suggestions) {
          if (!old.answers[id]?.trim()) answerPrompts[id] = text;
        }
        return { ...old, answerPrompts };
      });
      setQuestionStatus(suggestions.length ? 'ready' : 'empty');
    } catch (error) {
      setQuestionStatus(error instanceof PersonalConnectionError ? error.code : 'failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={ui.page}>
      <ScreenHeader title="Kullanım profilin" onBack={step ? () => setStep(step - 1) : onBack} />
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerStyle={ui.content}
      >
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
        {step >= 2 && step <= 4 && (
          <Text style={ui.body}>
            Bir arkadaşına mesaj atar gibi, kendi kelimelerinle yazabilirsin. Bir iki cümle yeter.
            İstersen bazı soruları boş bırakabilirsin.
          </Text>
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
                radio
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
            <Text style={ui.small}>Mesela “Sabah genelde peynirli tost yiyorum.”</Text>
            <Field
              label="Genellikle kahvaltıda ne yersin?"
              value={draft.breakfast}
              onChange={(v) => change('breakfast', v)}
            />
            <Field
              label="Belirti olursa yemekten yaklaşık kaç dakika veya saat sonra başlıyor?"
              value={draft.timing}
              onChange={(v) => change('timing', v)}
              max={400}
            />
            <Field
              label="Ana öğünlerini genellikle hangi saatlerde yersin?"
              value={draft.routine}
              onChange={(v) => change('routine', v)}
            />
          </>
        )}
        {step === 4 && (
          <>
            {followUps(draft).map((id) => {
              const prompt = promptForAnswer(draft, id);
              return (
                <Field
                  key={id}
                  label={prompt}
                  value={draft.answers[id] ?? ''}
                  onChange={(v) =>
                    setDraft((old) => ({
                      ...old,
                      answers: { ...old.answers, [id]: v },
                      answerPrompts: { ...old.answerPrompts, [id]: prompt },
                    }))
                  }
                />
              );
            })}
            <Text style={ui.small}>
              Bu sorular seçimlerine göre hazırlanır. İzin verip düğmeye basarsan OpenAI, henüz
              yanıtlamadığın konular için profiline göre yeni sorular önerebilir.
            </Text>
            <Choice
              label="Profil özetimi kişisel yorum ve soru seçimi için sunucu üzerinden OpenAI’ye göndermeye izin veriyorum"
              checked={draft.openaiConsent ?? false}
              onPress={() => change('openaiConsent', !draft.openaiConsent)}
            />
            <Button
              label={questionLoading ? 'Sorular hazırlanıyor…' : 'Profilime göre soru öner'}
              secondary
              disabled={!draft.openaiConsent || busy}
              onPress={() => {
                void adapt();
              }}
            />
            {questionLoading && (
              <ActivityIndicator
                accessibilityLabel="OpenAI yanıtı bekleniyor"
                color={theme.color.green}
              />
            )}
            {questionStatus === 'network' && (
              <Notice>
                Sunucuya ulaşılamadı. İnternet bağlantını ve Tercihler’deki sunucu adresini kontrol
                et.
              </Notice>
            )}
            {questionStatus === 'unauthorized' && (
              <Notice>
                Sunucu erişim anahtarı eksik veya hatalı. Tercihler’den bağlantı ayarını kontrol et.
              </Notice>
            )}
            {questionStatus === 'failed' && (
              <Notice>
                Sorular şu anda özelleştirilemedi. Daha sonra tekrar deneyin. Mevcut sorularla devam
                edebilirsin.
              </Notice>
            )}
            {(questionStatus === 'ready' || questionStatus === 'empty') && (
              <Text
                role={Platform.OS === 'web' ? 'status' : undefined}
                accessibilityLiveRegion="polite"
                style={ui.small}
              >
                {questionStatus === 'ready'
                  ? 'Soru önerileri hazır. Yukarıdaki soruları yanıtlayabilirsin.'
                  : 'Yeni soru önerisi bulunamadı. Mevcut sorularla devam edebilirsin.'}
              </Text>
            )}
          </>
        )}
        {step === 5 && (
          <>
            <Text style={ui.body}>
              Profilin ve öğün günlüğün cihazında şifreli saklanır. İzin verirsen her yeni etiket
              okumasında profilin ve son öğünlerin kişisel yoruma dahil edilir. İzni dilediğin
              zaman profilinden değiştirebilirsin.
            </Text>
            {Platform.OS === 'web' && (
              <Notice>
                Web demosunda sağlık verisi yalnız bu sekme oturumunda tutulur. Sekme kapanınca
                kalıcı profil bekleme.
              </Notice>
            )}
            <Choice
              label="Etiket okuduğumda kişisel yorum için etiket metnimin, profil özetimin ve son 20 öğün kaydımın OpenAI’ye gönderilmesine izin veriyorum"
              checked={draft.openaiConsent ?? false}
              onPress={() => change('openaiConsent', !draft.openaiConsent)}
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
            if (!draft.goals.some((goal) => goal === 'awareness' || goal === 'symptoms')) {
              setStep(0);
              setError('Devam etmek için en az bir amaç seç.');
              return;
            }
            setError('');
            if (step < 5) setStep(step + 1);
            else void finish();
          }}
        />
      </ScrollView>
    </View>
  );
}
