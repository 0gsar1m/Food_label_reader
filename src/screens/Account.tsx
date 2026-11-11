import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, ScreenHeader, Notice } from '../components/Controls';
import { GoogleLogin } from '../components/GoogleLogin';
import { DemoEntry } from '../components/DemoEntry';
import { ui } from '../theme';
import type { AuthSession } from '../../shared/auth';
/** One identity flow covers sign-up and sign-in; no password or mailbox access is collected. */
export function AccountScreen({
  session,
  onCredential,
  onGuest,
  onLogout,
  onBack,
  onDemo,
}: {
  session: AuthSession | null;
  onCredential: (token: string) => Promise<void>;
  onGuest: () => void;
  onLogout: () => Promise<void>;
  onBack?: () => void;
  onDemo?: () => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <View style={ui.page}>
      {onBack && <ScreenHeader title="Hesabım" onBack={onBack} />}
      <ScrollView contentContainerStyle={ui.content}>
        <Text style={ui.eyebrow}>ETİKET / HESABIN</Text>
        <Text style={ui.title}>
          {session ? 'Hesabına bağlısın.' : 'Seni tanıyarak başlayalım.'}
        </Text>
        {session ? (
          <>
            <Text style={ui.body}>{session.user.name || 'Google hesabı'}</Text>
            <Text style={ui.body}>{session.user.email}</Text>
            <Text style={ui.small}>
              Profil ve günlüğün bu hesaba ayrılmış cihaz deposunda kalır. Google girişi bulut
              senkronizasyonu sağlamaz. Oturum 24 saat sonra yenilenir.
            </Text>
            <Button
              label="Hesaptan çıkış yap"
              disabled={busy}
              secondary
              onPress={() => {
                setBusy(true);
                void onLogout()
                  .catch(() => setError('Oturum kapatılamadı. Yeniden dene.'))
                  .finally(() => setBusy(false));
              }}
            />
          </>
        ) : (
          <>
            <Text style={ui.body}>
              Gmail adresinle kullandığın Google hesabıyla kayıt olabilir veya giriş yapabilirsin.
              İlk giriş uygulama oturumunu oluşturur.
            </Text>
            <GoogleLogin onCredential={onCredential} />
            <Button label="Hesapsız dene" secondary onPress={onGuest} />
            <Text style={ui.small}>
              Yalnız temel kimlik bilgisi alınır. E-posta kutun okunmaz. Hesapsız profildeki
              kayıtlar yeni Google hesabına otomatik taşınmaz.
            </Text>
          </>
        )}
        {onDemo && <DemoEntry onPress={onDemo} />}
        {error ? <Notice>{error}</Notice> : null}
      </ScrollView>
    </View>
  );
}
