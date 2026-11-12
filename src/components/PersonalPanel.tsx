import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { Analysis } from '../../shared/analysis';
import { type HealthVault } from '../../shared/profile';
import { requestPersonal } from '../lib/personalApi';
import { Choice } from '../screens/Profile';
import { Button, Notice } from './Controls';
import { ui, theme } from '../theme';

/** Local numbers and profile goals remain distinct from an explicitly requested LLM interpretation. */
export function PersonalPanel({
  analysis,
  vault,
  scenario = false,
  apiUrl,
  token,
  autoPersonal,
}: {
  analysis: Analysis;
  vault: HealthVault;
  scenario?: boolean;
  apiUrl: string;
  token: string;
  autoPersonal?: boolean;
}) {
  const [scenarioConsent, setScenarioConsent] = useState(false);
  const hasConsent = scenario ? scenarioConsent : vault.profile.openaiConsent;
  const [rehearsal, setRehearsal] = useState(false);
  const diary = vault.diary;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reply, setReply] = useState<Awaited<ReturnType<typeof requestPersonal>> | null>(null);
  const sent = useRef(false);
  async function interpret(): Promise<void> {
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
          diary: diary.slice(0, 20),
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

  function rehearse(): void {
    setRehearsal(true);
    setError('');
    setReply({
      model: 'Kurgu prova',
      evidence: [],
      usage: { input_tokens: 0, output_tokens: 0 },
      result: {
        summary: 'Kurgu profil ve öğünlerle hazır örnek.',
        decision:
          'Örnek günlüğünde sütlü yulaftan sonra şişkinlik kaydı var. Bu öğünde süt, dikkat etmeye değer.',
        recommendation:
          'Yulafı sütle yiyeceksen, laktozsuz süt tercih edip şişkinlik olup olmadığını izleyebilirsin.',
        findings: [],
        questionIds: [],
      },
    });
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
        <Button label="Hazır yanıtlarla prova yap" secondary disabled={busy} onPress={rehearse} />
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
      {reply && (
        <View style={{ gap: 12 }}>
          <View style={{ backgroundColor: theme.color.pale, borderRadius: 6, padding: 16, gap: 6 }}>
            <Text style={[ui.strong, { color: theme.color.green }]}>Senin için sonuç</Text>
            <Text style={ui.body}>{reply.result.decision ?? reply.result.summary}</Text>
          </View>
          {reply.result.recommendation && (
            <View
              style={{
                backgroundColor: theme.color.paleBlue,
                borderRadius: 6,
                padding: 16,
                gap: 6,
              }}
            >
              <Text style={[ui.strong, { color: theme.color.blue }]}>Öneri</Text>
              <Text style={ui.body}>{reply.result.recommendation}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
