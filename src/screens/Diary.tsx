import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { diarySchema, symptoms, type DiaryEntry } from '../../shared/profile';
import { Choice, Field } from './Profile';
import { Button, Notice, ScreenHeader } from '../components/Controls';
import { ui } from '../theme';
/** Editable observations include symptom-free meals and do not identify causal ingredients. */
export function DiaryScreen({
  entries,
  onSave,
  onDelete,
  onBack,
  meal = '',
}: {
  entries: DiaryEntry[];
  onSave: (entry: DiaryEntry) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBack: () => void;
  meal?: string;
}) {
  const fresh = (): DiaryEntry => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    at: new Date().toISOString(),
    meal,
    amount: '',
    symptoms: [],
    delay: '',
    notes: '',
  });
  const [draft, setDraft] = useState(fresh);
  const [time, setTime] = useState(draft.at);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      const entry = diarySchema.parse({ ...draft, at: new Date(time).toISOString() });
      await onSave(entry);
      const next = fresh();
      setDraft({ ...next, meal: '' });
      setTime(next.at);
    } catch {
      setError('Öğün ve geçerli tarih gir. Kayıt yapılamadıysa yeniden dene.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={ui.page}>
      <ScreenHeader title="Öğün ve belirti günlüğü" onBack={onBack} />
      <ScrollView contentContainerStyle={ui.content} keyboardShouldPersistTaps="handled">
        <Text style={ui.title}>Kendi deneyimini kaydet.</Text>
        <Text style={ui.body}>
          Belirti yaşamadığın öğünleri de ekle. Kayıtlar bir gıdanın neden olduğunu kanıtlamaz.
        </Text>
        <Field
          label="Ne yedin?"
          value={draft.meal}
          onChange={(meal) => setDraft({ ...draft, meal })}
        />
        <Field label="Tarih ve saat (ISO)" value={time} onChange={setTime} max={40} />
        <Field
          label="Porsiyon / miktar"
          value={draft.amount}
          onChange={(amount) => setDraft({ ...draft, amount })}
          max={100}
        />
        <Choice
          label="Belirti yok"
          checked={!draft.symptoms.length}
          onPress={() => setDraft({ ...draft, symptoms: [] })}
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
                  symptoms: draft.symptoms.includes(value)
                    ? draft.symptoms.filter((v) => v !== value)
                    : [...draft.symptoms, value],
                })
              }
            />
          );
        })}
        <Field
          label="Ne kadar sonra başladı?"
          value={draft.delay}
          onChange={(delay) => setDraft({ ...draft, delay })}
          max={100}
        />
        <Field
          label="Birlikte yediklerin ve diğer gözlemlerin"
          value={draft.notes}
          onChange={(notes) => setDraft({ ...draft, notes })}
        />
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
              {entry.symptoms.map((s) => symptoms[s]).join(', ') || 'Belirti yok'}
            </Text>
            <Button
              label={`${entry.meal} kaydını düzenle`}
              secondary
              onPress={() => {
                setDraft(entry);
                setTime(entry.at);
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
