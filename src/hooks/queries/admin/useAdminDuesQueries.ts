import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/adminDues';
import type {
  DuesTransaction,
  TransactionCounts,
  TransactionItem,
  TransactionsParams,
} from '@/types/admin/dues';

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

/**
 * 회비 거래내역 상세 조회 훅.
 *
 * 목록에는 없는 메모·영수증 파일 정보까지 담긴 단건 상세를 조회한다.
 * 상세 모달이 열릴 때만 호출되도록 `enabled`로 게이팅한다.
 */
export function useAdminDuesTransactionQuery(
  clubId: string,
  accountId: number,
  transactionId: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: adminQueryKeys.duesTransaction(clubId, accountId, transactionId),
    queryFn: (): Promise<TransactionItem> =>
      duesApi
        .getTransaction(clubId, accountId, transactionId as number)
        .then((res) => res.data.data),
    enabled: enabled && !!clubId && accountId > 0 && transactionId !== null,
    staleTime: 5 * 60 * 1000,
  });
}
