import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { theme, ui } from '../theme';
import { copy } from '../content';
import { Button } from '../components/Controls';
import { LabelIllustration } from '../components/LabelIllustration';
import { Icon } from '../components/Icon';

/** The primary action stays focused on photographing the label rather than product marketing. */
export function Home({
  onAccount,
  onProfile,
  onDiary,
  onInsights,
  onRestaurant,
  onFoodPhoto,
  onBarcode,
  pending,
  onCamera,
  onGallery,
  onDemo,
  onScenario,
  onRecent,
}: {
  onAccount: () => void;
  onProfile: () => void;
  onDiary: () => void;
  onInsights: () => void;
  onRestaurant: () => void;
  onFoodPhoto: () => void;
  onBarcode: () => void;
  pending: number;
  onCamera: () => void;
  onGallery: () => void;
  onDemo: () => void;
  onScenario: () => void;
  onRecent: () => void;
}) {
  const [tutorial, setTutorial] = useState(false);
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
        <Button label="Barkoddan ürün bul" secondary onPress={onBarcode} />
        <Button label="Son okumaların" icon="history" secondary onPress={onRecent} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Öğreticiyi aç"
        onPress={() => setTutorial(true)}
        style={s.example}
      >
        <View style={{ gap: 4, flex: 1 }}>
          <Text style={ui.eyebrow}>ÖĞRETİCİ</Text>
          <Text style={ui.strong}>Uygulamayı nasıl kullanırsın?</Text>
        </View>
        <Icon name="arrow" size={22} />
      </Pressable>
      <Modal
        visible={tutorial}
        transparent
        animationType="none"
        onRequestClose={() => setTutorial(false)}
      >
        <View
          style={{ flex: 1, backgroundColor: '#20282099', justifyContent: 'center', padding: 28 }}
        >
          <View
            accessibilityViewIsModal
            style={{
              backgroundColor: theme.color.paper,
              padding: 24,
              gap: 16,
              width: '100%',
              maxWidth: 400,
              alignSelf: 'center',
            }}
          >
            <Text accessibilityRole="header" style={ui.h2}>
              Örnek okuma
            </Text>
            <Text style={ui.body}>
              Kakaolu yulaflı bisküviyle etiket özetini ve örnek bir günlük yorumunu gör.
            </Text>
            <Button
              label="Örnek etiketi incele"
              onPress={() => {
                setTutorial(false);
                onDemo();
              }}
            />
            <Button
              label="Örnek profille kişisel yorumu dene"
              secondary
              onPress={() => {
                setTutorial(false);
                onScenario();
              }}
            />
            <Button label="Kapat" secondary onPress={() => setTutorial(false)} />
          </View>
        </View>
      </Modal>
      <Button label="Hesabım" secondary onPress={onAccount} />
      <Button label="Kullanım profilim" secondary onPress={onProfile} />
      <Button label="Öğün ve belirti günlüğüm" secondary onPress={onDiary} />
      <View style={{ gap: 14, borderTopWidth: 1, borderColor: theme.color.line, paddingTop: 20 }}>
        <Text style={ui.eyebrow}>YEMEKTEN SONRA</Text>
        <Text style={ui.h2}>Bugün nasıl hissettin?</Text>
        <Text style={ui.body}>
          {pending
            ? `${pending} öğünün için kontrol bekliyor.`
            : 'Öğününü kaydet. Ardından belirtili ve belirtisiz deneyimlerini takip et.'}
        </Text>
        <Button label="Gözlemlerim" secondary onPress={onInsights} />
        <Button label="Dışarıda yemek / restoran kartım" secondary onPress={onRestaurant} />
        <Button label="Menü ve tabak incele" secondary onPress={onFoodPhoto} />
      </View>
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
