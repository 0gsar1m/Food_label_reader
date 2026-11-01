import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { theme, ui } from '../theme';
import { copy } from '../content';
import { Button } from '../components/Controls';
import { LabelIllustration } from '../components/LabelIllustration';
import { Icon } from '../components/Icon';
import type { ScanRecord } from '../../shared/analysis';

/** The primary action stays focused on photographing the label rather than product marketing. */
export function Home({
  onAccount,
  onProfile,
  onDiary,
  onCamera,
  onGallery,
  onDemo,
  recent,
  onRecent,
}: {
  onAccount: () => void;
  onProfile: () => void;
  onDiary: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onDemo: () => void;
  recent?: ScanRecord;
  onRecent: (record: ScanRecord) => void;
}) {
  return (
    <ScrollView contentContainerStyle={[ui.content, { gap: 22 }]}>
      <View style={[ui.between, { marginBottom: 9 }]}>
        <Text style={s.brand}>{copy.brand}</Text>
        <View style={s.wordmark}>
          <View style={s.dot} />
          <Text style={ui.eyebrow}>DAHA ANLAŞILIR</Text>
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <Text style={ui.eyebrow}>{copy.tagline}</Text>
        <Text accessibilityRole="header" style={s.hero}>
          {copy.heading}
        </Text>
        <Text style={[ui.body, { color: theme.color.muted, maxWidth: 310 }]}>{copy.intro}</Text>
      </View>
      <View style={s.scanner}>
        <View style={[ui.between, { paddingHorizontal: 18, paddingTop: 16 }]}>
          <Text style={[ui.eyebrow, { fontSize: 9 }]}>01 / FOTOĞRAFLA BAŞLA</Text>
          <Icon name="scan" size={16} color={theme.color.green} />
        </View>
        <LabelIllustration />
        <Text style={[ui.small, { textAlign: 'center', paddingBottom: 18 }]}>
          İçindekiler bölümünü kadraja al.
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        <Button label={copy.scan} icon="scan" onPress={onCamera} />
        <Button label={copy.gallery} icon="gallery" secondary onPress={onGallery} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Örnek etiketi incele"
        onPress={onDemo}
        style={s.example}
      >
        <View style={{ gap: 4, flex: 1 }}>
          <Text style={ui.eyebrow}>ÖNCE BİR GÖZ AT</Text>
          <Text style={ui.strong}>Örnek etiketi incele</Text>
        </View>
        <Icon name="arrow" size={22} />
      </Pressable>
      <Button label="Hesabım" secondary onPress={onAccount} />
      <Button label="Kullanım profilim" secondary onPress={onProfile} />
      <Button label="Öğün ve belirti günlüğüm" secondary onPress={onDiary} />
      {recent && (
        <Pressable accessibilityRole="button" onPress={() => onRecent(recent)} style={{ gap: 8 }}>
          <Text style={ui.eyebrow}>SON OKUMAN</Text>
          <View style={ui.between}>
            <Text style={[ui.body, { flex: 1 }]}>
              {recent.analysis.productName ?? 'Gıda etiketi'}
            </Text>
            <Icon name="arrow" size={18} />
          </View>
        </Pressable>
      )}
      <View style={[ui.row, { alignItems: 'flex-start', gap: 9 }]}>
        <Icon name="shield" size={16} color={theme.color.muted} />
        <Text style={[ui.small, { flex: 1 }]}>
          Fotoğraf geçmişe kaydedilmez. Okumaların bu cihazda kalır.
        </Text>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  brand: {
    fontFamily: theme.font.serif,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.6,
    color: theme.color.ink,
  },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: theme.color.green },
  hero: {
    fontFamily: theme.font.serif,
    fontSize: 62,
    lineHeight: 60,
    letterSpacing: -2,
    color: theme.color.ink,
  },
  scanner: { backgroundColor: theme.color.pale, borderRadius: 6, overflow: 'hidden' },
  example: {
    minHeight: 72,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.color.line,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
