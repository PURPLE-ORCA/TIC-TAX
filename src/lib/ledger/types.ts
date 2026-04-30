export type LedgerTransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'TAX_PAYMENT'
  | 'SUBSCRIPTION';

export type LedgerTransactionStatus =
  | 'PENDING'
  | 'CLEARED'
  | 'ACTIVE'
  | 'CANCELLED';

export type LedgerTransactionRow = {
  id: string;
  type: LedgerTransactionType;
  amount: number;
  status: LedgerTransactionStatus;
  category: string | null;
  note: string | null;
  tax_rate: number;
  is_synced: number;
  sync_attempts: number;
  last_error: string | null;
  created_at: number;
  updated_at: number;
};
