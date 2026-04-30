import NetInfo from '@react-native-community/netinfo';
import { api } from '@/convex/_generated/api';
import { convexClient } from '@/src/lib/convex/client';
import {
  getPendingSyncTransactions,
  markTransactionSynced,
  markTransactionSyncFailure,
  selectPendingSyncTransactionIds,
  upsertTransaction,
  updateTransactionPresentation,
} from '@/src/lib/ledger/repository';
import {
  hasCompletedFullPullPreference,
  getLastPullTimestampPreference,
  setCompletedFullPullPreference,
  setLastPullTimestampPreference,
} from '@/src/lib/storage/preferences';
import { registerLedgerSyncTrigger, useLedgerStore } from '@/src/store/useLedgerStore';
import type { LedgerTransactionRow } from '@/src/lib/ledger/types';
import { AppState } from 'react-native';

let isSyncing = false;
let isInitialized = false;

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
    category: row.category ?? undefined,
    note: row.note ?? undefined,
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

export async function pullFromConvex(forceFull = false): Promise<void> {
  const hasCompletedFullPull = await hasCompletedFullPullPreference();
  const since = forceFull || !hasCompletedFullPull ? 0 : await getLastPullTimestampPreference();
  const remoteRows = await convexClient.query(api.transactions.listTransactionsSince, {
    since,
    limit: 500,
  });

  if (remoteRows.length === 0) {
    return;
  }

  const pendingLocalIds = await selectPendingSyncTransactionIds();
  const localRows = useLedgerStore.getState().transactions;
  const localById = new Map(localRows.map((row) => [row.id, row]));
  let maxTimestamp = since;

  for (const remoteRow of remoteRows) {
    const clientUuid = remoteRow.clientUuid;
    const createdAt = remoteRow.createdAt;
    const taxRate = remoteRow.taxRate ?? 100;
    const status = remoteRow.status ?? 'CLEARED';
    const amount = remoteRow.amount ?? 0;

    if (!clientUuid || createdAt == null) {
      continue;
    }

    const updatedAt = remoteRow.updatedAt ?? createdAt;

    if (createdAt > maxTimestamp) {
      maxTimestamp = createdAt;
    }

    if (pendingLocalIds.has(clientUuid)) {
      continue;
    }

    const existingLocal = localById.get(clientUuid);
    if (existingLocal) {
      const shouldPatchCategory =
        !!remoteRow.category &&
        (!existingLocal.category ||
          existingLocal.category === 'Ledger' ||
          existingLocal.category === 'Expense' ||
          existingLocal.category === 'Income');
      const shouldPatchNote = !!remoteRow.note && !existingLocal.note;

      if (shouldPatchCategory || shouldPatchNote) {
        await updateTransactionPresentation(
          clientUuid,
          shouldPatchCategory ? (remoteRow.category ?? null) : null,
          shouldPatchNote ? (remoteRow.note ?? null) : null,
        );
      }
      continue;
    }

    await upsertTransaction({
      id: clientUuid,
      type: remoteRow.type,
      amount,
      status,
      category: remoteRow.category ?? null,
      note: remoteRow.note ?? null,
      tax_rate: taxRate,
      is_synced: 1,
      sync_attempts: 0,
      last_error: null,
      created_at: createdAt,
      updated_at: updatedAt,
    });
  }

  if (forceFull || !hasCompletedFullPull) {
    await setCompletedFullPullPreference(true);
  }

  await setLastPullTimestampPreference(maxTimestamp);
}

export async function bootstrapLedgerFromConvex(): Promise<void> {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || netInfo.isInternetReachable === false) {
      return;
    }

    await pullFromConvex(true);
  } catch (error) {
    console.error('Bootstrap pull failed:', error);
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
