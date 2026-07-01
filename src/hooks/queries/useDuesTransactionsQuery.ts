import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/dues';
import { useClubId } from '@/stores';
import type {
  DuesTransaction,
  DuesTransactionApiItem,
  DuesTransactionCounts,
  DuesTransactionDetailResponse,
  DuesTransactionsResponse,
} from '@/types/dues';

const DUES_TRANSACTIONS_PAGE_SIZE = 20;

function mapApiTransactionToDuesTransaction(transaction: DuesTransactionApiItem): DuesTransaction {
  return {
    id: transaction.transactionId,
    type: getDuesTransactionType(transaction),
    title: transaction.title,
    description: transaction.source ?? getTransactionFallbackDescription(transaction.type),
    amount: transaction.amount,
    date: transaction.transactedAt.split('T')[0] ?? transaction.transactedAt,
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
    date: transaction.transactedAt.split('T')[0] ?? transaction.transactedAt,
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

  return '';
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

function useDuesTransactions(cardinal?: number) {
  const clubId = useClubId();

  return useInfiniteQuery({
    queryKey: ['dues', 'transactions', clubId, cardinal],
    queryFn: async ({ pageParam }) => {
      const response = await duesApi.getTransactions(clubId!, cardinal!, {
        filter: 'ALL',
        sort: 'LATEST',
        page: pageParam,
        size: DUES_TRANSACTIONS_PAGE_SIZE,
      });

      return response.data.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.transactions.hasNext ? lastPage.transactions.pageNumber + 1 : undefined,
    select: (data) => {
      const firstPage = data.pages[0];
      const summaryTransaction = createDuesSummaryTransaction(firstPage?.duesSummary ?? null);
      const transactions = data.pages.flatMap((page) =>
        page.transactions.content.map(mapApiTransactionToDuesTransaction),
      );

      return {
        counts: firstPage?.counts ?? DEFAULT_DUES_TRANSACTION_COUNTS,
        transactions: summaryTransaction ? [summaryTransaction, ...transactions] : transactions,
      };
    },
    enabled: !!clubId && typeof cardinal === 'number',
  });
}

function useDuesTransactionDetail(cardinal?: number, transactionId?: number) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['dues', 'transaction-detail', clubId, cardinal, transactionId],
    queryFn: async () => {
      const response = await duesApi.getTransactionDetail(clubId!, cardinal!, transactionId!);

      return mapApiTransactionDetailToDuesTransaction(response.data.data);
    },
    enabled:
      !!clubId &&
      typeof cardinal === 'number' &&
      typeof transactionId === 'number' &&
      transactionId > 0,
  });
}

const DEFAULT_DUES_TRANSACTION_COUNTS = {
  all: 0,
  expense: 0,
  income: 0,
  dues: 0,
} satisfies DuesTransactionCounts;

export { useDuesTransactionDetail, useDuesTransactions };
