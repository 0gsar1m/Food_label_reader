import { useEffect, useRef, useState } from 'react';
import { emptyProfile, type HealthVault } from '../../shared/profile';
import { loadHealth, saveHealth, deleteHealth } from '../lib/healthStorage';
import { demoWeekOwner, makeDemoWeek } from '../../shared/demoWeek';
const blank = (): HealthVault => ({ version: 1, profile: { ...emptyProfile }, diary: [] });
/** Sensitive state is committed only after an authenticated encrypted write succeeds. */
export function useHealth(owner = 'guest') {
  const [vault, setVault] = useState<HealthVault>(blank);
  const [ready, setReady] = useState(false);
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null);
  const activeOwner = useRef(owner);
  activeOwner.current = owner;
  const [error, setError] = useState('');
  const current = useRef(vault);
  const queue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let active = true;
    setReady(false);
    setError('');
    current.current = blank();
    setVault(current.current);
    void queue.current
      .then(async () => {
        const stored = await loadHealth(owner);
        if (stored || owner !== demoWeekOwner) return stored;
        const example = makeDemoWeek();
        await saveHealth(example, owner);
        return example;
      })
      .then((value) => {
        if (active && value) {
          current.current = value;
          setVault(value);
        }
      })
      .catch(() => {
        if (active) setError('Şifreli sağlık verisi açılamadı. Mevcut veri üzerine yazılmadı.');
      })
      .finally(() => {
        if (active) {
          setLoadedOwner(owner);
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, [owner]);
  function update(transform: (previous: HealthVault) => HealthVault): Promise<void> {
    const next = transform(current.current);
    const task = queue.current.then(async () => {
      await saveHealth(next, owner);
      if (activeOwner.current === owner) {
        current.current = next;
        setVault(next);
        setError('');
      }
    });
    queue.current = task.catch(() => undefined);
    return task;
  }
  async function clear(): Promise<void> {
    const task = queue.current.then(async () => {
      await deleteHealth(owner);
      if (activeOwner.current === owner) {
        current.current = blank();
        setVault(current.current);
        setError('');
      }
    });
    queue.current = task.catch(() => undefined);
    return task;
  }
  return { vault, ready: ready && loadedOwner === owner, error, update, clear };
}
