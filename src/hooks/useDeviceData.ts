import { useEffect, useState } from 'react';
import { loadApiUrl, saveApiUrl } from '../lib/storage';
import { validateApiUrl } from '../../shared/connection';
import { loadAccessToken, saveAccessToken } from '../lib/api';

/** Serialized writes preserve rapid edits; hydration completes before interaction. */
export function useDeviceData() {
  const [ready, setReady] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:8787');
  const [token, setToken] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    async function restore(): Promise<void> {
      const [endpoint, secret] = await Promise.allSettled([loadApiUrl(), loadAccessToken()]);
      if (!active) return;
      if (endpoint.status === 'fulfilled') setApiUrl(endpoint.value);
      if (secret.status === 'fulfilled') setToken(secret.value);
      if ([endpoint, secret].some((result) => result.status === 'rejected'))
        setNotice('Bazı cihaz kayıtları okunamadı. Diğer kayıtlarla devam edebilirsin.');
      setReady(true);
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);
  async function updateConnection(url: string, secret: string): Promise<void> {
    const validated = validateApiUrl(url);
    if (secret && secret.length < 24)
      throw new Error('Sunucu erişim anahtarı en az 24 karakter olmalı.');
    await saveAccessToken(secret);
    setToken(secret);
    await saveApiUrl(validated);
    setApiUrl(validated);
  }
  return {
    ready,
    apiUrl,
    token,
    notice,
    setNotice,
    updateConnection,
  };
}
