import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';
import { adminPenaltyApi } from '@/lib/apis/adminPenalty';
import { useClubId } from '@/stores';
import type { AdminSavePenaltyRequest, AdminUpdatePenaltyRequest } from '@/types/api/admin/penalty';

/** 페널티를 부여하거나 수정·삭제하면 멤버 목록의 페널티 점수/최근 일자가 함께 바뀐다. */
function usePenaltyInvalidation() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.penalties(clubId) });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.members(clubId) });
  };
}

export function useAssignPenalty() {
  const clubId = useClubId();
  const invalidatePenalties = usePenaltyInvalidation();

  return useMutation({
    mutationFn: (body: AdminSavePenaltyRequest) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminPenaltyApi.assignPenalty(clubId, body);
    },
    onSuccess: invalidatePenalties,
  });
}

export function useUpdatePenalty() {
  const clubId = useClubId();
  const invalidatePenalties = usePenaltyInvalidation();

  return useMutation({
    mutationFn: (body: AdminUpdatePenaltyRequest) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminPenaltyApi.updatePenalty(clubId, body);
    },
    onSuccess: invalidatePenalties,
  });
}

export function useDeletePenalty() {
  const clubId = useClubId();
  const invalidatePenalties = usePenaltyInvalidation();

  return useMutation({
    mutationFn: (penaltyId: number) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminPenaltyApi.deletePenalty(clubId, penaltyId);
    },
    onSuccess: invalidatePenalties,
  });
}

export function useSavePenaltyRule() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: (content: string) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminPenaltyApi.savePenaltyRule(clubId, { content });
    },
    // 규정 조회는 어드민 스펙에 없어 마이페이지 엔드포인트를 함께 쓴다.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mypage', 'penaltyRule', clubId] });
    },
  });
}
