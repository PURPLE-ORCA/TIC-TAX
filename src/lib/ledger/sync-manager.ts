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
let shouldRunAgain = false;

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
    if (forceFull || !hasCompletedFullPull) {
      await setCompletedFullPullPreference(true);
      await setLastPullTimestampPreference(since);
    }
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

    if (updatedAt > maxTimestamp) {
      maxTimestamp = updatedAt;
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

      if (updatedAt > existingLocal.updated_at) {
        await upsertTransaction({
          id: clientUuid,
          type: remoteRow.type,
          amount,
          status,
          category: remoteRow.category ?? existingLocal.category,
          note: remoteRow.note ?? existingLocal.note,
          tax_rate: taxRate,
          is_synced: 1,
          sync_attempts: 0,
          last_error: null,
          created_at: createdAt,
          updated_at: updatedAt,
        });
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
    shouldRunAgain = true;
    if (__DEV__) {
      console.log('[sync] flush:queue already syncing');
    }
    return;
  }

  isSyncing = true;
  try {
    do {
      shouldRunAgain = false;
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected || netInfo.isInternetReachable === false) {
        return;
      }

      if (__DEV__) {
        console.log('[sync] flush:start');
      }
      const pending = await getPendingSyncTransactions();

      if (__DEV__) {
        console.log('[sync] flush:pending', { count: pending.length });
      }

      for (const row of pending) {
        try {
          await syncTransaction(row);
          if (__DEV__) {
            console.log('[sync] push:ok', { id: row.id });
          }
        } catch (error) {
          const permanent = isPermanentSyncError(error);
          const message = error instanceof Error ? error.message : String(error);
          if (__DEV__) {
            console.error('[sync] push:error', { id: row.id, permanent, message });
          }
          await markTransactionSyncFailure(row.id, message, permanent);
        }
      }

      await pullFromConvex();
      if (__DEV__) {
        console.log('[sync] pull:ok');
      }
    } while (shouldRunAgain);
  } finally {
    isSyncing = false;
    await useLedgerStore.getState().refreshFromDb();
    if (__DEV__) {
      console.log('[sync] flush:done');
    }
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
