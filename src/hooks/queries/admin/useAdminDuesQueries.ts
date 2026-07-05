import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/adminDues';
import type { DuesTransaction, TransactionCounts, TransactionsParams } from '@/types/admin/dues';

import { adminQueryKeys } from './adminQueryKeys';

/** 테이블이 사용하는 거래내역 조회 결과 — 목록 + 필터별 건수 + 총 페이지 수 */
export interface DuesTransactionsResult {
  counts: TransactionCounts;
  totalPages: number;
  transactions: DuesTransaction[];
}

export function useAdminDuesTransactionsQuery(
  clubId: string,
  accountId: number,
  params?: TransactionsParams,
) {
  return useQuery({
    queryKey: adminQueryKeys.duesTransactions(clubId, accountId, params),
    queryFn: () => duesApi.getTransactions(clubId, accountId, params).then((res) => res.data.data),
    enabled: !!clubId && accountId > 0,
    staleTime: 5 * 60 * 1000,
    // 필터/정렬/페이지 전환 시 이전 데이터를 유지해 깜빡임 없이 부드럽게 전환
    placeholderData: keepPreviousData,
    // API 응답(TransactionsInfo)을 테이블이 쓰는 형태로 변환
    select: (data): DuesTransactionsResult => ({
      counts: data.counts,
      totalPages: data.transactions.totalPages,
      transactions: data.transactions.content.map((tx) => ({
        id: tx.transactionId,
        type: tx.type,
        direction: tx.direction,
        content: tx.title,
        counterparty: tx.source,
        amount: tx.amount,
        // TODO: 서버가 러닝 밸런스(총 잔액)를 내려주지 않아 0으로 채움 — 백엔드 필드 추가 필요
        totalBalance: 0,
        date: tx.transactedAt.slice(0, 10),
        hasReceipt: tx.hasReceipt,
        receiptUrl: tx.receipts[0]?.fileUrl,
      })),
    }),
  });
}
