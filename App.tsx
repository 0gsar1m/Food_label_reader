import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { Newsreader_400Regular } from '@expo-google-fonts/newsreader/400Regular';
import { Home } from './src/screens/Home';
import { Camera } from './src/screens/Camera';
import { Review } from './src/screens/Review';
import { Result } from './src/screens/Result';
import { History } from './src/screens/History';
import { Settings } from './src/screens/Settings';
import { Legal } from './src/screens/Legal';
import { Navigation } from './src/components/Navigation';
import { ConfirmDialog } from './src/components/ConfirmDialog';
import { IconButton } from './src/components/Controls';
import { useDeviceData } from './src/hooks/useDeviceData';
import { pickPhoto, type PreparedPhoto } from './src/lib/photo';
import { requestAnalysis, ScanError } from './src/lib/api';
import { makeDemoVault } from './shared/demoScenario';
import { demoAnalysis } from './src/data/demo';
import type { ScanRecord } from './shared/analysis';
import { theme, ui } from './src/theme';
import { copy } from './src/content';
import { useLibrary } from './src/hooks/useLibrary';
import { useAccount } from './src/hooks/useAccount';
import { AccountScreen } from './src/screens/Account';
import { useHealth } from './src/hooks/useHealth';
import { ProfileScreen } from './src/screens/Profile';
import { DiaryScreen } from './src/screens/Diary';
import { Insights } from './src/screens/Insights';
import { Restaurant } from './src/screens/Restaurant';
import { FoodPhoto } from './src/screens/FoodPhoto';
import { Barcode } from './src/screens/Barcode';
import { outcomeOf } from './shared/observations';
import type { DiaryEntry } from './shared/profile';
import { Button, Notice } from './src/components/Controls';

type Screen =
  | {
      kind:
        | 'home'
        | 'history'
        | 'settings'
        | 'camera'
        | 'privacy'
        | 'terms'
        | 'profile'
        | 'account'
        | 'insights'
        | 'restaurant'
        | 'food-photo'
        | 'barcode';
    }
  | { kind: 'diary'; meal?: string; seed?: Partial<DiaryEntry> }
  | { kind: 'review'; photo: PreparedPhoto }
  | { kind: 'result'; record: ScanRecord; scenario?: boolean };

