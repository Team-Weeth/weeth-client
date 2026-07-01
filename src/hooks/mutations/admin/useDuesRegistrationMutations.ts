import { useMutation, useQueryClient } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/dues';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';
import { toastError } from '@/stores/useToastStore';
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
 * 각 스텝의 저장/생성/삭제 요청을 담당한다. 저장 실패 시 onError 토스트로
 * 사용자에게 알리므로, 컴포넌트는 mutateAsync를 try/catch로 감싸 실패 시
 * 다음 스텝 이동을 막으면 된다.
 *
 * 예외: completeRegistration은 에러 코드별 분기가 필요해 기본 토스트를 두지
 * 않고 호출부에서 처리한다.
 */

const REQUIRE_ACCOUNT = 'accountId가 없습니다';

export function useCreateDuesDraft(clubId: string) {
  return useMutation({
    mutationFn: (cardinalNumber: number) =>
      duesApi.createDraft(clubId, cardinalNumber).then((res) => res.data.data as DuesDraftData),
  });
}

export function useDiscardDuesDraft(clubId: string, accountId: number | null) {
  return useMutation({
    mutationFn: () => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.discardDraft(clubId, accountId);
    },
  });
}

export function useSaveDuesBasic(clubId: string, accountId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveBasicBody) => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.saveBasic(clubId, accountId, body);
    },
    onError: () => toastError('기본 정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.duesRegistrationStatus(clubId, accountId),
      });
    },
  });
}

export function useSaveDuesPaymentTargets(clubId: string, accountId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SavePaymentTargetsBody) => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.savePaymentTargets(clubId, accountId, body);
    },
    onError: () => toastError('납부 대상 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.duesPaymentTargets(clubId, accountId),
      });
    },
  });
}

export function useSaveDuesCarryOver(clubId: string, accountId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveCarryOverBody) => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.saveCarryOver(clubId, accountId, body);
    },
    onError: () => toastError('이월 설정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.duesRegistrationStatus(clubId, accountId),
      });
    },
  });
}

export function useSaveDuesBankAccount(clubId: string, accountId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveBankAccountBody) => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.saveBankAccount(clubId, accountId, body);
    },
    onError: () => toastError('계좌 정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.duesRegistrationStatus(clubId, accountId),
      });
    },
  });
}

export function useCompleteDuesRegistration(clubId: string, accountId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (accountId === null) throw new Error(REQUIRE_ACCOUNT);
      return duesApi.completeRegistration(clubId, accountId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dues'] });
    },
  });
}
