import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { diarySchema, symptoms, type DiaryEntry } from '../../shared/profile';
import { Choice, Field } from './Profile';
import { Button, Notice, ScreenHeader } from '../components/Controls';
import { ui } from '../theme';
import { outcomeOf } from '../../shared/observations';
import { formatMealTime, parseMealTime } from '../../shared/mealTime';
import { MealTimeFields } from '../components/MealTimeFields';
/** Editable observations include symptom-free meals and do not identify causal ingredients. */
export function DiaryScreen({
  entries,
  onSave,
  onDelete,
  onBack,
  meal = '',
  seed,
}: {
  entries: DiaryEntry[];
  onSave: (entry: DiaryEntry) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBack: () => void;
  meal?: string;
  seed?: Partial<DiaryEntry>;
}) {
  const fresh = (initial = false): DiaryEntry => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    at: new Date().toISOString(),
    meal,
    amount: '',
    symptoms: [],
    delay: '',
    notes: '',
    outcome: 'pending',
    ...(initial ? seed : {}),
  });
  const [draft, setDraft] = useState(() => fresh(true));
  const [time, setTime] = useState(formatMealTime(draft.at));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ingredients, setIngredients] = useState((draft.ingredients ?? []).join(', '));
  async function save(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      if (outcomeOf(draft) === 'symptoms' && !draft.symptoms.length)
        throw new Error('Select a symptom.');
      const entry = diarySchema.parse({
        ...draft,
        delay: outcomeOf(draft) === 'symptoms' ? draft.delay.trim() : '',
        ingredients: ingredients
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        at: parseMealTime(time),
      });
      await onSave(entry);
      const next = fresh();
      setDraft({ ...next, meal: '' });
      setTime(formatMealTime(next.at));
      setIngredients('');
    } catch {
      setError(
        'Öğün, geçerli tarih ve belirti yaşadıysan belirti seçimi gerekli. Bileşenleri virgülle ayır, en fazla 60 bileşen ekle. Kayıt yapılamadıysa yeniden dene.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={ui.page}>
      <ScreenHeader title="Öğün ve belirti günlüğü" onBack={onBack} />
      <ScrollView contentContainerStyle={ui.content} keyboardShouldPersistTaps="handled">
        <Text style={ui.title}>
          {seed?.scanId ? 'Bu ürünü tükettin mi?' : 'Ne yedin, nasıl hissettin?'}
        </Text>
        <Text style={ui.body}>
          {seed?.scanId
            ? 'Tükettiysen nasıl hissettiğini kaydet. Sonraki kişisel yorumlarda bu öğün de dikkate alınır.'
            : 'Belirti yaşamadığın öğünleri de ekleyebilirsin.'}
        </Text>
        {entries
          .filter((entry) => !seed?.scanId && outcomeOf(entry) === 'pending')
          .map((entry) => (
            <Button
              key={entry.id}
              label={`${entry.meal} kontrolünü tamamla`}
              secondary
              onPress={() => {
                setDraft(entry);
                setTime(formatMealTime(entry.at));
                setIngredients((entry.ingredients ?? []).join(', '));
              }}
            />
          ))}
        {draft.demo && (
          <Notice>Örnek üründen oluşturulan deneme kaydı. Gözlem istatistiklerine katılmaz.</Notice>
        )}
        <Field
          label="Ne yedin?"
          value={draft.meal}
          onChange={(meal) => setDraft({ ...draft, meal })}
        />
        <MealTimeFields value={time} onChange={setTime} />
        <Field
          label="Porsiyon / miktar"
          value={draft.amount}
          onChange={(amount) => setDraft({ ...draft, amount })}
          max={100}
        />
        <Field
          label="Teyit ettiğin bileşenler (virgülle ayır)"
          value={ingredients}
          onChange={setIngredients}
          max={3000}
        />
        <Text style={ui.small}>
          Etiketten gelen bileşenleri ve birlikte yediklerini kontrol et. Gözlemlerde yalnız bu
          liste kullanılır.
        </Text>
        <Choice
          label="Henüz değerlendirmedim"
          checked={outcomeOf(draft) === 'pending'}
          onPress={() => setDraft({ ...draft, outcome: 'pending', symptoms: [], severity: 0 })}
        />
        <Choice
          label="Belirti yok"
          checked={outcomeOf(draft) === 'symptom_free'}
          onPress={() => setDraft({ ...draft, outcome: 'symptom_free', symptoms: [], severity: 0 })}
        />
        {Object.entries(symptoms).map(([id, label]) => {
          const value = id as DiaryEntry['symptoms'][number];
          return (
            <Choice
              key={id}
              label={label}
              checked={draft.symptoms.includes(value)}
              onPress={() =>
                setDraft({
                  ...draft,
                  outcome: 'symptoms',
                  symptoms: draft.symptoms.includes(value)
                    ? draft.symptoms.filter((v) => v !== value)
                    : [...draft.symptoms, value],
                })
              }
            />
          );
        })}
        {outcomeOf(draft) === 'symptoms' && (
          <View style={{ gap: 4 }}>
            <Text style={ui.strong}>Belirti şiddeti</Text>
            {(['Hafif', 'Orta', 'Şiddetli'] as const).map((label, index) => (
              <Choice
                key={label}
                label={label}
                checked={draft.severity === index + 1}
                onPress={() => setDraft({ ...draft, severity: index + 1 })}
              />
            ))}
          </View>
        )}
        {outcomeOf(draft) === 'symptoms' && (
          <View style={{ gap: 8 }}>
            <Text style={ui.strong}>Belirti yemekten ne kadar sonra başladı?</Text>
            {[
              'Yemek sırasında',
              'İlk 30 dakika',
              '30–60 dakika',
              '1–2 saat',
              '2 saatten sonra',
            ].map((delay) => (
              <Choice
                key={delay}
                label={delay}
                radio
                checked={draft.delay === delay}
                onPress={() => setDraft({ ...draft, delay: draft.delay === delay ? '' : delay })}
              />
            ))}
            <Field
              label="Yaklaşık süreyi yaz (isteğe bağlı)"
              value={draft.delay}
              onChange={(delay) => setDraft({ ...draft, delay })}
              max={100}
            />
          </View>
        )}
        <Field
          label="Birlikte yediklerin ve diğer gözlemlerin"
          value={draft.notes}
          onChange={(notes) => setDraft({ ...draft, notes })}
        />
        <Field
          label="Uyku, stres ve hareket bağlamı (isteğe bağlı)"
          value={draft.context ?? ''}
          onChange={(context) => setDraft({ ...draft, context })}
          max={400}
        />
        <Text style={ui.strong}>Dışkı tipi (isteğe bağlı, Bristol 1 ile 7)</Text>
        <Text style={ui.small}>
          1: ayrı sert parçalar · 2: topaklı · 3: çatlak yüzey · 4: yumuşak, düzgün · 5: yumuşak
          parçalar · 6: lapa · 7: tamamen sulu. Bu alan tanı koymaz.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((stool) => (
            <Button
              key={stool}
              label={`Tip ${stool}${draft.stool === stool ? ' seçili' : ''}`}
              secondary
              onPress={() =>
                setDraft({ ...draft, stool: draft.stool === stool ? undefined : stool })
              }
            />
          ))}
        </View>
        {error ? <Notice>{error}</Notice> : null}
        <Button
          label="Günlüğe kaydet"
          disabled={busy}
          onPress={() => {
            void save();
          }}
        />
        <Text style={ui.h2}>Son kayıtlar / {entries.length}</Text>
        {!entries.length && <Text style={ui.body}>Henüz öğün kaydı yok.</Text>}
        {entries.map((entry) => (
          <View key={entry.id} style={{ gap: 12 }}>
            <Text style={ui.strong}>{entry.meal}</Text>
            <Text style={ui.small}>
              {new Date(entry.at).toLocaleString('tr-TR')} ·{' '}
              {entry.amount || 'Porsiyon belirtilmedi'} ·{' '}
              {outcomeOf(entry) === 'pending'
                ? 'Kontrol bekliyor'
                : entry.symptoms.map((s) => symptoms[s]).join(', ') || 'Belirti yok'}
            </Text>
            <Button
              label={`${entry.meal} kaydını düzenle`}
              secondary
              onPress={() => {
                setDraft(entry);
                setTime(formatMealTime(entry.at));
                setIngredients((entry.ingredients ?? []).join(', '));
              }}
            />
            <Button
              label={`${entry.meal} kaydını sil`}
              secondary
              disabled={busy}
              onPress={() => {
                setBusy(true);
                void onDelete(entry.id)
                  .catch(() => setError('Kayıt silinemedi.'))
                  .finally(() => setBusy(false));
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
