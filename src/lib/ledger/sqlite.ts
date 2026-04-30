import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('tic-tax-ledger.db');

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('INCOME', 'EXPENSE', 'TAX_PAYMENT', 'SUBSCRIPTION')),
  amount INTEGER,
  status TEXT CHECK(status IN ('PENDING', 'CLEARED', 'ACTIVE', 'CANCELLED')),
  category TEXT,
  note TEXT,
  tax_rate INTEGER DEFAULT 100,
  is_synced INTEGER DEFAULT 0,
  sync_attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sync ON transactions(is_synced, created_at);
`;

export async function initLedgerDatabase(): Promise<void> {
  await db.execAsync(SCHEMA_SQL);

  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(transactions);');
  const names = new Set(columns.map((column) => column.name));

  if (!names.has('category')) {
    await db.execAsync('ALTER TABLE transactions ADD COLUMN category TEXT;');
  }

  if (!names.has('note')) {
    await db.execAsync('ALTER TABLE transactions ADD COLUMN note TEXT;');
  }
}

export function getLedgerDatabase(): SQLite.SQLiteDatabase {
  return db;
}
