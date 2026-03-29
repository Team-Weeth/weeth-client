import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

export function useRecentPostsQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', 'recent-posts', clubId],
    queryFn: () => homeApi.getRecentPosts(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
  });
}
