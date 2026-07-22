import { useInfiniteQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';

const MYPAGE_POSTS_PAGE_SIZE = 5;

export function useMyPagePostsQuery(clubId: string) {
  return useInfiniteQuery({
    queryKey: ['mypage', 'posts', clubId],
    queryFn: ({ pageParam }) =>
      mypageApi
        .getMyPosts(clubId, {
          pageNumber: pageParam,
          pageSize: MYPAGE_POSTS_PAGE_SIZE,
        })
        .then((res) => res.data.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.pageNumber + 1 : undefined),
    select: (data) => data.pages.flatMap((page) => page.content),
    enabled: Boolean(clubId),
  });
}
