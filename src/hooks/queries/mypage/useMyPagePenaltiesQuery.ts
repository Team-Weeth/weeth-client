import { useInfiniteQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';

const MYPAGE_PENALTIES_PAGE_SIZE = 5;

export function useMyPagePenaltiesQuery(clubId: string) {
  return useInfiniteQuery({
    queryKey: ['mypage', 'penalties', clubId],
    queryFn: ({ pageParam }) =>
      mypageApi
        .getMyPenalties(clubId, {
          pageNumber: pageParam,
          pageSize: MYPAGE_PENALTIES_PAGE_SIZE,
        })
        .then((res) => res.data.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.pageNumber + 1 : undefined),
    select: (data) => data.pages.flatMap((page) => page.content),
    enabled: Boolean(clubId),
  });
}
