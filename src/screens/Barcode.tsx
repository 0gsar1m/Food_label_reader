import { useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { z } from 'zod';
import { barcodeProductSchema, validGtin, type BarcodeProduct } from '../../shared/barcode';
import { validateApiUrl } from '../../shared/connection';
import { Button, Notice, ScreenHeader } from '../components/Controls';
import { ui } from '../theme';

/** Barcode lookup is a public catalogue lookup, not a photo reading or medical evaluation. */
export function Barcode({
  apiUrl,
  token,
  onBack,
  onLabel,
  onDiary,
}: {
  apiUrl: string;
  token: string;
  onBack: () => void;
  onLabel: () => void;
  onDiary: (meal: string) => void;
}) {
  const [code, setCode] = useState('');
  const [camera, setCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [product, setProduct] = useState<BarcodeProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  async function lookup(): Promise<void> {
    if (active.current) return;
    if (!validGtin(code)) {
      setError('Geçerli bir EAN/UPC barkodu gir. Son kontrol rakamını da kontrol et.');
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    const timer = setTimeout(() => controller.abort(), 10000);
    setBusy(true);
    setError('');
    setProduct(null);
    try {
      const response = await fetch(`${validateApiUrl(apiUrl)}/api/barcode/${code}`, {
        signal: controller.signal,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok)
        throw new Error(
          'Kataloğa ulaşılamadı veya sunucu girişi gerekli. Etiket fotoğrafıyla devam edebilirsin.',
        );
      const value = z
        .object({ product: barcodeProductSchema.nullable() })
        .parse(await response.json());
      if (!controller.signal.aborted) {
        setProduct(value.product);
        if (!value.product)
          setError('Bu barkod katalogda bulunamadı. Etiket fotoğrafını okuyabilirsin.');
      }
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : 'Katalog açılamadı.');
      else setError('Katalog isteği zaman aşımına uğradı.');
    } finally {
      clearTimeout(timer);
      active.current = null;
      setBusy(false);
    }
  }
  return (
    <View style={ui.page}>
      <ScreenHeader title="Barkoddan ürün bul" onBack={onBack} />
      <ScrollView contentContainerStyle={ui.content}>
        <Text style={ui.eyebrow}>AÇIK ÜRÜN KATALOĞU / LLM ÇAĞRISI YOK</Text>
        <Text style={ui.title}>{'Ambalajın\nkaydını bul.'}</Text>
        <Text style={ui.body}>
          Barkod, sunucun üzerinden Open Food Facts'e gönderilir. Fotoğraf ve sağlık profili
          gönderilmez. Topluluk verileri eksik veya eski olabilir; elindeki ambalajı kontrol et.
        </Text>
        <Button
          label={camera ? 'Barkod kamerasını kapat' : 'Barkod kamerasını aç'}
          secondary
          onPress={() => {
            if (camera) {
              setCamera(false);
              return;
            }
            if (permission?.granted) setCamera(true);
            else
              void requestPermission()
                .then((result) => {
                  if (result.granted) setCamera(true);
                  else setError('Kamera izni verilmedi. Barkodu elle girebilirsin.');
                })
                .catch(() => setError('Kamera açılamadı. Barkodu elle girebilirsin.'));
          }}
        />
        {camera && (
          <CameraView
            style={{ height: 220 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a'] }}
            onMountError={() => {
              setCamera(false);
              setError('Kamera açılamadı. Barkodu elle girebilirsin.');
            }}
            onBarcodeScanned={({ data }) => {
              if (validGtin(data)) {
                setCode(data);
                setCamera(false);
                setProduct(null);
                setError('');
              }
            }}
          />
        )}
        <Text style={ui.strong}>Barkod numarası</Text>
        <TextInput
          accessibilityLabel="Barkod numarası"
          style={ui.input}
          keyboardType="number-pad"
          maxLength={14}
          value={code}
          onChangeText={(value) => {
            setCode(value.replace(/\D/g, ''));
            setProduct(null);
          }}
          editable={!busy}
        />
        <Button
          label={busy ? 'Katalogda aranıyor' : 'Barkodu katalogda ara'}
          disabled={busy}
          onPress={() => {
            void lookup();
          }}
        />
        {error && <Notice>{error}</Notice>}
        {product && (
          <>
            <Text style={ui.h2}>{product.name}</Text>
            <Text style={ui.small}>
              {product.brands} · {product.code}
            </Text>
            <Text style={ui.body}>
              {product.ingredientsText || 'Katalogda içerik metni bulunmuyor.'}
            </Text>
            <Text style={ui.small}>
              Kaynak güncellemesi:{' '}
              {product.updatedAt
                ? new Date(product.updatedAt * 1000).toLocaleDateString('tr-TR')
                : 'Bilinmiyor'}
              . Bu metin elindeki ambalajdan okunmadı.
            </Text>
            <Button
              label="Bu ürünü öğün günlüğüne ekle"
              secondary
              onPress={() => onDiary(product.name)}
            />
          </>
        )}
        <Button label="Etiket fotoğrafıyla devam et" onPress={onLabel} />
        <Text
          accessibilityRole="link"
          style={ui.small}
          onPress={() => {
            void Linking.openURL('https://world.openfoodfacts.org').catch(() =>
              setError('Kaynak bağlantısı açılamadı.'),
            );
          }}
        >
          Kaynak: Open Food Facts · Veritabanı ODbL lisansı
        </Text>
      </ScrollView>
    </View>
  );
}
