'use client';

import {
  useAssignPenalty,
  useDeletePenalty,
  useSavePenaltyRule,
  useUpdatePenalty,
} from '@/hooks/mutations/admin/useAdminPenaltyMutations';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import type { PenaltyRecord, PenaltyRecordDraft } from '@/types/admin/penalty';
import { getApiErrorMessage } from '@/utils/shared/getApiErrorCode';

/** 페널티 부여/수정/삭제·규정 저장 뮤테이션과 토스트 처리를 한데 모은다. */
export function usePenaltyRecordActions() {
  const assignPenalty = useAssignPenalty();
  const updatePenalty = useUpdatePenalty();
  const deletePenalty = useDeletePenalty();
  const savePenaltyRule = useSavePenaltyRule();

  const handleError = (err: unknown) => toastError(getApiErrorMessage(err));

  const submitRecord = (draft: PenaltyRecordDraft, onSuccess: () => void) => {
    assignPenalty.mutate(
      {
        // 멤버 id는 멤버 목록의 userId를 그대로 쓴다.
        userIds: draft.memberIds.map(Number),
        score: draft.score,
        penaltyDescription: draft.reason.trim(),
        penaltyType: draft.type,
      },
      {
        onSuccess: () => {
          onSuccess();
          toastSuccess('페널티가 기록되었습니다.');
        },
        onError: handleError,
      },
    );
  };

  const updateRecord = (record: PenaltyRecord, next: { reason: string; score: number }) => {
    updatePenalty.mutate(
      { penaltyId: record.id, penaltyDescription: next.reason, score: next.score },
      {
        onSuccess: () => toastSuccess('페널티 내역이 수정되었습니다.'),
        onError: handleError,
      },
    );
  };

  const deleteRecord = (record: PenaltyRecord) => {
    deletePenalty.mutate(record.id, {
      onSuccess: () => toastSuccess('페널티 내역이 삭제되었습니다.'),
      onError: handleError,
    });
  };

  const saveRule = (guide: string, onSuccess: () => void) => {
    savePenaltyRule.mutate(guide, {
      onSuccess: () => {
        onSuccess();
        toastSuccess('페널티 규정이 저장되었습니다.');
      },
      onError: handleError,
    });
  };

  return { submitRecord, updateRecord, deleteRecord, saveRule };
}
