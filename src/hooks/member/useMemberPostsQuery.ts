import { useInfiniteQuery } from '@tanstack/react-query';
import { memberApi } from '@/lib/apis/member';

const MEMBER_POSTS_PAGE_SIZE = 10;

export function useMemberPostsQuery(clubId: string, clubMemberId: number) {
  return useInfiniteQuery({
    queryKey: ['members', clubId, 'posts', clubMemberId],
    queryFn: ({ pageParam }) =>
      memberApi
        .getMemberPosts(clubId, clubMemberId, {
          pageNumber: pageParam,
          pageSize: MEMBER_POSTS_PAGE_SIZE,
        })
        .then((res) => res.data.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.pageNumber + 1 : undefined),
    select: (data) => data.pages.flatMap((page) => page.content),
    enabled: Boolean(clubId) && Number.isFinite(clubMemberId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
