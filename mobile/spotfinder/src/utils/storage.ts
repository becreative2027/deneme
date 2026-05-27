import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'sf_access_token';
const REFRESH_KEY = 'sf_refresh_token';

// SecureStore falls back to AsyncStorage on simulator / when keychain is unavailable
async function setItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return AsyncStorage.getItem(key);
  }
}

async function deleteItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
  await AsyncStorage.removeItem(key).catch(() => {});
}

export async function saveToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await deleteItem(TOKEN_KEY);
}

export async function saveRefreshToken(token: string): Promise<void> {
  await setItem(REFRESH_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_KEY);
}

export async function clearAll(): Promise<void> {
  await Promise.all([deleteItem(TOKEN_KEY), deleteItem(REFRESH_KEY)]);
}
