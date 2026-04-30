import NetInfo from '@react-native-community/netinfo';
import { api } from '@/convex/_generated/api';
import { convexClient } from '@/src/lib/convex/client';
import {
  getPendingSyncTransactions,
  markTransactionSynced,
  markTransactionSyncFailure,
} from '@/src/lib/ledger/repository';
import { registerLedgerSyncTrigger, useLedgerStore } from '@/src/store/useLedgerStore';
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

async function syncTransaction(id: string): Promise<void> {
  const row = useLedgerStore.getState().transactions.find((tx) => tx.id === id);
  if (!row) {
    return;
  }

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

export async function flushLedgerSync(): Promise<void> {
  if (isSyncing) {
    return;
  }

  isSyncing = true;
  try {
    const pending = await getPendingSyncTransactions();

    for (const row of pending) {
      try {
        await syncTransaction(row.id);
      } catch (error) {
        const permanent = isPermanentSyncError(error);
        const message = error instanceof Error ? error.message : String(error);
        await markTransactionSyncFailure(row.id, message, permanent);
      }
    }
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
