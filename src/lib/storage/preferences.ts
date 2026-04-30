import * as SecureStore from 'expo-secure-store';

const LAST_PULL_TIMESTAMP_KEY = 'ledger.lastPullTimestamp';

export async function getLastPullTimestampPreference(): Promise<number> {
  const raw = await SecureStore.getItemAsync(LAST_PULL_TIMESTAMP_KEY);
  if (!raw) {
    return 0;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function setLastPullTimestampPreference(value: number): Promise<void> {
  await SecureStore.setItemAsync(LAST_PULL_TIMESTAMP_KEY, String(value));
}
