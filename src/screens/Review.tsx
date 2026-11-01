import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { Button, Notice, ScreenHeader } from '../components/Controls';
import { ui, theme } from '../theme';
import { copy } from '../content';
import type { PreparedPhoto } from '../lib/photo';

/** Explicit transmission action follows a local-only preview; retries use the same image. */
export function Review({
  photo,
  busy,
  error,
  onBack,
  onScan,
  onCancel,
  onRetake,
  onPrivacy,
}: {
  photo: PreparedPhoto;
  busy: boolean;
  error: string;
  onBack: () => void;
  onScan: () => void;
  onCancel: () => void;
  onRetake: () => void;
  onPrivacy: () => void;
}) {
  return (
    <View style={ui.page}>
      <ScreenHeader
        title={busy ? 'Etiket okunuyor' : 'Fotoğrafı kontrol et'}
        onBack={busy ? onCancel : onBack}
      />
      <ScrollView contentContainerStyle={ui.content}>
        <View style={{ gap: 10 }}>
          <Text style={ui.eyebrow}>02 / {busy ? 'OKUMA' : 'SON BİR BAKIŞ'}</Text>
          <Text style={ui.title}>
            {busy ? 'İçindekiler\naçıklanıyor.' : 'Yazılar net\ngörünüyor mu?'}
          </Text>
        </View>
        <Image
          source={{ uri: photo.uri }}
          style={{ width: '100%', height: 270, backgroundColor: theme.color.pale, borderRadius: 5 }}
          resizeMode="contain"
          accessibilityLabel="Seçilen etiket fotoğrafı"
        />
        {error ? <Notice>{error}</Notice> : null}
        {busy ? (
          <View style={{ gap: 20 }}>
            <View accessibilityLiveRegion="polite" style={ui.row}>
              <ActivityIndicator color={theme.color.green} />
              <Text style={[ui.body, { flex: 1 }]}>
                Etiket okunuyor ve açıklamalar hazırlanıyor.
              </Text>
            </View>
            <Text style={ui.small}>
              Bağlantıya ve görselin okunabilirliğine göre biraz sürebilir. Bu ekranı açık tut.
            </Text>
            <Button label="Okumayı iptal et" secondary onPress={onCancel} />
          </View>
        ) : (
          <>
            <Text style={ui.body}>
              İçindekiler listesi ve alerjen uyarısının tamamı görünsün. Bulanık veya kesik alan
              varsa tekrar çek.
            </Text>
            <View style={{ gap: 8 }}>
              <Text style={ui.small}>{copy.photoConsent}</Text>
              <Text
                accessibilityRole="link"
                onPress={onPrivacy}
                style={[
                  ui.small,
                  {
                    color: theme.color.green,
                    textDecorationLine: 'underline',
                    paddingVertical: 12,
                  },
                ]}
              >
                Gizlilik politikasını oku
              </Text>
            </View>
            <Button label="Fotoğrafı gönder ve oku" icon="scan" onPress={onScan} />
            <Button label="Başka fotoğraf çek" secondary onPress={onRetake} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
