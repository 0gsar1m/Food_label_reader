import { useState } from 'react';
import { Linking, Text, TextInput, View } from 'react-native';
import type { Analysis } from '../../shared/analysis';
import { goals, type HealthVault } from '../../shared/profile';
import { portionValues } from '../../shared/nutrition';
import { requestPersonal } from '../lib/personalApi';
import { Button, Notice } from './Controls';
import { ui, theme } from '../theme';

/** Local numbers and profile goals remain distinct from an explicitly requested LLM interpretation. */
export function PersonalPanel({
  analysis,
  vault,
  apiUrl,
  token,
  onProfile,
  onDiary,
}: {
  analysis: Analysis;
  vault: HealthVault;
  apiUrl: string;
  token: string;
  onProfile: () => void;
  onDiary: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reply, setReply] = useState<Awaited<ReturnType<typeof requestPersonal>> | null>(null);
  const nutrition = analysis.nutrition;
  let values: ReturnType<typeof portionValues> | null = null;
  if (nutrition && amount) {
    try {
      values = portionValues(nutrition, Number(amount.replace(',', '.')), nutrition.basisUnit);
    } catch {
      values = null;
    }
  }
  async function interpret(): Promise<void> {
    setBusy(true);
    setError('');
    setReply(null);
    try {
      setReply(
        await requestPersonal(apiUrl, token, {
          consent: true,
          profile: vault.profile,
          diary: vault.diary.slice(0, 20),
          analysis,
          task: 'interpret',
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yorum alınamadı.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: 18, borderTopWidth: 1, borderColor: theme.color.line, paddingTop: 24 }}>
      <Text style={ui.h2}>Senin amacın açısından</Text>
      <Text style={ui.body}>
        {vault.profile.goals.length
          ? vault.profile.goals.map((g) => goals[g]).join(' · ')
          : 'Amaçlarını profilinden seçerek bu okumaya kişisel bağlam ekleyebilirsin.'}
      </Text>
      {nutrition ? (
        <>
          <Text style={ui.strong}>
            Besin tablosu / {nutrition.basisAmount} {nutrition.basisUnit}
          </Text>
          <Text style={ui.small}>Etikette: {nutrition.evidence}</Text>
          <Text style={ui.strong}>Tüketeceğin porsiyon ({nutrition.basisUnit})</Text>
          <TextInput
            accessibilityLabel={`Porsiyon (${nutrition.basisUnit})`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            maxLength={12}
            placeholder="Örn. 40"
            style={ui.input}
          />
          {amount && !values ? (
            <Notice>Porsiyon 0 ile 10000 arasında pozitif bir sayı olmalı.</Notice>
          ) : null}
          {(values || nutrition) && (
            <View style={{ gap: 8 }}>
              {(
                [
                  ['energyKcal', 'Enerji', 'kcal'],
                  ['proteinG', 'Protein', 'g'],
                  ['carbohydrateG', 'Karbonhidrat', 'g'],
                  ['fatG', 'Yağ', 'g'],
                  ['fiberG', 'Lif', 'g'],
                  ['saltG', 'Tuz', 'g'],
                ] as const
              ).map(([id, label, unit]) => (
                <Text key={id} style={ui.body}>
                  {label}: {(values ?? nutrition)[id] ?? 'Bilinmiyor'}{' '}
                  {(values ?? nutrition)[id] === null ? '' : unit}
                  {values ? ' / seçtiğin porsiyon' : ''}
                </Text>
              ))}
              {(values ?? nutrition).micros.map((m, i) => (
                <Text key={i} style={ui.body}>
                  {m.name}: {m.value} {m.unit}
                </Text>
              ))}
            </View>
          )}
          <Text style={ui.small}>
            Değerler{' '}
            {values ? 'seçtiğin porsiyona kodla ölçeklendi' : 'etiketteki temel miktara aittir'}.
            Eksik mikrobesinler hesaplanmaz. Tek ürün günlük enerji dengesini göstermez.
          </Text>
        </>
      ) : (
        <Text style={ui.body}>
          Besin tablosu okunmadı. Kalori, makro veya mikro miktarı tahmin edilmedi. Yeni okumada
          besin tablosunun fotoğrafını da ekleyebilirsin.
        </Text>
      )}
      <Button label="Profilimi düzenle" secondary onPress={onProfile} />
      <Button label="Bu öğünü günlüğe ekle" secondary onPress={onDiary} />
      <Text style={ui.small}>
        {vault.profile.cloudConsent
          ? 'Yorum isteğinde profil özeti, son 20 öğün kaydı ve bu etiket metni sunucu üzerinden Anthropic’e gönderilir.'
          : 'Kişisel LLM yorumu için profilinde aktarım iznini aç. Yerel porsiyon hesabı izin gerektirmez.'}
      </Text>
      <Button
        label={busy ? 'Kişisel yorum hazırlanıyor' : 'Profilime göre yorumla'}
        disabled={busy || !vault.profile.cloudConsent}
        onPress={() => {
          void interpret();
        }}
      />
      {error ? <Notice>{error}</Notice> : null}
      {reply && (
        <View style={{ gap: 16 }}>
          <Text style={ui.body}>{reply.result.summary}</Text>
          {reply.result.findings.map((f, i) => (
            <View key={i} style={{ gap: 8 }}>
              <Text style={ui.body}>{f.text}</Text>
              {f.evidenceIds.map((id) => {
                const e = reply.evidence.find((e) => e.id === id);
                return (
                  <View key={id}>
                    <Text style={ui.small}>
                      Dayanak:{' '}
                      {id.startsWith('profile:')
                        ? 'Profil bildirimin'
                        : id.startsWith('diary:')
                          ? 'Öğün günlüğün'
                          : id.startsWith('label:')
                            ? 'Etiket metni'
                            : id}
                    </Text>
                    {e?.url && (
                      <Text
                        accessibilityRole="link"
                        style={[ui.small, { textDecorationLine: 'underline', paddingVertical: 12 }]}
                        onPress={() => {
                          void Linking.openURL(e.url!).catch(() => setError('Kaynak açılamadı.'));
                        }}
                      >
                        {e.url}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
          <Text style={ui.small}>
            Model: {reply.model} · Girdi: {reply.usage.input_tokens} / çıktı:{' '}
            {reply.usage.output_tokens} token. Bu yorum tanı veya kişisel tetikleyici kanıtı
            değildir.
          </Text>
        </View>
      )}
    </View>
  );
}
