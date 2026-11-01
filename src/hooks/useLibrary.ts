import { useEffect, useRef, useState } from 'react';
import type { AllergenId, ScanRecord } from '../../shared/analysis';
import { loadHistory, loadPreferences, saveHistory, savePreferences } from '../lib/storage';

/** Account-scoped scan library never displays a previous account while the new one hydrates. */
export function useLibrary(owner: string, onError: (message: string) => void) {
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [preferences, setPreferences] = useState<AllergenId[]>([]);
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null);
  const history = useRef<ScanRecord[]>([]);
  const queue = useRef(Promise.resolve());
  const activeOwner = useRef(owner);
  activeOwner.current = owner;
  const report = useRef(onError);
  report.current = onError;
  useEffect(() => {
    let active = true;
    void queue.current.then(async () => {
      const [past, selected] = await Promise.allSettled([
        loadHistory(owner),
        loadPreferences(owner),
      ]);
      if (!active) return;
      history.current = past.status === 'fulfilled' ? past.value : [];
      setRecords(history.current);
      setPreferences(selected.status === 'fulfilled' ? selected.value : []);
      if (past.status === 'rejected' || selected.status === 'rejected')
        report.current('Bazı hesap kayıtları okunamadı.');
      setLoadedOwner(owner);
    });
    return () => {
      active = false;
    };
  }, [owner]);
  function updateHistory(next: ScanRecord[]): void {
    const snapshot = next.slice(0, 50);
    history.current = snapshot;
    setRecords(snapshot);
    queue.current = queue.current
      .then(() => saveHistory(snapshot, owner))
      .catch(() => {
        if (activeOwner.current === owner) report.current('Geçmiş kaydedilemedi.');
      });
  }
  function updatePreferences(next: AllergenId[]): void {
    setPreferences(next);
    queue.current = queue.current
      .then(() => savePreferences(next, owner))
      .catch(() => {
        if (activeOwner.current === owner) report.current('Tercihler kaydedilemedi.');
      });
  }
  return {
    ready: loadedOwner === owner,
    records,
    preferences,
    updatePreferences,
    addRecord: (r: ScanRecord) => updateHistory([r, ...history.current]),
    deleteRecord: (id: string) => updateHistory(history.current.filter((r) => r.id !== id)),
    clearHistory: () => updateHistory([]),
  };
}
