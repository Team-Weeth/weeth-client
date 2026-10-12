import { useState } from 'react';

import {
  useExcludePaymentTargets,
  useMarkPaymentTargetsPaid,
  useMarkPaymentTargetsUnpaid,
  useRefundPaymentTargets,
} from '@/hooks/mutations/admin/useAdminDuesMutations';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getApiErrorMessage } from '@/utils/shared';
import { DUES_INSUFFICIENT_BALANCE_MESSAGE } from '@/constants/admin/dues.constants';
import type { DuesMember } from '@/components/admin/dues/DuesMemberPaymentTable';
import type { PaymentTarget } from '@/types/admin/dues';

// 서버가 요구하는 'YYYY-MM-DDTHH:mm:ss'(로컬 시각) 포맷으로 현재 시각을 만든다.
function nowLocalDateTime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

interface UsePaymentTargetActionsParams {
  clubId: string;
  accountId: number | null;
  /** 실제 납부 대상(TARGETED)만. 벌크 액션 targetId 산정에 사용. */
  targeted: PaymentTarget[];
  /** 테이블에 노출되는 전체 부원(제외 포함). 선택 상태 판별에 사용. */
  members: DuesMember[];
}

/**
 * 납부 현황 페이지의 부원 선택 상태와 4종 벌크 액션(정정·환불·확인·제외)을 담당하는 훅.
 * 선택은 clubMemberId로 관리하지만 벌크 API는 targetId를 요구하므로 내부에서 변환한다.
 * 모든 액션은 성공 시 토스트를 띄우고 선택을 초기화한다.
 */
function usePaymentTargetActions({
  clubId,
  accountId,
  targeted,
  members,
}: UsePaymentTargetActionsParams) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const clearSelection = () => setSelectedIds(new Set());

  // 선택 상태(selectedIds)는 clubMemberId를 담고 있으나, 벌크 API는 targetId를 요구한다.
  const targetIdByMemberId = new Map(
    targeted.map((t) => [t.paymentTargetInfo.clubMemberId, t.targetId]),
  );
  const selectedTargetIds = () =>
    [...selectedIds]
      .map((memberId) => targetIdByMemberId.get(memberId))
      .filter((id): id is number => id !== undefined);

  // 선택은 동일 상태로만 이루어지므로, 첫 선택 멤버의 상태가 곧 선택 상태다.
  const selectedStatus =
    selectedIds.size === 0 ? null : (members.find((m) => selectedIds.has(m.id))?.status ?? null);

  const { mutate: markUnpaid } = useMarkPaymentTargetsUnpaid(clubId, accountId, {
    onSuccess: () => {
      toastSuccess('납부가 정정되었습니다.');
      clearSelection();
    },
    onError: () => toastError('납부 정정에 실패했습니다.'),
  });

  const { mutate: refund } = useRefundPaymentTargets(clubId, accountId, {
    onSuccess: () => {
      toastSuccess('환불 처리되었습니다.');
      clearSelection();
    },
    onError: (error) => {
      // 잔액 < 환불금이면 서버가 "잔액이 부족합니다. 현재: n, 요청: n" 메시지로 거부한다.
      const message = getApiErrorMessage(error);
      if (message?.includes(DUES_INSUFFICIENT_BALANCE_MESSAGE)) {
        toastError('잔액이 부족해 환불이 불가능합니다!');
        return;
      }
      toastError(message ?? '환불 처리에 실패했습니다.');
    },
  });

  const { mutate: markPaid } = useMarkPaymentTargetsPaid(clubId, accountId, {
    onSuccess: () => {
      toastSuccess('납부가 확인되었습니다.');
      clearSelection();
    },
    onError: () => toastError('납부 확인에 실패했습니다.'),
  });

  const { mutate: exclude } = useExcludePaymentTargets(clubId, accountId, {
    onSuccess: () => {
      toastSuccess('납부 대상에서 제외되었습니다.');
      clearSelection();
    },
    onError: () => toastError('제외 처리에 실패했습니다.'),
  });

  return {
    selectedIds,
    setSelectedIds,
    selectedStatus,
    clearSelection,
    onMarkUnpaid: () => markUnpaid({ targetIds: selectedTargetIds() }),
    onRefund: () => refund({ targetIds: selectedTargetIds(), memo: '' }),
    onMarkPaid: () =>
      markPaid({ targetIds: selectedTargetIds(), paidAt: nowLocalDateTime(), memo: '' }),
    onExclude: () => exclude({ targetIds: selectedTargetIds() }),
  };
}

export { usePaymentTargetActions };
