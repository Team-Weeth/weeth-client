import { useMutation, useQueryClient } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/adminDues';
import { uploadFile } from '@/lib/apis/upload';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';
import type { MutationCallbacks } from '@/types/common';
import type { TransactionBody, TransactionDirection } from '@/types/admin/dues';

const REQUIRE_ACCOUNT = 'accountId가 없습니다';

/** 거래내역 추가 뮤테이션 변수 — 폼 값 + 영수증 원본 파일 */
export interface CreateTransactionVars {
  type: TransactionDirection;
  amount: number;
  title: string;
  source: string;
  transactedAt: string;
  memo: string;
  receiptFile: File | null;
}

/**
 * 회비 거래내역(수입/지출) 추가 뮤테이션 훅.
 *
 * 영수증이 있으면 presigned URL 발급 → S3 업로드로 storageKey를 확보한 뒤
 * 거래 등록 API를 호출한다. 성공/실패 처리는 호출부가 `callbacks`로 주입하고,
 * 내부에서는 거래내역 목록·대시보드(잔액/월별 추이) 쿼리 invalidate를 담당한다.
 */
export function useCreateTransaction(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiptFile, ...rest }: CreateTransactionVars) => {
      if (!clubId || accountId === null) throw new Error(REQUIRE_ACCOUNT);

      const files = receiptFile ? [await uploadFile(receiptFile, 'RECEIPT')] : [];
      const body: TransactionBody = { ...rest, files };

      return duesApi.createTransaction(clubId, accountId, body);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      // 거래 추가는 거래내역 목록과 대시보드(잔액·월별 추이)에 모두 영향
      queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.all, 'dues'] });
      callbacks?.onSettled?.();
    },
  });
}
