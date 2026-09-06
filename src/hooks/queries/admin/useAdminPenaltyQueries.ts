import { useQuery } from '@tanstack/react-query';

import { PENALTY_MEMBER_PAGE_SIZE } from '@/constants/admin/penaltyTable.constants';
import { adminMemberApi } from '@/lib/apis/adminMember';
import { adminPenaltyApi } from '@/lib/apis/adminPenalty';
import { useClubId } from '@/stores';
import type { ClubMember } from '@/types/admin/member';
import { toPenaltyMember, toPenaltyRecord } from '@/utils/admin/penaltyMapper';
import { adminQueryKeys } from './adminQueryKeys';

/**
 * 선택한 기수의 멤버를 마지막 페이지까지 받아온다.
 * 검색·정렬·페이지 이동을 클라이언트에서 처리하므로 일부만 받으면 조용히 누락된다.
 */
export function useAdminPenaltyMembers(cardinalNumber: number | null) {
  const clubId = useClubId();

  return useQuery({
    queryKey: adminQueryKeys.penaltyMembers(clubId, cardinalNumber),
    queryFn: async () => {
      const members: ClubMember[] = [];
      let page = 0;
      let hasNext = true;

      while (hasNext) {
        const res = await adminMemberApi.getMembers(clubId!, {
          page,
          size: PENALTY_MEMBER_PAGE_SIZE,
          cardinalNumber: cardinalNumber!,
          sort: 'CARDINAL_DESC',
        });

        members.push(...res.data.data.content);
        hasNext = res.data.data.hasNext;
        page += 1;
      }

      return members.map(toPenaltyMember);
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
