import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

export function useRecentNoticesQuery(size?: number) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', 'recent-notices', clubId],
    queryFn: () => homeApi.getRecentNotices(clubId!, { size }).then((res) => res.data.data),
    enabled: !!clubId,
  });
}
