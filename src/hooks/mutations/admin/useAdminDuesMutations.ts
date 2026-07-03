import { useMutation, useQueryClient } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/adminDues';
import { uploadFile } from '@/lib/apis/upload';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';
import type { MutationCallbacks } from '@/types/common';
import type {
  BulkPaidBody,
  BulkRefundBody,
  BulkUnpaidBody,
  TransactionBody,
  TransactionDirection,
} from '@/types/admin/dues';

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

/** 거래내역 수정 뮤테이션 변수 — 추가 변수 + 대상 거래 ID */
export interface UpdateTransactionVars extends CreateTransactionVars {
  transactionId: number;
}

/** 영수증이 있으면 S3 업로드 후 storageKey를 채워 요청 바디로 변환한다. */
async function toTransactionBody({
  receiptFile,
  ...rest
}: CreateTransactionVars): Promise<TransactionBody> {
  const files = receiptFile ? [await uploadFile(receiptFile, 'RECEIPT')] : [];
  return { ...rest, files };
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
    mutationFn: async (vars: CreateTransactionVars) => {
      if (!clubId || accountId === null) throw new Error(REQUIRE_ACCOUNT);
      const body = await toTransactionBody(vars);
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

/**
 * 회비 거래내역 수정 뮤테이션 훅.
 *
 * 금액 변경 시 서버가 장부 잔액을 재계산하므로, create와 동일하게 거래내역·대시보드
 * 쿼리를 invalidate한다. 시스템 거래(CARRY_OVER 등)는 서버에서 수정이 거부된다.
 */
export function useUpdateTransaction(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, ...vars }: UpdateTransactionVars) => {
      if (!clubId || accountId === null) throw new Error(REQUIRE_ACCOUNT);
      const body = await toTransactionBody(vars);
      return duesApi.updateTransaction(clubId, accountId, transactionId, body);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.all, 'dues'] });
      callbacks?.onSettled?.();
    },
  });
}

/**
 * 납부 대상 벌크 "납부 정정" 뮤테이션 훅.
 *
 * 잘못 확인한 납부를 취소하고 해당 회비 거래를 원복한다. 납부 상태·거래내역·대시보드가
 * 모두 바뀌므로 dues prefix 전체를 invalidate한다.
 */
export function useMarkPaymentTargetsUnpaid(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: BulkUnpaidBody) => {
      if (!clubId || accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.markPaymentTargetsUnpaid(clubId, accountId, body);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.all, 'dues'] });
      callbacks?.onSettled?.();
    },
  });
}

/**
 * 납부 대상 벌크 "환불 처리" 뮤테이션 훅.
 *
 * 납부 완료 대상을 환불 처리하고 시스템 환불 지출 거래를 생성한다(납부 이력은 보존).
 * 거래내역·대시보드에 영향을 주므로 dues prefix 전체를 invalidate한다.
 */
export function useRefundPaymentTargets(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: BulkRefundBody) => {
      if (!clubId || accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.refundPaymentTargets(clubId, accountId, body);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.all, 'dues'] });
      callbacks?.onSettled?.();
    },
  });
}

/**
 * 납부 대상 벌크 "납부 완료" 뮤테이션 훅.
 *
 * 대상들을 납부 완료 처리하고 시스템 회비 수입 거래를 생성한다. 거래내역·대시보드에
 * 영향을 주므로 dues prefix 전체를 invalidate한다.
 */
export function useMarkPaymentTargetsPaid(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: BulkPaidBody) => {
      if (!clubId || accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.markPaymentTargetsPaid(clubId, accountId, body);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.all, 'dues'] });
      callbacks?.onSettled?.();
    },
  });
}

/**
 * 회비 거래내역 삭제(소프트 삭제) 뮤테이션 훅.
 *
 * 서버가 삭제 후 장부 잔액을 원복하므로 create/update와 동일하게 거래내역·대시보드
 * 쿼리를 invalidate한다. 시스템 거래(CARRY_OVER 등)는 서버에서 삭제가 거부된다.
 */
export function useDeleteTransaction(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: number) => {
      if (!clubId || accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.deleteTransaction(clubId, accountId, transactionId);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.all, 'dues'] });
      callbacks?.onSettled?.();
    },
  });
}
