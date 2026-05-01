import { centsToAmount } from '@/src/lib/ledger/money';
import { useLedgerStore } from '@/src/store/useLedgerStore';

export function useFinance() {
  const transactions = useLedgerStore((state) => state.transactions);
  const isHydrated = useLedgerStore((state) => state.isHydrated);

  let safeToSpendCents = 0;
  let taxHostageCents = 0;
  let pendingCapitalCents = 0;
  let totalBleedCents = 0;

  for (const tx of transactions) {
    if (tx.status === 'CANCELLED') {
      continue;
    }

    if (tx.type === 'INCOME') {
      if (tx.status === 'PENDING') {
        pendingCapitalCents += tx.amount;
        continue;
      }

      safeToSpendCents += tx.amount;
      const taxAmount = Math.trunc((tx.amount * tx.tax_rate) / 10000);
      taxHostageCents += taxAmount;
      safeToSpendCents -= taxAmount;
      continue;
    }

    if (tx.type === 'EXPENSE' || tx.type === 'SUBSCRIPTION') {
      totalBleedCents += tx.amount;
      safeToSpendCents -= tx.amount;
      continue;
    }

    if (tx.type === 'TAX_PAYMENT') {
      taxHostageCents -= tx.amount;
    }
  }

  const visibleTransactions: {
    _id: string;
    amount: number;
    category: string;
    note?: string;
    type: 'IN' | 'OUT';
    status?: 'PENDING' | 'CLEARED';
  }[] = transactions
    .filter((tx) => tx.status !== 'CANCELLED')
    .slice(0, 10)
    .map((tx) => ({
      _id: tx.id,
      amount: centsToAmount(tx.amount),
      category:
        tx.category ??
        (tx.type === 'SUBSCRIPTION'
          ? 'Subscription'
          : tx.type === 'INCOME'
            ? 'Income'
            : tx.type === 'TAX_PAYMENT'
              ? 'Tax Payment'
              : 'Expense'),
      note: tx.note ?? undefined,
      type: tx.type === 'INCOME' ? 'IN' : 'OUT',
      status: tx.status === 'PENDING' ? 'PENDING' : 'CLEARED',
    }));

  return {
    safeToSpend: centsToAmount(safeToSpendCents),
    taxHostage: centsToAmount(Math.max(0, taxHostageCents)),
    pendingCapital: centsToAmount(pendingCapitalCents),
    totalBleed: centsToAmount(totalBleedCents),
    recentTransactions: visibleTransactions,
    isLoading: !isHydrated,
  };
}
