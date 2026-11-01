import { Modal, Text, View } from 'react-native';
import { Button } from './Controls';
import { theme, ui } from '../theme';

/** Bulk deletion is confirmed explicitly on native and web platforms. */
export function ConfirmDialog({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View
        style={{ flex: 1, backgroundColor: '#20282099', justifyContent: 'center', padding: 28 }}
      >
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: theme.color.paper,
            borderRadius: 6,
            padding: 24,
            gap: 20,
            width: '100%',
            maxWidth: 400,
            alignSelf: 'center',
          }}
        >
          <Text accessibilityRole="header" style={ui.h2}>
            Geçmiş silinsin mi?
          </Text>
          <Text style={ui.body}>
            Bu cihazdaki tüm okuma kayıtları silinir. Bu işlem geri alınamaz. Alerjen tercihlerin
            korunur.
          </Text>
          <Button label="Evet, geçmişi sil" onPress={onConfirm} />
          <Button label="Vazgeç" secondary onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}
