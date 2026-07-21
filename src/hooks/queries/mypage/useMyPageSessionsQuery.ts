import { useInfiniteQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';

const MYPAGE_SESSIONS_PAGE_SIZE = 5;

export function useMyPageSessionsQuery(clubId: string) {
  return useInfiniteQuery({
    queryKey: ['mypage', 'sessions', clubId],
    queryFn: ({ pageParam }) =>
      mypageApi
        .getMyAttendedSessions(clubId, {
          pageNumber: pageParam,
          pageSize: MYPAGE_SESSIONS_PAGE_SIZE,
        })
        .then((res) => res.data.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.pageNumber + 1 : undefined),
    select: (data) => data.pages.flatMap((page) => page.content),
    enabled: Boolean(clubId),
  });
}
