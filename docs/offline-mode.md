# Offline Mode (SQLite-First Ledger)

> TIC-TAX transactions run local-first on SQLite, then sync bidirectionally with Convex.

## Why this exists

Freelancer ledger must work with weak/no network. Local writes cannot block on API. Cloud eventually converges.

---

## Scope

| Area | Status |
|---|---|
| Transactions | Offline-first (SQLite source of truth) |
| Sync | Push + Pull (foreground + connectivity restore) |
| Deletes | Soft delete via `status = CANCELLED` |
| Currency | Integer cents only |
| Subscriptions | Convex-first (not migrated yet) |

---

## Non-Negotiable Rules

1. **No float math for money.** `10.00 MAD -> 1000` cents.
2. **UUID v4 at creation time.** Used as SQLite PK and Convex idempotency key (`clientUuid`).
3. **SQLite is read source.** UI does not read transactions directly from Convex.
4. **Soft delete only.** Cancel by status; do not hard-delete transaction rows.

---

## Data Model

### Local SQLite (`transactions`)

```sql
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
```

### Convex (`transactions`)

Required fields:

- `clientUuid: string`
- `type: 'INCOME' | 'EXPENSE' | 'TAX_PAYMENT' | 'SUBSCRIPTION'`
- `amount: number` (cents)
- `status: 'PENDING' | 'CLEARED' | 'ACTIVE' | 'CANCELLED'`
- `category?: string`
- `note?: string`
- `taxAmount?: number`
- `taxCleared?: boolean`
- `timestamp?: number`
- `taxRate: number`
- `createdAt: number`
- `updatedAt: number`

Indexes:

- `by_clientUuid`
- `by_createdAt`
- `by_updatedAt`

---

## Runtime Architecture

## Boot Sequence (must stay in this order)

1. Initialize SQLite schema.
2. Attempt cloud pull bootstrap.
3. Hydrate Zustand from SQLite.
4. Start sync listeners (`AppState`, `NetInfo`).

File: `src/app/_layout.tsx`

## Write Path (Optimistic)

1. Generate UUID.
2. Update Zustand optimistically for immediate UI feedback.
3. Insert row into SQLite with `is_synced = 0` and await the commit.
4. Roll back the optimistic row if SQLite fails.
5. Trigger sync loop only after SQLite commit succeeds.

Key files:

- `src/store/useLedgerStore.ts`
- `src/lib/ledger/repository.ts`

## Sync Path (Bidirectional)

Triggers:

- App enters foreground.
- Network restored.

### Push phase

- Query local pending rows: `is_synced = 0`.
- Send to Convex `transactions.addTransaction` (idempotent via `clientUuid`).
- Sync status via `transactions.updateTransactionStatus`.
- Success -> mark local `is_synced = 1`.
- Failure -> increment `sync_attempts`.
- Permanent validation failure -> set `last_error`.
- Category and note metadata are pushed with every transaction payload.
- Sync trigger is ignored while offline; SQLite keeps rows pending until network restores.
- If a flush is already active, a rerun is queued instead of dropping the request.

### Pull phase

- Bootstrap pull runs with `since = 0` (full pull) to repair/seed local metadata.
- After bootstrap, read `lastPullTimestamp` from SecureStore.
- Query Convex by `updatedAt`: `transactions.listTransactionsSince({ since, limit })`.
- Skip pending unsynced local rows to avoid stomping optimistic writes.
- Existing local rows are metadata-repaired from cloud (`category`/`note`) when local values are generic or missing.
- Existing local rows are replaced when the remote row has newer `updatedAt`.
- Upsert new rows into SQLite with `is_synced = 1`.
- Update `lastPullTimestamp`.

Key files:

- `src/lib/ledger/sync-manager.ts`
- `src/lib/storage/preferences.ts`

---

## Cloud Migration Policy

Legacy Convex rows must be migrated server-side. Client should not carry permanent legacy mapping logic.

Migration function:

- `convex/migrations.ts:migrateTransactionsToV120`

Transforms:

- `IN -> INCOME`
- `OUT -> EXPENSE`
- float `amount` -> integer cents
- fill missing `clientUuid`, `createdAt`, `updatedAt`, `taxRate`, `status`
- preserve and backfill presentation metadata (`category`, `note`)

Run in batches until complete:

```bash
bunx convex run migrations:migrateTransactionsToV120 '{"limit":500}'
```

Metadata backfill (safe, non-destructive):

```bash
bunx convex run migrations:backfillTransactionMetadata '{"limit":500}'
```

---

## Operational Checklist

## Verify online cold boot

- App opens with existing data (seeded from Convex pull into SQLite).

## Verify offline cold boot

- App opens with prior local data.

## Verify offline write then reconnect

- Create transaction offline.
- Reconnect.
- Row syncs to Convex.
- Second device receives on next pull cycle.

## Verify soft delete propagation

- Cancel transaction on device A.
- Device B reflects `CANCELLED` row exclusion after pull.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| UI shows 0 with network available | Local DB not seeded yet | Check boot order + pull execution in `sync-manager.ts` |
| Convex duplicate rows | Missing/incorrect `clientUuid` | Ensure UUID generated once at create and reused |
| Data mismatch across devices | Pull cursor stale or pull failing | Check SecureStore cursor + Convex `listTransactionsSince` |
| Pending rows never clear | Push mutation failing | Inspect `last_error`, `sync_attempts`, Convex logs |

---

## Files Map

- `src/lib/ledger/sqlite.ts` - DB init + schema
- `src/lib/ledger/repository.ts` - SQL CRUD/sync operations
- `src/store/useLedgerStore.ts` - optimistic local transaction state
- `src/components/hooks/useFinance.ts` - local read model
- `src/lib/ledger/sync-manager.ts` - push/pull orchestration
- `src/lib/storage/preferences.ts` - pull cursor persistence
- `convex/transactions.ts` - idempotent cloud mutations/queries
- `convex/migrations.ts` - one-time legacy data migration
- `convex/schema.ts` - strict transaction schema
