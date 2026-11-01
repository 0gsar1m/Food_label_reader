import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { z } from 'zod';
import { foodContextSchema, validateFoodContext, type FoodContext } from '../../shared/foodContext';
import { validateApiUrl } from '../../shared/connection';
import type { DiaryEntry } from '../../shared/profile';
import { pickPhoto, type PreparedPhoto } from '../lib/photo';
import { Button, Notice, ScreenHeader } from '../components/Controls';
import { Choice } from './Profile';
import { Camera } from './Camera';
import { copy } from '../content';
import { ScanError } from '../lib/api';
import { ui, theme } from '../theme';

/** Plate/menu mode is independent of label evidence and requires a deliberate photo transfer. */
export function FoodPhoto({
  apiUrl,
  token,
  avoided,
  onBack,
  onDiary,
}: {
  apiUrl: string;
  token: string;
  avoided: string[];
  onBack: () => void;
  onDiary: (meal: string, seed: Partial<DiaryEntry>) => void;
}) {
  const [mode, setMode] = useState<'menu' | 'meal'>('menu');
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [result, setResult] = useState<FoodContext | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const inFlight = useRef<AbortController | null>(null);
  useEffect(() => () => inFlight.current?.abort(), []);
  async function gallery(): Promise<void> {
    setPreparing(true);
    setError('');
    try {
      const value = await pickPhoto();
      if (value) {
        setPhoto(value);
        setResult(null);
        setSelected([]);
        setCamera(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fotoğraf açılamadı.');
    } finally {
      setPreparing(false);
    }
  }
  async function scan(): Promise<void> {
    if (!photo || inFlight.current) return;
    const controller = new AbortController();
    inFlight.current = controller;
    setBusy(true);
    setError('');
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 40_000);
    try {
      const response = await fetch(`${validateApiUrl(apiUrl)}/api/food-context`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ image: photo.base64, mimeType: 'image/jpeg', mode }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const value = z.object({ error: z.string() }).safeParse(payload);
        throw new ScanError(
          value.success && Object.hasOwn(copy.errors, value.data.error)
            ? (value.data.error as keyof typeof copy.errors)
            : 'UNKNOWN',
        );
      }
      const parsed = z.object({ result: foodContextSchema }).parse(payload);
      if (!controller.signal.aborted) {
        setResult(validateFoodContext(parsed.result, mode));
        setSelected([]);
      }
    } catch (e) {
      if (timedOut) setError(copy.errors.TIMEOUT);
      else if (!controller.signal.aborted)
        setError(
          e instanceof ScanError
            ? e.message
            : 'Fotoğraf incelemesi alınamadı. Bağlantıyı ve görseli kontrol et.',
        );
    } finally {
      clearTimeout(timer);
      inFlight.current = null;
      setBusy(false);
    }
  }
  if (camera)
    return (
      <Camera
        onBack={() => setCamera(false)}
        onGallery={() => {
          void gallery();
        }}
        onPhoto={(value) => {
          setPhoto(value);
          setCamera(false);
          setResult(null);
          setSelected([]);
        }}
      />
    );
  return (
    <View style={ui.page}>
      <ScreenHeader title="Menü ve tabak" onBack={onBack} />
      <ScrollView contentContainerStyle={ui.content}>
        <Text style={ui.eyebrow}>DIŞARIDA VE EVDE</Text>
        <Text style={ui.title}>{'Önce gör,\nsonra sor.'}</Text>
        <Text style={ui.body}>
          Menüde yazanı veya tabakta görüneni incele. Sos, pişirme yağı ve çapraz temas fotoğraftan
          doğrulanamaz. Kalori ya da gizli içerik tahmini yapılmaz.
        </Text>
        {!busy && (
          <>
            <Choice
              label="Menü fotoğrafı"
              checked={mode === 'menu'}
              onPress={() => {
                setMode('menu');
                setResult(null);
                setSelected([]);
              }}
            />
            <Choice
              label="Tabak fotoğrafı"
              checked={mode === 'meal'}
              onPress={() => {
                setMode('meal');
                setResult(null);
                setSelected([]);
              }}
            />
            <Button
              label="Menü veya tabağı fotoğrafla"
              disabled={preparing}
              onPress={() => setCamera(true)}
            />
            <Button
              label="Menü veya tabak için galeriden seç"
              disabled={preparing}
              secondary
              onPress={() => {
                void gallery();
              }}
            />
          </>
        )}
        {photo && (
          <Image
            source={{ uri: photo.uri }}
            accessibilityLabel="Menü veya tabak önizlemesi"
            resizeMode="contain"
            style={{ width: '100%', height: 230, backgroundColor: theme.color.pale }}
          />
        )}
        {photo && !result && (
          <>
            <Text style={ui.small}>{copy.photoConsent}</Text>
            <Button
              label={busy ? 'Fotoğraf inceleniyor' : 'Fotoğrafı gönder ve incele'}
              disabled={busy || preparing}
              onPress={() => {
                void scan();
              }}
            />
          </>
        )}
        {busy && (
          <>
            <ActivityIndicator color={theme.color.green} />
            <Button
              label="İncelemeyi iptal et"
              secondary
              onPress={() => inFlight.current?.abort()}
            />
          </>
        )}
        {error && <Notice>{error}</Notice>}
        {result && (
          <>
            <Text style={ui.h2}>{result.title}</Text>
            <Notice>
              Bu inceleme tam içerik listesi, alerjen yokluğu veya tüketim güvenliği kararı vermez.
            </Notice>
            {result.items.map((item, index) => (
              <View key={index} style={{ gap: 8 }}>
                <Text style={ui.strong}>{item.name}</Text>
                <Text style={ui.small}>
                  {item.basis === 'printed' ? 'Menüde yazan' : 'Görünüşe dayalı, teyit gerekli'}:{' '}
                  {item.evidence}
                </Text>
                {avoided.some((value) =>
                  item.name.toLocaleLowerCase('tr-TR').includes(value.toLocaleLowerCase('tr-TR')),
                ) && (
                  <Notice>
                    Kaçınma listendeki bir ifadeyle metin eşleşmesi var. Mutfaktan içeriği teyit et.
                  </Notice>
                )}
                <Choice
                  label={`${item.name} tükettiğimi teyit ediyorum`}
                  checked={selected.includes(item.name)}
                  onPress={() =>
                    setSelected((old) =>
                      old.includes(item.name)
                        ? old.filter((value) => value !== item.name)
                        : [...old, item.name],
                    )
                  }
                />
              </View>
            ))}
            <Text style={ui.h2}>Mutfağa sor</Text>
            {result.questions.map((question, index) => (
              <Text key={index} style={ui.body}>
                {question}
              </Text>
            ))}
            {result.uncertainties.map((text, index) => (
              <Text key={index} style={ui.small}>
                {text}
              </Text>
            ))}
            <Text style={ui.small}>
              Menüde bir yemek adını seçmek, o yemeğin bütün bileşenlerini doğrulamaz. Günlükte
              bileşenleri ayrıca düzenleyebilirsin.
            </Text>
            <Button
              label="Teyit ettiğim öğünü günlüğe ekle"
              disabled={!selected.length}
              onPress={() =>
                onDiary(selected.join(', ').slice(0, 600), {
                  outcome: 'pending',
                  ingredients: mode === 'meal' ? selected : [],
                  demo: false,
                })
              }
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
