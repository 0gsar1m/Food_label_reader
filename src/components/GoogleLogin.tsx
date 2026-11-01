import { useState } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Button, Notice } from './Controls';
/** Native Credential Manager / iOS Google SDK is loaded only after an explicit login action. */
export function GoogleLogin({
  onCredential,
}: {
  onCredential: (idToken: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function login(): Promise<void> {
    setError('');
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!clientId) {
      setError(
        'Google girişini etkinleştirmek için OAuth istemci kimliği yapılandırılmalı. Hesapsız deneyebilirsin.',
      );
      return;
    }
    if (Constants.appOwnership === 'expo') {
      setError(
        'Google ile giriş geliştirme veya APK derlemesi gerektirir. Expo Go içinde hesapsız devam edebilirsin.',
      );
      return;
    }
    setBusy(true);
    try {
      const google = await import('react-native-nitro-google-signin');
      google.GoogleOneTapSignIn.configure({
        webClientId: clientId,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        scopes: ['email', 'profile'],
      });
      if (Platform.OS === 'android') await google.GoogleOneTapSignIn.checkPlayServices();
      let response = await google.GoogleOneTapSignIn.signIn();
      if (google.isNoSavedCredentialFoundResponse(response))
        response = await google.GoogleOneTapSignIn.createAccount();
      if (google.isSuccessResponse(response)) await onCredential(response.data.idToken);
      else setError('Google girişi tamamlanmadı. Tekrar deneyebilirsin.');
    } catch {
      setError('Google girişi tamamlanamadı. OAuth ayarlarını ve ağ bağlantını kontrol et.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Button
        label={busy ? 'Google hesabı doğrulanıyor' : 'Google ile devam et'}
        secondary
        disabled={busy}
        onPress={() => {
          void login();
        }}
      />
      {error ? <Notice>{error}</Notice> : null}
    </>
  );
}
