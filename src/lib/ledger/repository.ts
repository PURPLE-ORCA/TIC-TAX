import { getLedgerDatabase } from "@/src/lib/ledger/sqlite";
import type { LedgerTransactionRow } from "@/src/lib/ledger/types";

function mapRow(row: Record<string, unknown>): LedgerTransactionRow {
  return {
    id: String(row.id),
    type: row.type as LedgerTransactionRow["type"],
    amount: Number(row.amount),
    status: row.status as LedgerTransactionRow["status"],
    category: row.category ? String(row.category) : null,
    note: row.note ? String(row.note) : null,
    tax_rate: Number(row.tax_rate),
    is_synced: Number(row.is_synced),
    sync_attempts: Number(row.sync_attempts),
    last_error: row.last_error ? String(row.last_error) : null,
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
  };
}

export async function selectAllTransactions(): Promise<LedgerTransactionRow[]> {
  const db = getLedgerDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM transactions ORDER BY created_at DESC",
  );
  return rows.map(mapRow);
}

export async function insertTransaction(
  row: LedgerTransactionRow,
): Promise<void> {
  const db = getLedgerDatabase();
  if (__DEV__) {
    console.log("[ledger-repo] insert:start", {
      id: row.id,
      amount: row.amount,
      type: row.type,
      status: row.status,
    });
  }
  await db.runAsync(
    `INSERT INTO transactions (
      id, type, amount, status, category, note, tax_rate, is_synced, sync_attempts, last_error, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.type,
      row.amount,
      row.status,
      row.category,
      row.note,
      row.tax_rate,
      row.is_synced,
      row.sync_attempts,
      row.last_error,
      row.created_at,
      row.updated_at,
    ],
  );
  if (__DEV__) {
    console.log("[ledger-repo] insert:ok", { id: row.id });
  }
}

export async function upsertTransaction(
  row: LedgerTransactionRow,
): Promise<void> {
  const db = getLedgerDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO transactions (
      id, type, amount, status, category, note, tax_rate, is_synced, sync_attempts, last_error, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.type,
      row.amount,
      row.status,
      row.category,
      row.note,
      row.tax_rate,
      row.is_synced,
      row.sync_attempts,
      row.last_error,
      row.created_at,
      row.updated_at,
    ],
  );
}

export async function selectAllTransactionIds(): Promise<Set<string>> {
  const db = getLedgerDatabase();
  const rows = await db.getAllAsync<{ id: string }>(
    "SELECT id FROM transactions",
  );
  return new Set(rows.map((row) => row.id));
}

export async function selectPendingSyncTransactionIds(): Promise<Set<string>> {
  const db = getLedgerDatabase();
  const rows = await db.getAllAsync<{ id: string }>(
    "SELECT id FROM transactions WHERE is_synced = 0",
  );
  return new Set(rows.map((row) => row.id));
}

export async function updateTransactionPresentation(
  id: string,
  category: string | null,
  note: string | null,
): Promise<void> {
  const db = getLedgerDatabase();
  await db.runAsync(
    `UPDATE transactions
     SET category = COALESCE(?, category),
         note = COALESCE(?, note)
     WHERE id = ?`,
    [category, note, id],
  );
}

export async function updateTransactionStatus(
  id: string,
  status: LedgerTransactionRow["status"],
  updatedAt: number,
): Promise<void> {
  const db = getLedgerDatabase();
  await db.runAsync(
    `UPDATE transactions
     SET status = ?, updated_at = ?, is_synced = 0, sync_attempts = 0, last_error = NULL
     WHERE id = ?`,
    [status, updatedAt, id],
  );
}

export async function getPendingSyncTransactions(): Promise<
  LedgerTransactionRow[]
> {
  const db = getLedgerDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM transactions WHERE is_synced = 0 ORDER BY created_at ASC",
  );
  return rows.map(mapRow);
}

export async function markTransactionSynced(id: string): Promise<void> {
  const db = getLedgerDatabase();
  await db.runAsync(
    "UPDATE transactions SET is_synced = 1, last_error = NULL WHERE id = ?",
    [id],
  );
}

export async function markTransactionSyncFailure(
  id: string,
  errorMessage: string,
  permanent: boolean,
): Promise<void> {
  const db = getLedgerDatabase();
  if (permanent) {
    await db.runAsync(
      `UPDATE transactions
       SET sync_attempts = sync_attempts + 1, last_error = ?
       WHERE id = ?`,
      [errorMessage, id],
    );
    return;
  }

  await db.runAsync(
    "UPDATE transactions SET sync_attempts = sync_attempts + 1 WHERE id = ?",
    [id],
  );
}
