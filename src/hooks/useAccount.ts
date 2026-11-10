import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { sessionSchema, type AuthSession } from '../../shared/auth';
import { validateApiUrl } from '../../shared/connection';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';
const key = 'etiket.account.v1';
async function persist(session: AuthSession | null): Promise<void> {
  if (Platform.OS === 'web') {
    if (session) sessionStorage.setItem(key, JSON.stringify(session));
    else sessionStorage.removeItem(key);
  } else if (session) await SecureStore.setItemAsync(key, JSON.stringify(session));
  else await SecureStore.deleteItemAsync(key);
}
/** Application tokens are origin-bound so changing API settings cannot forward an existing session. */
export function useAccount(origin: string) {
  const [stored, setStored] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [guest, setGuest] = useState(
    () => Platform.OS === 'web' && sessionStorage.getItem('etiket.guest') === 'true',
  );
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const raw =
          Platform.OS === 'web' ? sessionStorage.getItem(key) : await SecureStore.getItemAsync(key);
        if (raw) {
          const value = sessionSchema.parse(JSON.parse(raw));
          if (Date.parse(value.expiresAt) > Date.now() && active) setStored(value);
        }
      } catch {
        /* A broken session requires a fresh sign-in, never a fabricated identity. */
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const session =
    stored?.origin === origin && Date.parse(stored.expiresAt) > Date.now() ? stored : null;
  async function login(idToken: string): Promise<void> {
    const response = await fetchWithTimeout(
      `${validateApiUrl(origin)}/api/auth/google`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      },
      15000,
    );
    if (!response.ok) throw new Error('Google kimliği doğrulanamadı.');
    const value = sessionSchema.parse({
      ...(await response.json()),
      origin: validateApiUrl(origin),
    });
    await persist(value);
    setStored(value);
    setGuest(false);
    if (Platform.OS === 'web') sessionStorage.removeItem('etiket.guest');
  }
  async function logout(): Promise<void> {
    await persist(null);
    setStored(null);
    setGuest(false);
    if (Platform.OS === 'web') sessionStorage.removeItem('etiket.guest');
    if (Platform.OS === 'web') window.google?.accounts.id.disableAutoSelect();
  }
  return {
    session,
    ready,
    guest,
    login,
    logout,
    continueGuest: () => {
      setGuest(true);
      if (Platform.OS === 'web') sessionStorage.setItem('etiket.guest', 'true');
    },
  };
}
