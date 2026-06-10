import * as SecureStore from "expo-secure-store";

const LAST_PULL_TIMESTAMP_KEY = "ledger.lastPullTimestamp";
const FULL_PULL_DONE_KEY = "ledger.fullPullDone";

export async function getLastPullTimestampPreference(): Promise<number> {
  const raw = await SecureStore.getItemAsync(LAST_PULL_TIMESTAMP_KEY);
  if (!raw) {
    return 0;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function setLastPullTimestampPreference(
  value: number,
): Promise<void> {
  await SecureStore.setItemAsync(LAST_PULL_TIMESTAMP_KEY, String(value));
}

export async function hasCompletedFullPullPreference(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(FULL_PULL_DONE_KEY);
  return raw === "1";
}

export async function setCompletedFullPullPreference(
  value: boolean,
): Promise<void> {
  await SecureStore.setItemAsync(FULL_PULL_DONE_KEY, value ? "1" : "0");
}
