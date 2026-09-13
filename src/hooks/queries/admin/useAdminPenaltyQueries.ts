import { useQuery } from '@tanstack/react-query';

import { PENALTY_MEMBERS_PER_PAGE } from '@/constants/admin/penaltyTable.constants';
import { adminMemberApi } from '@/lib/apis/adminMember';
import { adminPenaltyApi } from '@/lib/apis/adminPenalty';
import { useClubId } from '@/stores';
import type { PenaltySortBy } from '@/types/admin/penalty';
import { toPenaltyMember, toPenaltyRecord } from '@/utils/admin/penaltyMapper';
import { adminQueryKeys } from './adminQueryKeys';

interface PenaltyMembersParams {
  cardinalNumber: number | null;
  /** 이름·학과·학번 검색어 (서버에서 필터) */
  keyword: string;
  sort: PenaltySortBy;
  /** 1-based 페이지 번호 */
  page: number;
}

/**
 * 선택한 기수의 멤버 목록을 서버에서 검색·정렬·페이지네이션해 한 페이지만 받아온다.
 * (페널티 횟수·최근일 정렬은 서버 미지원 — types/admin/penalty.ts TODO 참고)
 */
export function useAdminPenaltyMembers({
  cardinalNumber,
  keyword,
  sort,
  page,
}: PenaltyMembersParams) {
  const clubId = useClubId();
  const trimmedKeyword = keyword.trim();

  return useQuery({
    queryKey: adminQueryKeys.penaltyMembers(clubId, cardinalNumber, {
      keyword: trimmedKeyword,
      sort,
      page,
    }),
    queryFn: async () => {
      const res = await adminMemberApi.getMembers(clubId!, {
        page: page - 1,
        size: PENALTY_MEMBERS_PER_PAGE,
        cardinalNumber: cardinalNumber!,
        keyword: trimmedKeyword || undefined,
        sort,
      });
      const data = res.data.data;

      return {
        members: data.content.map(toPenaltyMember),
        totalPages: Math.max(data.totalPages ?? 1, 1),
      };
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
