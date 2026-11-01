import { useState } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import type { AllergenId } from '../../shared/analysis';
import { restaurantCard } from '../../shared/observations';
import { Button, Notice, ScreenHeader } from '../components/Controls';
import { ui, theme } from '../theme';

/** A reviewable server card shares only manually selected restrictions. */
export function Restaurant({
  allergens,
  avoided,
  onBack,
  onSettings,
  onProfile,
  onMenu,
}: {
  allergens: AllergenId[];
  avoided: string[];
  onBack: () => void;
  onSettings: () => void;
  onProfile: () => void;
  onMenu: () => void;
}) {
  const [error, setError] = useState('');
  const text = restaurantCard(allergens, avoided);
  return (
    <View style={ui.page}>
      <ScreenHeader title="Dışarıda yemek" onBack={onBack} />
      <ScrollView contentContainerStyle={ui.content}>
        <Text style={ui.eyebrow}>RESTORAN KARTIN</Text>
        <Text style={ui.title}>{'Mutfağa\nne soralım?'}</Text>
        <Text style={ui.body}>
          Kart tanı bilgilerini içermez. Paylaşmadan önce tercihlerini kontrol et.
        </Text>
        <View style={{ backgroundColor: theme.color.pale, padding: 22, gap: 16 }}>
          <Text style={ui.h2}>Mutfak için not</Text>
          <Text style={ui.body}>{text}</Text>
        </View>
        {!allergens.length && !avoided.length && (
          <Notice>Kartına henüz alerjen veya kaçındığın gıda eklemedin.</Notice>
        )}
        <Button
          label="Restoran kartını paylaş"
          onPress={() => {
            void Share.share({ message: text }).catch(() => setError('Kart paylaşılamadı.'));
          }}
        />
        <Button label="Alerjen tercihlerimi düzenle" secondary onPress={onSettings} />
        <Button label="Kaçındığım gıdaları düzenle" secondary onPress={onProfile} />
        <Button label="Menü veya tabak fotoğrafı incele" secondary onPress={onMenu} />
        <Text style={ui.small}>
          Kart, mutfağın vereceği bilginin veya çapraz temas kontrolünün yerine geçmez. Menü ve
          fotoğraf görünmeyen malzemeleri doğrulayamaz.
        </Text>
        {error && <Notice>{error}</Notice>}
      </ScrollView>
    </View>
  );
}
