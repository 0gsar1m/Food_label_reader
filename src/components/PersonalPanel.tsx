import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Text, TextInput, View } from 'react-native';
import type { Analysis } from '../../shared/analysis';
import { type DiaryEntry, type HealthVault } from '../../shared/profile';
import { requestPersonal } from '../lib/personalApi';
import { Choice } from '../screens/Profile';
import { Button, Notice } from './Controls';
import { ui, theme } from '../theme';

function labelForEvidence(id: string): string {
  if (id.startsWith('profile:')) return 'Profil bildirimin';
  if (id.startsWith('diary:')) return 'Öğün günlüğün';
  if (id.startsWith('label:')) return 'Etiket metni';
  if (id === 'source:diary') return 'NIH – Günlük tutma bilgisi';
  if (id === 'source:bloating') return 'NHS – Şişkinlik';
  if (id === 'source:eczema') return 'ASCIA – Egzama ve gıda';
  return '';
}

/** Local numbers and profile goals remain distinct from an explicitly requested LLM interpretation. */
export function PersonalPanel({
  analysis,
  vault,
  scenario = false,
  onUpdateDiary,
  apiUrl,
  token,
  autoPersonal,
}: {
  analysis: Analysis;
  vault: HealthVault;
  scenario?: boolean;
  onUpdateDiary: (entry: DiaryEntry) => Promise<void>;
  apiUrl: string;
  token: string;
  autoPersonal?: boolean;
}) {
  const [scenarioConsent, setScenarioConsent] = useState(false);
  const hasConsent = scenario ? scenarioConsent : vault.profile.openaiConsent;
  const [scenarioDiary, setScenarioDiary] = useState(vault.diary);
  const [rehearsal, setRehearsal] = useState(false);
  const [answer, setAnswer] = useState('');
  const [savedAnswer, setSavedAnswer] = useState('');
  const diary = scenario ? scenarioDiary : vault.diary;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reply, setReply] = useState<Awaited<ReturnType<typeof requestPersonal>> | null>(null);
  const sent = useRef(false);
  async function interpret(records = diary): Promise<void> {
    if (!hasConsent || busy) return;
    setRehearsal(false);
    setBusy(true);
    setError('');
    setReply(null);
    try {
      setReply(
        await requestPersonal(apiUrl, token, {
          consent: true,
          profile: { ...vault.profile, openaiConsent: hasConsent },
          ...(scenario ? { scenario: true as const } : {}),
          diary: records.slice(0, 20),
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
  const startAutomatic = useEffectEvent(() => {
    if (sent.current) return;
    sent.current = true;
    void interpret();
  });
  useEffect(() => {
    if (autoPersonal && hasConsent) startAutomatic();
  }, [autoPersonal, hasConsent]);

  function rehearse(detail?: string): void {
    setRehearsal(true);
    const sampleAnswer =
      detail?.toLocaleLowerCase('tr-TR').replace(/[.!]$/, '') === 'yanında 200 ml süt içtim';
    setReply({
      model: 'Kurgu prova',
      evidence: [],
      usage: { input_tokens: 0, output_tokens: 0 },
      result: {
        summary: detail
          ? sampleAnswer
            ? 'Yulaf iki öğünde de vardı. Şişkinlik kaydedilen öğünde porsiyon 60 g ve yanında 200 ml süt vardı. Belirtisiz öğünde 30 g yulaf suyla pişmişti. İki ayrıntı birlikte değiştiği için bu kayıtlar hangisinin etkili olduğunu ayıramıyor.'
            : 'Cevap örnek öğüne eklendi. Hazır karşılaştırmayı görmek için “Yanında 200 ml süt içtim.” cevabıyla prova yapabilirsin.'
          : 'Örnek profilde 60 g yulaf kasesinden sonra şişkinlik kaydı var. Suyla pişen 30 g yulaf öğününde belirti kaydı yok. İlk öğünde yulafın yanında ne tüketildiği eksik.',
        findings: [],
        questionIds: [],
        ...(detail
          ? {}
          : {
              followUp: { diaryId: 'diary:0', question: 'Yulaf kasesini neyle yedin veya içtin?' },
            }),
      },
    });
  }

  async function answerFollowUp(): Promise<void> {
    const followUp = reply?.result.followUp;
    if (!followUp || (!rehearsal && !hasConsent) || busy || !answer.trim()) return;
    const sentDiary = diary.slice(0, 20).filter((entry) => Boolean(entry.demo) === scenario);
    const entry = sentDiary[Number(followUp.diaryId.slice('diary:'.length))];
    if (!entry) return;
    const detail = `Takip sorusu: ${followUp.question} Cevap: ${answer.trim()}`;
    const notes = [entry.notes, detail].filter(Boolean).join('\n');
    if (notes.length > 600) {
      setError('Bu öğünün not alanı dolu. Günlükteki notu kısaltıp yeniden dene.');
      return;
    }
    const updated = { ...entry, notes };
    const records = diary.map((item) => (item.id === entry.id ? updated : item));
    setBusy(true);
    setError('');
    try {
      if (scenario) setScenarioDiary(records);
      else await onUpdateDiary(updated);
      setSavedAnswer(answer.trim());
      setAnswer('');
    } catch {
      setError('Cevap günlüğe kaydedilemedi. Yorum gönderilmedi.');
      setBusy(false);
      return;
    }
    if (rehearsal) {
      rehearse(answer.trim());
      setBusy(false);
    } else await interpret(records);
  }

  return (
    <View style={{ gap: 18, borderTopWidth: 1, borderColor: theme.color.line, paddingTop: 24 }}>
      {(scenario || autoPersonal) && <Text style={ui.h2}>Kişisel yorum</Text>}
      {busy && (
        <View accessibilityLiveRegion="polite" style={[ui.row, { gap: 10 }]}>
          <ActivityIndicator color={theme.color.green} />
          <Text style={ui.body}>Kişisel yorum hazırlanıyor…</Text>
        </View>
      )}
      {scenario ? (
        <View style={{ gap: 10 }}>
          <Notice>Kurgu profil ve öğünler. Bu deneme kişisel günlüğüne yazılmaz.</Notice>
          {diary.map((entry) => (
            <Text key={entry.id} style={ui.small}>
              {entry.meal} · {entry.amount} ·{' '}
              {entry.symptoms.length ? 'Şişkinlik kaydı' : 'Belirti yok'}
            </Text>
          ))}
          <Choice
            label="Kurgu profili ve örnek öğünleri OpenAI’ye gönder"
            checked={scenarioConsent}
            onPress={() => setScenarioConsent(!scenarioConsent)}
          />
        </View>
      ) : null}
      {scenario && (
        <Button
          label="Hazır yanıtlarla prova yap"
          secondary
          disabled={busy}
          onPress={() => {
            setScenarioDiary(vault.diary);
            setSavedAnswer('');
            setAnswer('');
            setError('');
            rehearse();
          }}
        />
      )}
      {scenario && (
        <Button
          label="Örnek bulut yorumunu al"
          disabled={busy || !hasConsent || (Boolean(reply) && !rehearsal)}
          onPress={() => void interpret()}
        />
      )}
      {error ? <Notice>{error}</Notice> : null}
      {!scenario && error && !reply && hasConsent && !busy && (
        <Button label="Yorumu yeniden dene" secondary onPress={() => void interpret()} />
      )}
      {savedAnswer ? <Text style={ui.small}>Öğüne eklenen cevap: {savedAnswer}</Text> : null}
      {reply && (
        <View style={{ gap: 16 }}>
          {rehearsal && <Notice>Hazır kurgu yanıt. Bu prova OpenAI’ye istek göndermez.</Notice>}
          {reply.result.decision && (
            <View
              style={{ backgroundColor: theme.color.pale, borderRadius: 6, padding: 16, gap: 6 }}
            >
              <Text style={[ui.strong, { color: theme.color.green }]}>Senin için sonuç</Text>
              <Text style={ui.body}>{reply.result.decision}</Text>
            </View>
          )}
          <Text style={ui.body}>{reply.result.summary}</Text>
          {reply.result.findings.map((f, i) => {
            const seenLabels = new Set<string>();
            const uniqueEvidence = f.evidenceIds
              .map((id) => ({
                id,
                label: labelForEvidence(id),
                item: reply.evidence.find((e) => e.id === id),
              }))
              .filter(({ label }) => {
                if (!label || seenLabels.has(label)) return false;
                seenLabels.add(label);
                return true;
              });
            return (
              <View key={i} style={{ gap: 6 }}>
                <Text style={ui.body}>{f.text}</Text>
                {uniqueEvidence.map(({ id, label, item }) =>
                  item?.url ? (
                    <Text
                      key={id}
                      accessibilityRole="link"
                      style={[ui.small, { textDecorationLine: 'underline', paddingVertical: 4 }]}
                      onPress={() => {
                        void Linking.openURL(item.url!).catch(() => setError('Kaynak açılamadı.'));
                      }}
                    >
                      Kaynak: {label}
                    </Text>
                  ) : (
                    <Text key={id} style={ui.small}>
                      Dayanak: {label}
                    </Text>
                  ),
                )}
              </View>
            );
          })}
          {reply.result.followUp && (hasConsent || rehearsal) && (
            <View style={{ gap: 10 }}>
              <Text style={ui.strong}>{reply.result.followUp.question}</Text>
              <TextInput
                accessibilityLabel="Takip sorusuna cevap"
                style={ui.input}
                value={answer}
                onChangeText={setAnswer}
                maxLength={240}
                editable={!busy}
                placeholder="Örn. Yanında bir bardak süt içtim"
              />
              <Button
                label="Cevabı kaydet ve yeniden yorumla"
                disabled={busy || !answer.trim()}
                onPress={() => {
                  void answerFollowUp();
                }}
              />
            </View>
          )}
          <Text style={ui.small}>Bu yorum tanı veya kişisel tetikleyici kanıtı değildir.</Text>
        </View>
      )}
    </View>
  );
}
