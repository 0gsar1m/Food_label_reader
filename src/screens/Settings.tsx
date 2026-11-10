import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { allergenIds, allergenNames, type AllergenId } from '../../shared/analysis';
import { Button, Notice } from '../components/Controls';
import { Icon } from '../components/Icon';
import { checkConnection } from '../lib/api';
import { theme, ui } from '../theme';

/** Allergy preferences highlight label declarations without pretending to cover all sensitivities. */
export function Settings({
  onAccount,
  onProfile,
  onDiary,
  preferences,
  onPreferences,
  apiUrl,
  token,
  onConnection,
  onLegal,
}: {
  onAccount: () => void;
  onProfile: () => void;
  onDiary: () => void;
  preferences: AllergenId[];
  onPreferences: (value: AllergenId[]) => void;
  apiUrl: string;
  token: string;
  onConnection: (url: string, token: string) => Promise<void>;
  onLegal: (kind: 'privacy' | 'terms') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState(apiUrl);
  const [secret, setSecret] = useState(token);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(): Promise<void> {
    setBusy(true);
    setFeedback('');
    try {
      await onConnection(url, secret.trim());
      setFeedback('Bağlantı ayarları kaydedildi.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Ayarlar kaydedilemedi.');
    } finally {
      setBusy(false);
    }
  }
  async function test(): Promise<void> {
    setBusy(true);
    setFeedback('');
    try {
      setFeedback(await checkConnection(url));
    } catch {
      setFeedback('Sunucuya ulaşılamadı. Adresi ve ağ bağlantını kontrol et.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>
      <Text style={ui.eyebrow}>SANA GÖRE</Text>
      <Button label="Hesabım" secondary onPress={onAccount} />
      <Button label="Kullanım profilimi düzenle" secondary onPress={onProfile} />
      <Button label="Öğün ve belirti günlüğüm" secondary onPress={onDiary} />
      <View style={{ gap: 12 }}>
        <Text accessibilityRole="header" style={ui.title}>
          {'Önemsediğin\nalerjenler.'}
        </Text>
        <Text style={ui.body}>
          Seçtiklerin, etikette bir beyan bulunduğunda öne çıkar. Tercihlerin bu cihazda kalır.
        </Text>
        <Text style={ui.small}>
          Bu liste tüm olası alerjileri ve hassasiyetleri kapsamaz. Seçim yapmasan da bulunan tüm
          alerjen beyanları gösterilir.
        </Text>
      </View>
      <View>
        {allergenIds.map((id) => {
          const checked = preferences.includes(id);
          return (
            <Pressable
              key={id}
              accessibilityRole="checkbox"
              accessibilityLabel={allergenNames[id]}
              accessibilityState={{ checked }}
              aria-checked={checked}
              onPress={() =>
                onPreferences(
                  checked ? preferences.filter((value) => value !== id) : [...preferences, id],
                )
              }
              style={[
                ui.between,
                {
                  minHeight: 56,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: theme.color.line,
                },
              ]}
            >
              <Text style={[ui.body, { flex: 1 }]}>{allergenNames[id]}</Text>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderWidth: 1,
                  borderColor: checked ? theme.color.green : theme.color.muted,
                  borderRadius: 3,
                  backgroundColor: checked ? theme.color.green : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {checked && <Icon name="check" color={theme.color.paper} size={17} />}
              </View>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        aria-expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        style={[ui.between, { minHeight: 56 }]}
      >
        <Text style={ui.strong}>Okuma hizmeti bağlantısı</Text>
        <Icon name={expanded ? 'close' : 'settings'} size={20} />
      </Pressable>
      {expanded && (
        <View style={{ gap: 14 }}>
          <Text style={ui.small}>
            Gemini anahtarı sunucuda tutulur. Buraya Gemini anahtarı yazma. Yalnız kendi API
            sunucunun adresini ve varsa erişim anahtarını gir.
          </Text>
          <Text style={ui.strong}>Sunucu adresi</Text>
          <TextInput
            accessibilityLabel="Sunucu adresi"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={ui.input}
          />
          <Text style={ui.strong}>Sunucu erişim anahtarı (isteğe bağlı)</Text>
          <TextInput
            accessibilityLabel="Sunucu erişim anahtarı"
            value={secret}
            onChangeText={setSecret}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={ui.input}
          />
          {Platform.OS === 'web' && (
            <Text style={ui.small}>
              Web önizlemesinde erişim anahtarı yalnız bu oturumda tutulur.
            </Text>
          )}
          <Button
            label={busy ? 'Bağlantı kontrol ediliyor' : 'Ayarları kaydet'}
            disabled={busy}
            onPress={() => {
              void save();
            }}
          />
          <Button
            label="Bağlantıyı test et"
            disabled={busy}
            secondary
            onPress={() => {
              void test();
            }}
          />
          {feedback ? <Notice>{feedback}</Notice> : null}
        </View>
      )}
      <View style={ui.divider} />
      <View style={{ gap: 4 }}>
        {(
          [
            ['privacy', 'Gizlilik politikası'],
            ['terms', 'Kullanım koşulları'],
          ] as const
        ).map(([kind, label]) => (
          <Pressable
            key={kind}
            accessibilityRole="link"
            onPress={() => onLegal(kind)}
            style={[ui.between, { minHeight: 52 }]}
          >
            <Text style={ui.body}>{label}</Text>
            <Icon name="arrow" size={18} />
          </Pressable>
        ))}
      </View>
      <Text style={ui.small}>Nazif 1.0.0 · Fotoğraftan anlaşılır bilgi.</Text>
    </ScrollView>
  );
}
