import type {
  DuesTransaction,
  DuesTransactionApiItem,
  DuesTransactionCounts,
  DuesTransactionDetailResponse,
  DuesTransactionType,
  DuesTransactionsResponse,
} from '@/types/dues';

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

function mapApiTransactionToDuesTransaction(transaction: DuesTransactionApiItem): DuesTransaction {
  return {
    id: transaction.transactionId,
    type: getDuesTransactionType(transaction),
    title: transaction.title,
    description: transaction.source ?? getTransactionFallbackDescription(transaction.type),
    amount: transaction.amount,
    date: transaction.transactedAt.split('T')[0],
    counterparty: transaction.source ?? undefined,
    category: getTransactionFallbackDescription(transaction.type),
  };
}

function mapApiTransactionDetailToDuesTransaction(
  transaction: DuesTransactionDetailResponse,
): DuesTransaction {
  return {
    id: transaction.transactionId,
    type: getDuesTransactionType(transaction),
    title: transaction.title,
    description:
      transaction.source ?? transaction.memo ?? getTransactionFallbackDescription(transaction.type),
    amount: transaction.amount,
    date: transaction.transactedAt.split('T')[0],
    counterparty: transaction.source ?? undefined,
    category: transaction.category ?? getTransactionFallbackDescription(transaction.type),
    registrant: transaction.registeredByName ?? undefined,
    receiptUrls: transaction.receipts.map((receipt) => receipt.fileUrl),
    receiptThumbnailUrl: transaction.receipts[0]?.fileUrl,
  };
}

function getDuesTransactionType(
  transaction: Pick<DuesTransactionApiItem, 'type' | 'direction'>,
): DuesTransaction['type'] {
  if (transaction.type === 'DUES') return 'dues';

  return transaction.direction === 'INCOME' ? 'income' : 'expense';
}

function getTransactionFallbackDescription(type: string) {
  if (type === 'CARRY_OVER') return '이월';

  return '기타';
}

function createDuesSummaryTransaction(
  duesSummary: DuesTransactionsResponse['duesSummary'],
): DuesTransaction | null {
  if (!duesSummary) return null;

  return {
    id: -1,
    type: 'dues',
    title: duesSummary.label,
    description: duesSummary.description,
    amount: duesSummary.totalAmount,
    date: '',
  };
}

function sortDuesTransactions(transactions: DuesTransaction[]) {
  return [...transactions].sort((a, b) => {
    if (a.id === -1) return -1;
    if (b.id === -1) return 1;

    if (a.type === 'dues' && b.type !== 'dues') return -1;
    if (a.type !== 'dues' && b.type === 'dues') return 1;

    const dateCompare = compareDateDesc(a.date, b.date);
    if (dateCompare !== 0) return dateCompare;

    return b.id - a.id;
  });
}

function compareDateDesc(aDate: string, bDate: string) {
  return getDateSortValue(bDate) - getDateSortValue(aDate);
}

function getDateSortValue(dateStr: string) {
  const [year = 0, month = 0, day = 0] = dateStr.split('-').map(Number);
  return year * 10000 + month * 100 + day;
}

function getTransactionCounts(transactions: DuesTransaction[]) {
  return {
    all: transactions.length,
    expense: transactions.filter((transaction) => transaction.type === 'expense').length,
    income: transactions.filter((transaction) => transaction.type === 'income').length,
    dues: transactions.filter((transaction) => transaction.type === 'dues').length,
  } satisfies Record<DuesTransactionFilter, number>;
}

function mergeTransactionCounts(
  fallbackCounts: ReturnType<typeof getTransactionCounts>,
  counts?: DuesTransactionCounts,
) {
  return counts ?? fallbackCounts;
}

function getReceiptUrls(transaction: DuesTransaction) {
  const receiptUrls =
    transaction.receiptUrls ?? (transaction.receiptUrl ? [transaction.receiptUrl] : []);

  return receiptUrls.filter(Boolean);
}

export {
  DUES_TRANSACTION_FILTERS,
  DUES_TRANSACTION_TYPE_CONFIG,
  createDuesSummaryTransaction,
  getReceiptUrls,
  getTransactionCounts,
  mapApiTransactionDetailToDuesTransaction,
  mapApiTransactionToDuesTransaction,
  mergeTransactionCounts,
  sortDuesTransactions,
  type DuesTransactionFilter,
};
