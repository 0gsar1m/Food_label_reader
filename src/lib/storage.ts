import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { z } from 'zod';
import {
  recordSchema,
  preferencesSchema,
  validateAnalysis,
  type ScanRecord,
  type AllergenId,
} from '../../shared/analysis';
import { validateApiUrl } from '../../shared/connection';
import { demoWeekOwner, demoWeekScanId, makeDemoWeek } from '../../shared/demoWeek';
import { demoAnalysis } from '../data/demo';

const keys = {
  history: 'etiket.history.v1',
  preferences: 'etiket.preferences.v1',
  url: 'etiket.api-url.v1',
};

function scoped(key: string, owner: string): string {
  if (owner !== demoWeekOwner && !/^(guest|[0-9]{1,64})$/.test(owner))
    throw new Error('Invalid library owner.');
  return owner === 'guest' ? key : `${key}.${owner}`;
}

/** Restores only validated text records; one corrupted entry does not erase good entries. */
export async function loadHistory(owner = 'guest'): Promise<ScanRecord[]> {
  const raw = await AsyncStorage.getItem(scoped(keys.history, owner));
  if (!raw) {
    if (owner !== demoWeekOwner) return [];
    const sample = makeDemoWeek().diary.find((entry) => entry.scanId === demoWeekScanId);
    return sample
      ? [{ id: demoWeekScanId, createdAt: sample.at, demo: true, analysis: demoAnalysis }]
      : [];
  }
  const values: unknown = JSON.parse(raw);
  if (!Array.isArray(values)) throw new Error('Invalid history.');
  return values
    .flatMap((value: unknown) => {
      const entry = recordSchema.safeParse(value);
      if (!entry.success) return [];
      try {
        validateAnalysis(entry.data.analysis);
        return [entry.data];
      } catch {
        return [];
      }
    })
    .slice(0, 50);
}

/** Saves a bounded history without photo URIs/base64 or access tokens. */
export async function saveHistory(records: ScanRecord[], owner = 'guest'): Promise<void> {
  await AsyncStorage.setItem(
    scoped(keys.history, owner),
    JSON.stringify(z.array(recordSchema).max(50).parse(records.slice(0, 50))),
  );
}

/** Preferences are optional and independent from the history's lifecycle. */
export async function loadPreferences(owner = 'guest'): Promise<AllergenId[]> {
  const raw = await AsyncStorage.getItem(scoped(keys.preferences, owner));
  return raw ? preferencesSchema.parse(JSON.parse(raw)) : [];
}

/** Only stable allergen identifiers are stored, without medical profile metadata. */
export async function savePreferences(preferences: AllergenId[], owner = 'guest'): Promise<void> {
  await AsyncStorage.setItem(
    scoped(keys.preferences, owner),
    JSON.stringify(preferencesSchema.parse(preferences)),
  );
}

/** Restores a non-secret endpoint; defaults are supplied by the build environment. */
export async function loadApiUrl(): Promise<string> {
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  const fallback = __DEV__ && devHost ? `http://${devHost}:8787` : 'http://localhost:8787';
  return (await AsyncStorage.getItem(keys.url)) ?? process.env.EXPO_PUBLIC_API_URL ?? fallback;
}

/** Validates before persisting so malformed endpoints never enter the request path. */
export async function saveApiUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(keys.url, validateApiUrl(url));
}
