import { useQuery } from '@tanstack/react-query';

import { PENALTY_MEMBER_FETCH_SIZE } from '@/constants/admin/penaltyTable.constants';
import { adminMemberApi } from '@/lib/apis/adminMember';
import { adminPenaltyApi } from '@/lib/apis/adminPenalty';
import { useClubId } from '@/stores';
import { toPenaltyMember, toPenaltyRecord } from '@/utils/admin/penaltyMapper';
import { adminQueryKeys } from './adminQueryKeys';

/**
 * 선택한 기수의 멤버를 한 번에 받아온다.
 * 검색·정렬·페이지 이동은 클라이언트에서 처리하므로 서버 페이지네이션을 쓰지 않는다.
 */
export function useAdminPenaltyMembers(cardinalNumber: number | null) {
  const clubId = useClubId();

  return useQuery({
    queryKey: adminQueryKeys.penaltyMembers(clubId, cardinalNumber),
    queryFn: async () => {
      const res = await adminMemberApi.getMembers(clubId!, {
        page: 0,
        size: PENALTY_MEMBER_FETCH_SIZE,
        cardinalNumber: cardinalNumber!,
        sort: 'CARDINAL_DESC',
      });

      return res.data.data.content.map(toPenaltyMember);
    },
    placeholderData: (previousData) => previousData,
    enabled: !!clubId && cardinalNumber !== null,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}

/** 멤버 한 명의 페널티 내역. 상세 모달이 열려 있을 때만 조회한다. */
export function useAdminMemberPenaltyDetail(clubMemberId: number | null) {
  const clubId = useClubId();

  return useQuery({
    queryKey: adminQueryKeys.memberPenaltyDetail(clubId, clubMemberId),
    queryFn: async () => {
      const res = await adminPenaltyApi.getMemberPenaltyDetail(clubId!, clubMemberId!);

      return res.data.data.penalties
        .map(toPenaltyRecord)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    enabled: !!clubId && clubMemberId !== null,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}
