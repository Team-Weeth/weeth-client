import { useState } from 'react';

import { useAdminDuesTransactionsQuery } from '@/hooks/queries/admin/useAdminDuesQueries';
import type { TransactionFilter } from '@/types/admin/dues';

/** 거래내역 목록 페이지당 항목 수 */
const TRANSACTIONS_PAGE_SIZE = 10;

/**
 * 회비 거래내역 목록의 필터/정렬/페이지 상태관리 및 서버 조회 훅
 * 필터·정렬을 바꾸면 1페이지로 돌아감
 */
function useDuesTransactionList(clubId: string, accountId: number | null) {
  const [filter, setFilter] = useState<TransactionFilter>('ALL');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);

  const { data } = useAdminDuesTransactionsQuery(clubId, accountId ?? 0, {
    filter,
    sort: sortDesc ? 'LATEST' : 'OLDEST',
    page: page - 1,
    size: TRANSACTIONS_PAGE_SIZE,
  });

  const handleTabChange = (tab: TransactionFilter) => {
    setFilter(tab);
    setPage(1);
  };

  const handleSortToggle = () => {
    setSortDesc((prev) => !prev);
    setPage(1);
  };

  return {
    transactionsData: data,
    filter,
    sortDesc,
    page,
    setPage,
    handleTabChange,
    handleSortToggle,
  };
}

export { useDuesTransactionList };
