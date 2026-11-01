import { useEffect, useRef, useState } from 'react';
import { Button, Notice } from './Controls';
type GoogleIdentity = {
  initialize: (config: {
    client_id: string;
    callback: (data: { credential: string }) => void;
    auto_select: boolean;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: { theme: string; size: string; locale: string; text: string },
  ) => void;
  disableAutoSelect: () => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}
/** Official GIS button; only a public OAuth client ID is embedded, with no Gmail API permissions. */
export function GoogleLogin({
  onCredential,
}: {
  onCredential: (idToken: string) => Promise<void>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  callback.current = onCredential;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  useEffect(() => {
    if (!clientId) return;
    let active = true;
    function render(): void {
      if (!active || !host.current || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId!,
        auto_select: false,
        callback: (data) => {
          if (!active || busy) return;
          setBusy(true);
          void callback
            .current(data.credential)
            .catch(() => {
              if (active) setError('Google hesabı sunucuda doğrulanamadı.');
            })
            .finally(() => {
              if (active) setBusy(false);
            });
        },
      });
      window.google.accounts.id.renderButton(host.current, {
        theme: 'outline',
        size: 'large',
        locale: 'tr',
        text: 'continue_with',
      });
    }
    const existing = document.getElementById('google-identity-sdk');
    if (window.google) render();
    else if (existing) existing.addEventListener('load', render);
    else {
      const script = document.createElement('script');
      script.id = 'google-identity-sdk';
      script.src = 'https://accounts.google.com/gsi/client?hl=tr';
      script.async = true;
      script.onload = render;
      script.onerror = () => {
        if (active) setError('Google giriş hizmeti yüklenemedi.');
      };
      document.head.appendChild(script);
    }
    return () => {
      active = false;
      existing?.removeEventListener('load', render);
    };
  }, [clientId, busy]);
  return (
    <>
      <div ref={host} style={{ minHeight: clientId ? 48 : 0 }} />
      {!clientId && (
        <Button
          label="Google ile devam et"
          secondary
          onPress={() =>
            setError('Google OAuth istemci kimliği yapılandırılmamış. Hesapsız deneyebilirsin.')
          }
        />
      )}
      {error ? <Notice>{error}</Notice> : null}
    </>
  );
}
