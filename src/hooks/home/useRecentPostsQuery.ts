import { useInfiniteQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

const HOME_RECENT_POSTS_PAGE_SIZE = 10;

export function useRecentPostsQuery() {
  const clubId = useClubId();

  return useInfiniteQuery({
    queryKey: ['home', 'recent-posts', clubId],
    queryFn: ({ pageParam }) =>
      homeApi
        .getRecentPosts(clubId!, {
          pageNumber: pageParam,
          pageSize: HOME_RECENT_POSTS_PAGE_SIZE,
        })
        .then((res) => res.data.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage?.last !== false ? undefined : lastPage.number + 1),
    select: (data) => data.pages.flatMap((page) => page.content),
    enabled: !!clubId,
  });
}
