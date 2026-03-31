import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

const HOME_RECENT_POSTS_PAGE_SIZE = 10;

export function useRecentPostsQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', 'recent-posts', clubId],
    queryFn: () =>
      homeApi
        .getRecentPosts(clubId!, { pageSize: HOME_RECENT_POSTS_PAGE_SIZE })
        .then((res) => res.data.data),
    enabled: !!clubId,
  });
}
