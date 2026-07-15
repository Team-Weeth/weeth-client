import { useInfiniteQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

const HOME_RECENT_POSTS_PAGE_SIZE = 10;
const HOME_RECENT_POSTS_STALE_TIME = 2 * 60 * 1000;
const HOME_RECENT_POSTS_GC_TIME = 15 * 60 * 1000;

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
    staleTime: HOME_RECENT_POSTS_STALE_TIME,
    gcTime: HOME_RECENT_POSTS_GC_TIME,
  });
}
