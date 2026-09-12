import { useInfiniteQuery } from '@tanstack/react-query';
import { memberApi } from '@/lib/apis/member';
import type { MemberRole } from '@/types/member';
import { toMemberProfile } from '@/utils/member/memberMapper';

const MEMBER_PAGE_SIZE = 20;

interface UseMembersQueryParams {
  cardinalNumber?: number;
  memberRole?: MemberRole;
  keyword?: string;
}

export function useMembersQuery(
  clubId: string,
  { cardinalNumber, memberRole, keyword }: UseMembersQueryParams = {},
) {
  return useInfiniteQuery({
    queryKey: ['members', clubId, cardinalNumber, memberRole, keyword],
    queryFn: ({ pageParam }) =>
      memberApi
        .getMembers(clubId, {
          cardinalNumber,
          memberRole,
          keyword,
          pageNumber: pageParam,
          pageSize: MEMBER_PAGE_SIZE,
        })
        .then((res) => res.data.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.pageNumber + 1 : undefined),
    select: (data) => data.pages.flatMap((page) => page.content.map(toMemberProfile)),
    enabled: Boolean(clubId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
