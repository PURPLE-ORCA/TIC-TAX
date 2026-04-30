import NetInfo from '@react-native-community/netinfo';
import { api } from '@/convex/_generated/api';
import { convexClient } from '@/src/lib/convex/client';
import {
  getPendingSyncTransactions,
  markTransactionSynced,
  markTransactionSyncFailure,
  selectAllTransactionIds,
  upsertTransaction,
} from '@/src/lib/ledger/repository';
import { appPreferencesStorage } from '@/src/lib/storage/mmkv';
import { registerLedgerSyncTrigger, useLedgerStore } from '@/src/store/useLedgerStore';
import type { LedgerTransactionRow } from '@/src/lib/ledger/types';
import { AppState } from 'react-native';

let isSyncing = false;
let isInitialized = false;
const LAST_PULL_TIMESTAMP_KEY = 'ledger.lastPullTimestamp';

function isPermanentSyncError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('ArgumentValidationError') ||
    message.includes('ConvexError') ||
    message.includes('CheckConstraint')
  );
}

async function syncTransaction(row: LedgerTransactionRow): Promise<void> {
  await convexClient.mutation(api.transactions.addTransaction, {
    clientUuid: row.id,
    type: row.type,
    amount: row.amount,
    status: row.status,
    taxRate: row.tax_rate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  await convexClient.mutation(api.transactions.updateTransactionStatus, {
    clientUuid: row.id,
    status: row.status,
    updatedAt: row.updated_at,
  });

  await markTransactionSynced(row.id);
}

function getLastPullTimestamp(): number {
  const value = appPreferencesStorage.getNumber(LAST_PULL_TIMESTAMP_KEY);
  return typeof value === 'number' ? value : 0;
}

function setLastPullTimestamp(timestamp: number): void {
  appPreferencesStorage.set(LAST_PULL_TIMESTAMP_KEY, timestamp);
}

export async function pullFromConvex(): Promise<void> {
  const since = getLastPullTimestamp();
  const remoteRows = await convexClient.query(api.transactions.listTransactionsSince, {
    since,
    limit: 500,
  });

  if (remoteRows.length === 0) {
    return;
  }

  const localIds = await selectAllTransactionIds();
  let maxTimestamp = since;

  for (const remoteRow of remoteRows) {
    if (remoteRow.createdAt > maxTimestamp) {
      maxTimestamp = remoteRow.createdAt;
    }

    if (localIds.has(remoteRow.clientUuid)) {
      continue;
    }

    await upsertTransaction({
      id: remoteRow.clientUuid,
      type: remoteRow.type,
      amount: remoteRow.amount,
      status: remoteRow.status,
      tax_rate: remoteRow.taxRate,
      is_synced: 1,
      sync_attempts: 0,
      last_error: null,
      created_at: remoteRow.createdAt,
      updated_at: remoteRow.updatedAt,
    });
  }

  setLastPullTimestamp(maxTimestamp);
}

export async function bootstrapLedgerFromConvex(): Promise<void> {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || netInfo.isInternetReachable === false) {
      return;
    }

    await pullFromConvex();
  } catch {
    return;
  }
}

export async function flushLedgerSync(): Promise<void> {
  if (isSyncing) {
    return;
  }

  isSyncing = true;
  try {
    const pending = await getPendingSyncTransactions();

    for (const row of pending) {
      try {
        await syncTransaction(row);
      } catch (error) {
        const permanent = isPermanentSyncError(error);
        const message = error instanceof Error ? error.message : String(error);
        await markTransactionSyncFailure(row.id, message, permanent);
      }
    }

    await pullFromConvex();
  } finally {
    isSyncing = false;
    await useLedgerStore.getState().refreshFromDb();
  }
}

export function startLedgerSyncEngine(): void {
  if (isInitialized) {
    return;
  }

  isInitialized = true;
  registerLedgerSyncTrigger(() => {
    void flushLedgerSync();
  });

  const appStateSubscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      void flushLedgerSync();
    }
  });

  const netInfoSubscription = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      void flushLedgerSync();
    }
  });

  const cleanup = () => {
    appStateSubscription.remove();
    netInfoSubscription();
    isInitialized = false;
  };

  void cleanup;
}
