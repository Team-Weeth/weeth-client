import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/dues';
import { parseApiError } from '@/lib/error';
import { useClubId } from '@/stores';
import type { DuesTransactionCounts } from '@/types/dues';
import {
  createDuesSummaryTransaction,
  mapApiTransactionDetailToDuesTransaction,
  mapApiTransactionToDuesTransaction,
} from '@/utils/dues/duesTransaction';

const DUES_TRANSACTIONS_PAGE_SIZE = 20;
const DUES_PRIVATE_ERROR_CODE = 20114;

function shouldRetryDuesQuery(failureCount: number, error: unknown) {
  if (parseApiError(error)?.code === DUES_PRIVATE_ERROR_CODE) return false;

  return failureCount < 3;
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
    retry: shouldRetryDuesQuery,
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
    retry: shouldRetryDuesQuery,
  });
}

const DEFAULT_DUES_TRANSACTION_COUNTS = {
  all: 0,
  expense: 0,
  income: 0,
  dues: 0,
} satisfies DuesTransactionCounts;

export { useDuesTransactionDetail, useDuesTransactions };