/** Native entry point loads bundled Turkish-capable fonts and never embeds service secrets. */
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Newsreader_400Regular,
  });
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={ui.page} edges={['top', 'bottom']}>
        {fontsLoaded || fontError ? (
          <Application />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <ActivityIndicator color={theme.color.green} />
            <Text>Nazif açılıyor.</Text>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Application() {
  const connection = useDeviceData();
  const account = useAccount(connection.apiUrl);
  const library = useLibrary(account.session?.user.id ?? 'guest', connection.setNotice);
  const device = { ...connection, ...library, ready: connection.ready && library.ready };
  const health = useHealth(account.session?.user.id ?? 'guest');
  const effectiveToken = account.session?.token ?? device.token;
  const [nutritionPhoto, setNutritionPhoto] = useState<PreparedPhoto | null>(null);
  const [stack, setStack] = useState<Screen[]>([{ kind: 'home' }]);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [scanError, setScanError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const inFlight = useRef<AbortController | null>(null);
  const screen = stack[stack.length - 1] ?? { kind: 'home' };
  const push = (next: Screen): void => {
    setScanError('');
    setStack((past) => [...past, next]);
  };
  const reset = (kind: 'home' | 'history' | 'settings' | 'insights'): void => {
    inFlight.current?.abort();
    setBusy(false);
    setScanError('');
    setStack([{ kind }]);
  };
  const back = useCallback((): void => {
    inFlight.current?.abort();
    setBusy(false);
    setScanError('');
    setStack((past) => (past.length > 1 ? past.slice(0, -1) : [{ kind: 'home' }]));
  }, []);
  useEffect(() => () => inFlight.current?.abort(), []);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (confirmClear) {
        setConfirmClear(false);
        return true;
      }
      if (screen.kind === 'home') return false;
      back();
      return true;
    });
    return () => subscription.remove();
  }, [screen.kind, back, confirmClear]);
  async function gallery(): Promise<void> {
    if (preparing) return;
    setNutritionPhoto(null);
    setPreparing(true);
    try {
      const photo = await pickPhoto();
      if (photo) push({ kind: 'review', photo });
    } catch (error) {
      device.setNotice(
        error instanceof Error ? error.message : 'Fotoğraf açılamadı. Başka bir görsel seç.',
      );
    } finally {
      setPreparing(false);
    }
  }
  async function scan(photo: PreparedPhoto): Promise<void> {
    if (inFlight.current) return;
    const controller = new AbortController();
    inFlight.current = controller;
    setBusy(true);
    setScanError('');
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 40_000);
    try {
      const analysis = await requestAnalysis(
        device.apiUrl,
        photo.base64,
        effectiveToken,
        controller.signal,
        nutritionPhoto?.base64,
      );
      if (controller.signal.aborted) return;
      const record: ScanRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        createdAt: new Date().toISOString(),
        demo: false,
        analysis,
      };
      if (analysis.readability !== 'unreadable') device.addRecord(record);
      setStack((past) => [
        ...past.filter((item) => item.kind !== 'review' && item.kind !== 'camera'),
        { kind: 'result', record },
      ]);
    } catch (error) {
      if (timedOut) setScanError(copy.errors.TIMEOUT);
      else if (!controller.signal.aborted)
        setScanError(error instanceof ScanError ? error.message : copy.errors.UNKNOWN);
    } finally {
      clearTimeout(timeout);
      inFlight.current = null;
      setBusy(false);
    }
  }
  function cancel(): void {
    inFlight.current?.abort();
    setBusy(false);
    setScanError('Okuma iptal edildi. Fotoğrafı tekrar gönderebilirsin.');
  }
  const camera = (): void => push({ kind: 'camera' });
  const demo = (scenario = false): void =>
    push({
      kind: 'result',
      scenario,
      record: {
        id: 'example',
        createdAt: new Date().toISOString(),
        demo: true,
        analysis: demoAnalysis,
      },
    });
  const primary =
    screen.kind === 'home' ||
    screen.kind === 'history' ||
    screen.kind === 'settings' ||
    screen.kind === 'insights';
  if (!device.ready || !health.ready || !account.ready)
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color={theme.color.green} />
      </View>
    );
  const accountView = (
    <AccountScreen
      session={account.session}
      onCredential={async (token) => {
        await account.login(token);
        reset('home');
      }}
      onGuest={() => {
        account.continueGuest();
        reset('home');
      }}
      onLogout={async () => {
        await account.logout();
        reset('home');
      }}
      onBack={() => reset('home')}
    />
  );
  if (!account.session && !account.guest) return accountView;
  const profileView = (
    <ProfileScreen
      initial={health.vault.profile}
      apiUrl={device.apiUrl}
      token={effectiveToken}
      onBack={() => reset('home')}
      onSave={async (profile) => {
        await health.update((old) => ({ ...old, profile }));
        reset('home');
      }}
      onErase={health.clear}
      exportData={() => JSON.stringify(health.vault, null, 2)}
    />
  );
  if (health.error)
    return (
      <View style={ui.content}>
        <Notice>{health.error}</Notice>
        <Button
          label="Şifreli veriyi sil ve yeniden başla"
          onPress={() => {
            void health.clear().catch(() => device.setNotice('Veri silinemedi.'));
          }}
        />
      </View>
    );
  if (!health.vault.profile.completed) return profileView;
  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        maxWidth: 540,
        alignSelf: 'center',
        borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
        borderRightWidth: Platform.OS === 'web' ? 1 : 0,
        borderColor: theme.color.line,
      }}
    >
      {device.notice ? (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[ui.row, { backgroundColor: theme.color.warningBg, paddingLeft: 16 }]}
        >
          <Text style={[ui.small, { flex: 1, color: theme.color.warning }]}>{device.notice}</Text>
          <IconButton label="Bildirimi kapat" icon="close" onPress={() => device.setNotice('')} />
        </View>
      ) : null}
      {preparing && (
        <View accessibilityLiveRegion="polite" style={[ui.row, { padding: 16 }]}>
          <ActivityIndicator color={theme.color.green} />
          <Text style={ui.small}>Fotoğraf hazırlanıyor.</Text>
        </View>
      )}
      {screen.kind === 'home' && (
        <Home
          onAccount={() => push({ kind: 'account' })}
          onProfile={() => push({ kind: 'profile' })}
          onDiary={() => push({ kind: 'diary' })}
          onInsights={() => push({ kind: 'insights' })}
          onRestaurant={() => push({ kind: 'restaurant' })}
          onFoodPhoto={() => push({ kind: 'food-photo' })}
          onBarcode={() => push({ kind: 'barcode' })}
          pending={
            health.vault.diary.filter((entry) => !entry.demo && outcomeOf(entry) === 'pending')
              .length
          }
          onCamera={camera}
          onGallery={() => {
            void gallery();
          }}
          onDemo={() => demo()}
          onScenario={() => demo(true)}
          recent={device.records[0]}
          onRecent={(record) => push({ kind: 'result', record })}
        />
      )}
      {screen.kind === 'history' && (
        <History
          records={device.records}
          onOpen={(record) => push({ kind: 'result', record })}
          onDelete={device.deleteRecord}
          onClear={() => setConfirmClear(true)}
          onScan={camera}
        />
      )}
      {screen.kind === 'settings' && (
        <Settings
          onAccount={() => push({ kind: 'account' })}
          onProfile={() => push({ kind: 'profile' })}
          onDiary={() => push({ kind: 'diary' })}
          preferences={device.preferences}
          onPreferences={device.updatePreferences}
          apiUrl={device.apiUrl}
          token={device.token}
          onConnection={device.updateConnection}
          onLegal={(kind) => push({ kind })}
        />
      )}
      {screen.kind === 'camera' && (
        <Camera
          onBack={back}
          onPhoto={(photo) => setStack((past) => [...past.slice(0, -1), { kind: 'review', photo }])}
          onGallery={() => {
            void gallery();
          }}
        />
      )}
      {screen.kind === 'review' && (
        <Review
          nutritionPhoto={nutritionPhoto}
          onNutrition={() => {
            void pickPhoto()
              .then((photo) => {
                if (photo) setNutritionPhoto(photo);
              })
              .catch(() => device.setNotice('Besin tablosu fotoğrafı açılamadı.'));
          }}
          onRemoveNutrition={() => setNutritionPhoto(null)}
          photo={screen.photo}
          busy={busy}
          error={scanError}
          onBack={back}
          onScan={() => {
            void scan(screen.photo);
          }}
          onCancel={cancel}
          onRetake={() => setStack((past) => [...past.slice(0, -1), { kind: 'camera' }])}
          onPrivacy={() => push({ kind: 'privacy' })}
        />
      )}
      {screen.kind === 'result' && (
        <Result
          key={screen.record.id}
          vault={screen.scenario ? makeDemoVault() : health.vault}
          scenario={screen.scenario}
          onUpdateDiary={(entry) =>
            health.update((old) => ({
              ...old,
              diary: old.diary.map((item) => (item.id === entry.id ? entry : item)),
            }))
          }
          apiUrl={device.apiUrl}
          token={effectiveToken}
          onProfile={() => push({ kind: 'profile' })}
          onDiary={() =>
            push({
              kind: 'diary',
              meal: screen.record.analysis.productName ?? '',
              seed: {
                scanId: screen.record.id,
                ingredients: screen.record.analysis.ingredients.map((item) => item.name),
                outcome: 'pending',
                demo: screen.record.demo,
              },
            })
          }
          record={screen.record}
          preferences={device.preferences}
          onBack={back}
          onScan={() => setStack([{ kind: 'home' }, { kind: 'camera' }])}
        />
      )}
      {screen.kind === 'account' && accountView}
      {screen.kind === 'profile' && profileView}
      {screen.kind === 'barcode' && (
        <Barcode
          apiUrl={device.apiUrl}
          token={effectiveToken}
          onBack={back}
          onLabel={camera}
          onDiary={(meal) => push({ kind: 'diary', meal, seed: { outcome: 'pending' } })}
        />
      )}
      {screen.kind === 'insights' && (
        <Insights vault={health.vault} onBack={back} onDiary={() => push({ kind: 'diary' })} />
      )}
      {screen.kind === 'restaurant' && (
        <Restaurant
          allergens={device.preferences}
          avoided={health.vault.profile.avoidedFoods ?? []}
          onBack={back}
          onSettings={() => push({ kind: 'settings' })}
          onProfile={() => push({ kind: 'profile' })}
          onMenu={() => push({ kind: 'food-photo' })}
        />
      )}
      {screen.kind === 'food-photo' && (
        <FoodPhoto
          apiUrl={device.apiUrl}
          token={effectiveToken}
          avoided={health.vault.profile.avoidedFoods ?? []}
          onBack={back}
          onDiary={(meal, seed) => push({ kind: 'diary', meal, seed })}
        />
      )}
      {screen.kind === 'diary' && (
        <DiaryScreen
          meal={screen.meal}
          seed={screen.seed}
          entries={health.vault.diary}
          onBack={back}
          onSave={(entry) =>
            health.update((old) => ({
              ...old,
              diary: [entry, ...old.diary.filter((d) => d.id !== entry.id)].slice(0, 100),
            }))
          }
          onDelete={(id) =>
            health.update((old) => ({ ...old, diary: old.diary.filter((d) => d.id !== id) }))
          }
        />
      )}
      {(screen.kind === 'privacy' || screen.kind === 'terms') && (
        <Legal kind={screen.kind} onBack={back} />
      )}
      {primary && (
        <Navigation
          active={screen.kind as 'home' | 'history' | 'settings' | 'insights'}
          onChange={reset}
        />
      )}
      <ConfirmDialog
        visible={confirmClear}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          device.clearHistory();
          setConfirmClear(false);
        }}
      />
    </View>
  );
}
