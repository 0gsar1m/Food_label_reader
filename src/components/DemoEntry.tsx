import { Text, View } from 'react-native';
import { Button } from './Controls';
import { ui } from '../theme';

export function DemoEntry({ onPress }: { onPress: () => void }) {
  return (
    <View style={{ gap: 8 }}>
      <Button
        label="Demo için kullanıcı profil sorularını atla"
        onPress={onPress}
        style={{ borderWidth: 2, borderColor: '#af914e' }}
      />
      <Text style={ui.small}>
        Hazır profil ve bir haftalık kurgu günlük açılır. Etiket taradığında bu örnek veriler
        kişisel yorum için OpenAI’ye gönderilir.
      </Text>
    </View>
  );
}
