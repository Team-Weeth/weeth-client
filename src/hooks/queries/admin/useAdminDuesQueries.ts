import { useQuery } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/adminDues';
import type { DuesTransaction } from '@/types/admin/dues';

import { adminQueryKeys } from './adminQueryKeys';

export function useAdminDuesTransactionsQuery(clubId: string, accountId: number) {
  return useQuery({
    queryKey: adminQueryKeys.duesTransactions(clubId, accountId),
    queryFn: () => duesApi.getTransactions(clubId, accountId).then((res) => res.data.data),
    enabled: !!clubId && accountId > 0,
    staleTime: 5 * 60 * 1000,
    // API 응답(TransactionsInfo)을 테이블이 쓰는 DuesTransaction[] 형태로 변환
    select: (data): DuesTransaction[] =>
      data.transactions.content.map((tx) => ({
        id: tx.transactionId,
        type: tx.type,
        direction: tx.direction,
        content: tx.title,
        counterparty: tx.source,
        amount: tx.amount,
        // TODO: 서버가 러닝 밸런스(총 잔액)를 내려주지 않아 0으로 채움 — 백엔드 필드 추가 필요
        totalBalance: 0,
        date: tx.transactedAt.slice(0, 10),
        hasReceipt: tx.hasReceipt > 0,
        receiptUrl: tx.receipts[0]?.fileUrl,
      })),
  });
}
