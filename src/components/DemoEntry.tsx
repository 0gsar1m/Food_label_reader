import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { makeDemoWeek } from '../../shared/demoWeek';
import { Button } from './Controls';
import { DemoDialog } from './DemoTour';
import { ui } from '../theme';

const demoMealCount = makeDemoWeek().diary.length;

export function DemoEntry({ onPress }: { onPress: () => void }) {
  const [visible, setVisible] = useState(false);
  const close = () => setVisible(false);
  return (
    <>
      <Button
        label="Demo profiliyle devam et"
        onPress={() => setVisible(true)}
        style={{ borderWidth: 2, borderColor: '#af914e' }}
      />
      <DemoDialog visible={visible} onClose={close}>
        <ScrollView contentContainerStyle={{ gap: 12 }}>
          <Text accessibilityRole="header" style={ui.h2}>
            Demo profilimizle tanış
          </Text>
          <Text style={ui.body}>
            Bu örnek kişi sabahları bazen sütlü yulaf, bazen tost yiyor. Sütlü kahvaltılardan sonra
            ara sıra şişkinlik, geç yediği akşamlarda da mide yanması yaşamış.
          </Text>
          <Text style={ui.body}>
            Bir haftalık günlüğünde {demoMealCount} öğün var. Kendini iyi hissettiği öğünleri de
            kaydetmiş. Bir etiket okuttuğunda Nazif bu kayıtlarla karşılaştıracak.
          </Text>
          <Text style={ui.small}>
            Profil ve öğünler kurgu. Etiket taradığında örnek veriler kişisel yorum için OpenAI’ye
            gönderilir.
          </Text>
        </ScrollView>
        <Button
          label="Demoya devam et"
          onPress={() => {
            close();
            onPress();
          }}
        />
        <Button label="Vazgeç" secondary onPress={close} />
      </DemoDialog>
    </>
  );
}
