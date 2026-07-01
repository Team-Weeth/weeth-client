import { useMutation, useQueryClient } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/dues';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';
import type { MutationCallbacks } from '@/types/common';
import type {
  DuesDraftData,
  SaveBankAccountBody,
  SaveBasicBody,
  SaveCarryOverBody,
  SavePaymentTargetsBody,
} from '@/types/admin/dues';

/**
 * 회비 등록(온보딩) 뮤테이션 훅.
 *
 * 각 스텝의 저장/생성/삭제 요청을 담당한다. 성공/실패 처리는 호출부가
 * `callbacks`로 주입한다(토스트·네비게이션 등). 내부에서는 관련 쿼리
 * invalidate 같은 공통 후처리만 담당한다.
 */

const REQUIRE_ACCOUNT = 'accountId가 없습니다';

export function useCreateDuesDraft(clubId: string, callbacks?: MutationCallbacks<unknown>) {
  return useMutation({
    mutationFn: (cardinalNumber: number) =>
      duesApi.createDraft(clubId, cardinalNumber).then((res) => res.data.data as DuesDraftData),
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}

export function useDiscardDuesDraft(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  return useMutation({
    mutationFn: () => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.discardDraft(clubId, accountId);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}

export function useSaveDuesBasic(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveBasicBody) => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.saveBasic(clubId, accountId, body);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.duesRegistrationStatus(clubId, accountId),
      });
      callbacks?.onSettled?.();
    },
  });
}

export function useSaveDuesPaymentTargets(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SavePaymentTargetsBody) => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.savePaymentTargets(clubId, accountId, body);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.duesPaymentTargets(clubId, accountId),
      });
      callbacks?.onSettled?.();
    },
  });
}

export function useSaveDuesCarryOver(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveCarryOverBody) => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.saveCarryOver(clubId, accountId, body);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.duesRegistrationStatus(clubId, accountId),
      });
      callbacks?.onSettled?.();
    },
  });
}

export function useSaveDuesBankAccount(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveBankAccountBody) => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.saveBankAccount(clubId, accountId, body);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.duesRegistrationStatus(clubId, accountId),
      });
      callbacks?.onSettled?.();
    },
  });
}

export function useCompleteDuesRegistration(
  clubId: string,
  accountId: number | null,
  callbacks?: MutationCallbacks<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.completeRegistration(clubId, accountId);
    },
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dues'] });
      callbacks?.onSettled?.();
    },
  });
}
