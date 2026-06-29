import type { DuesTransaction, DuesTransactionType } from '@/types/dues';

type DuesTransactionFilter = 'all' | DuesTransactionType;

const DUES_TRANSACTION_FILTERS: Array<{ key: DuesTransactionFilter; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'expense', label: '지출' },
  { key: 'income', label: '수입' },
  { key: 'dues', label: '회비' },
];

const DUES_TRANSACTION_TYPE_CONFIG = {
  expense: {
    label: '지출',
    chipClassName: 'bg-state-error/10 text-state-error',
    sign: '-',
  },
  income: {
    label: '수입',
    chipClassName: 'bg-state-success/10 text-state-success',
    sign: '+',
  },
  dues: {
    label: '회비',
    chipClassName: 'bg-text-alternative/5 text-text-alternative',
    sign: '+',
  },
} satisfies Record<DuesTransactionType, { label: string; chipClassName: string; sign: '+' | '-' }>;

function sortDuesTransactions(transactions: DuesTransaction[]) {
  return [...transactions].sort((a, b) => {
    if (a.type === 'dues' && b.type !== 'dues') return -1;
    if (a.type !== 'dues' && b.type === 'dues') return 1;
    return 0;
  });
}

function getTransactionCounts(transactions: DuesTransaction[]) {
  return {
    all: transactions.length,
    expense: transactions.filter((transaction) => transaction.type === 'expense').length,
    income: transactions.filter((transaction) => transaction.type === 'income').length,
    dues: transactions.filter((transaction) => transaction.type === 'dues').length,
  } satisfies Record<DuesTransactionFilter, number>;
}

function getReceiptUrls(transaction: DuesTransaction) {
  const receiptUrls =
    transaction.receiptUrls ?? (transaction.receiptUrl ? [transaction.receiptUrl] : []);

  return receiptUrls.filter(Boolean);
}

export {
  DUES_TRANSACTION_FILTERS,
  DUES_TRANSACTION_TYPE_CONFIG,
  getReceiptUrls,
  getTransactionCounts,
  sortDuesTransactions,
  type DuesTransactionFilter,
};
