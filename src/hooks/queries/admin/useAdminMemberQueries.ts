import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { adminMemberApi, type ClubMemberSort } from '@/lib/apis/adminMember';
import type { Member } from '@/types/admin/member';
import type { PageResponse } from '@/types/common';
import { toMember } from '@/utils/admin/memberMapper';
import { useClubId } from '@/stores';
import { adminQueryKeys } from './adminQueryKeys';

const EMPTY_MEMBER_PAGE: PageResponse<Member> = {
  content: [],
  pageNumber: 0,
  pageSize: 10,
  numberOfElements: 0,
  hasNext: false,
  totalElements: 0,
  totalPages: 0,
};

/**
 * 기수 필터와 정렬은 서버에 넘겨야 한다. 받아온 페이지에서 걸러내거나 정렬하면
 * 한 페이지에 보이는 인원이 들쭉날쭉해지고, 정렬도 그 페이지 안에서만 적용된다.
 */
export function useAdminMembers(
  pageNumber = 0,
  pageSize = 10,
  enabled = true,
  cardinalNumber?: number,
  sort?: ClubMemberSort,
) {
  const clubId = useClubId();

  return useQuery({
    queryKey: [
      ...adminQueryKeys.members(clubId),
      pageNumber,
      pageSize,
      cardinalNumber ?? null,
      sort ?? null,
    ],
    queryFn: async () => {
      const res = await adminMemberApi.getMembers(clubId!, {
        page: pageNumber,
        size: pageSize,
        cardinalNumber,
        sort,
      });
      const page = res.data.data;

      return {
        ...page,
        content: page.content.map(toMember),
      };
    },
    placeholderData: (previousData) => previousData,
    enabled: !!clubId && enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useAdminMembersInfinite(
  pageSize = 10,
  enabled = true,
  cardinalNumber?: number,
  sort?: ClubMemberSort,
) {
  const clubId = useClubId();

  return useInfiniteQuery({
    queryKey: [
      ...adminQueryKeys.members(clubId),
      'infinite',
      pageSize,
      cardinalNumber ?? null,
      sort ?? null,
    ],
    queryFn: async ({ pageParam }) => {
      const res = await adminMemberApi.getMembers(clubId!, {
        page: pageParam,
        size: pageSize,
        cardinalNumber,
        sort,
      });
      const page = res.data.data;

      return {
        ...page,
        content: page.content.map(toMember),
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.pageNumber + 1;
      const hasNext =
        lastPage.totalPages != null ? nextPage < lastPage.totalPages : lastPage.hasNext;
      return hasNext ? nextPage : undefined;
    },
    select: (data) => data.pages.flatMap((page) => page.content),
    enabled: !!clubId && enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export { EMPTY_MEMBER_PAGE };

export function useAdminMemberSearch(keyword: string, cardinalNumber?: number, enabled = true) {
  const clubId = useClubId();

  return useQuery({
    queryKey: [...adminQueryKeys.members(clubId), 'search', keyword, cardinalNumber],
    queryFn: async ({ signal }) => {
      const res = await adminMemberApi.searchMembers(clubId!, keyword, cardinalNumber, signal);
      return res.data.data.map(toMember);
    },
    enabled: !!clubId && !!keyword && enabled,
  });
}
