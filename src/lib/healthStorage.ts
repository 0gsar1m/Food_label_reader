import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { bytesToHex, hexToBytes } from '@noble/ciphers/utils.js';
import { sealVault, openVault } from '../../shared/vaultCrypto';
import type { HealthVault } from '../../shared/profile';
function names(owner: string) {
  if (!/^(guest|[0-9]{1,64})$/.test(owner)) throw new Error('Invalid storage owner.');
  const suffix = owner === 'guest' ? '' : `.${owner}`;
  return { dataKey: `etiket.health.v1${suffix}`, keyName: `etiket.health-key.v1${suffix}` };
}
async function key(create: boolean, keyName: string): Promise<Uint8Array | null> {
  const saved =
    Platform.OS === 'web'
      ? sessionStorage.getItem(keyName)
      : await SecureStore.getItemAsync(keyName);
  if (saved) return hexToBytes(saved);
  if (!create) return null;
  const generated = Crypto.getRandomBytes(32);
  if (Platform.OS === 'web') sessionStorage.setItem(keyName, bytesToHex(generated));
  else
    await SecureStore.setItemAsync(keyName, bytesToHex(generated), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  return generated;
}
/** Native encrypted persistence; web demo health data is restricted to the current tab session. */
export async function loadHealth(owner = 'guest'): Promise<HealthVault | null> {
  const { dataKey, keyName } = names(owner);
  const raw =
    Platform.OS === 'web' ? sessionStorage.getItem(dataKey) : await AsyncStorage.getItem(dataKey);
  if (!raw) return null;
  const secret = await key(false, keyName);
  if (!secret) throw new Error('Sağlık verisinin şifreleme anahtarı okunamadı.');
  return openVault(raw, secret);
}
/** Fresh random GCM nonce on every serialized write, without any server synchronization. */
export async function saveHealth(value: HealthVault, owner = 'guest'): Promise<void> {
  const { dataKey, keyName } = names(owner);
  const secret = await key(true, keyName);
  if (!secret) throw new Error('Anahtar oluşturulamadı.');
  const raw = sealVault(value, secret, Crypto.getRandomBytes(12));
  if (Platform.OS === 'web') sessionStorage.setItem(dataKey, raw);
  else await AsyncStorage.setItem(dataKey, raw);
}
/** Removes ciphertext before key material; caller must serialize this with pending writes. */
export async function deleteHealth(owner = 'guest'): Promise<void> {
  const { dataKey, keyName } = names(owner);
  if (Platform.OS === 'web') {
    sessionStorage.removeItem(dataKey);
    sessionStorage.removeItem(keyName);
  } else {
    await AsyncStorage.removeItem(dataKey);
    await SecureStore.deleteItemAsync(keyName);
  }
}
