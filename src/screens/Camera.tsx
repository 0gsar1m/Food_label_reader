import { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, IconButton, Notice, ScreenHeader } from '../components/Controls';
import { preparePhoto, type PreparedPhoto } from '../lib/photo';
import { theme, ui } from '../theme';

/** Camera is mounted only on this screen; capture must finish before navigating to review. */
export function Camera({
  onBack,
  onPhoto,
  onGallery,
}: {
  onBack: () => void;
  onPhoto: (photo: PreparedPhoto) => void;
  onGallery: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [torch, setTorch] = useState(false);
  const [error, setError] = useState('');
  async function capture(): Promise<void> {
    if (!camera.current || busy || !ready) return;
    setBusy(true);
    setError('');
    try {
      const image = await camera.current.takePictureAsync({ quality: 0.95, exif: false });
      if (!image) throw new Error('Fotoğraf alınamadı. Yeniden dene.');
      onPhoto(await preparePhoto(image.uri, image.width, image.height));
    } catch {
      setError('Fotoğraf alınamadı. Kamerayı sabit tutup yeniden dene.');
    } finally {
      setBusy(false);
    }
  }
  if (!permission?.granted)
    return (
      <View style={ui.page}>
        <ScreenHeader title="Etiketi tara" onBack={onBack} />
        <View style={ui.content}>
          <Text style={ui.title}>Etikete yakından bak.</Text>
          <Text style={ui.body}>
            Fotoğraf çekmek için kameraya izin ver. Galeriden bir etiket seçerek de devam
            edebilirsin.
          </Text>
          {permission?.canAskAgain === false ? (
            <Button
              label="Telefon ayarlarını aç"
              onPress={() => {
                void Linking.openSettings().catch(() =>
                  setError('Ayarlar açılamadı. Telefon ayarlarından kamera iznini açabilirsin.'),
                );
              }}
            />
          ) : (
            <Button
              label="Kameraya izin ver"
              onPress={() => {
                void requestPermission().catch(() =>
                  setError('Kamera izni alınamadı. Galeriden seçim yapabilirsin.'),
                );
              }}
            />
          )}
          <Button label="Galeriden seç" secondary icon="gallery" onPress={onGallery} />
          {error ? <Notice>{error}</Notice> : null}
        </View>
      </View>
    );
  return (
    <View style={[ui.page, { backgroundColor: theme.color.ink }]}>
      <View style={[ui.between, { paddingHorizontal: 12 }]}>
        <IconButton
          label="Kamerayı kapat"
          icon="close"
          color={theme.color.paper}
          onPress={onBack}
        />
        <Text style={[ui.strong, { color: theme.color.paper }]}>İçindekileri hizala</Text>
        <IconButton
          label={torch ? 'Feneri kapat' : 'Feneri aç'}
          icon="flash"
          color={torch ? '#D6DDB1' : theme.color.paper}
          onPress={() => setTorch(!torch)}
        />
      </View>
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <CameraView
          ref={camera}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          onCameraReady={() => setReady(true)}
          onMountError={() => setError('Kamera açılamadı. Galeriden bir fotoğraf seçebilirsin.')}
        />
        <View pointerEvents="none" style={s.overlay}>
          <View style={s.frame} />
          <Text style={s.tip}>
            Parlamayı azalt. İçindekiler ve alerjen bilgisi birlikte görünsün.
          </Text>
        </View>
      </View>
      {error ? <Notice>{error}</Notice> : null}
      <View style={[ui.between, { padding: 24 }]}>
        <IconButton
          label="Galeriden seç"
          icon="gallery"
          color={theme.color.paper}
          onPress={onGallery}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fotoğraf çek"
          accessibilityState={{ disabled: busy || !ready }}
          disabled={busy || !ready}
          onPress={() => {
            void capture();
          }}
          style={s.shutter}
        >
          {busy ? <ActivityIndicator color={theme.color.green} /> : <View style={s.shutterInner} />}
        </Pressable>
        <View style={{ width: 48 }} />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 30, gap: 24 },
  frame: {
    height: '48%',
    minHeight: 150,
    borderWidth: 1.5,
    borderColor: theme.color.paper,
    borderRadius: 6,
  },
  tip: {
    fontFamily: theme.font.medium,
    color: theme.color.paper,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#202820D9',
    padding: 12,
    lineHeight: 21,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.color.paper,
    borderWidth: 3,
    borderColor: '#BAC1B1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: theme.color.ink,
  },
});
