import { useEffect, useRef, useState } from 'react';
import type { AllergenId, ScanRecord } from '../../shared/analysis';
import {
  loadApiUrl,
  loadHistory,
  loadPreferences,
  saveApiUrl,
  saveHistory,
  savePreferences,
} from '../lib/storage';
import { validateApiUrl } from '../../shared/connection';
import { loadAccessToken, saveAccessToken } from '../lib/api';

/** Serialized writes preserve rapid edits; hydration completes before interaction. */
export function useDeviceData() {
  const [ready, setReady] = useState(false);
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [preferences, setPreferences] = useState<AllergenId[]>([]);
  const [apiUrl, setApiUrl] = useState('http://localhost:8787');
  const [token, setToken] = useState('');
  const [notice, setNotice] = useState('');
  const history = useRef<ScanRecord[]>([]);
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    async function restore(): Promise<void> {
      const [past, selected, endpoint, secret] = await Promise.allSettled([
        loadHistory(),
        loadPreferences(),
        loadApiUrl(),
        loadAccessToken(),
      ]);
      if (!active) return;
      if (past.status === 'fulfilled') {
        history.current = past.value;
        setRecords(past.value);
      }
      if (selected.status === 'fulfilled') setPreferences(selected.value);
      if (endpoint.status === 'fulfilled') setApiUrl(endpoint.value);
      if (secret.status === 'fulfilled') setToken(secret.value);
      if ([past, selected, endpoint, secret].some((result) => result.status === 'rejected'))
        setNotice('Bazı cihaz kayıtları okunamadı. Diğer kayıtlarla devam edebilirsin.');
      setReady(true);
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);
  function updateHistory(next: ScanRecord[]): void {
    history.current = next.slice(0, 50);
    setRecords(history.current);
    const snapshot = history.current;
    queue.current = queue.current
      .then(() => saveHistory(snapshot))
      .catch(() =>
        setNotice(
          'Geçmiş cihaza kaydedilemedi. Bu oturumdaki sonuçları paylaşarak saklayabilirsin.',
        ),
      );
  }
  function updatePreferences(next: AllergenId[]): void {
    setPreferences(next);
    queue.current = queue.current
      .then(() => savePreferences(next))
      .catch(() => setNotice('Alerjen tercihleri cihaza kaydedilemedi.'));
  }
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
    records,
    preferences,
    apiUrl,
    token,
    notice,
    setNotice,
    updatePreferences,
    updateConnection,
    addRecord: (record: ScanRecord): void => updateHistory([record, ...history.current]),
    deleteRecord: (id: string): void =>
      updateHistory(history.current.filter((record) => record.id !== id)),
    clearHistory: (): void => updateHistory([]),
  };
}
