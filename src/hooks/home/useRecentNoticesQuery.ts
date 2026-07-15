import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

const HOME_RECENT_NOTICES_STALE_TIME = 2 * 60 * 1000;
const HOME_RECENT_NOTICES_GC_TIME = 15 * 60 * 1000;

export function useRecentNoticesQuery(size?: number) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', 'recent-notices', clubId, size ?? null],
    queryFn: () => homeApi.getRecentNotices(clubId!, { size }).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: HOME_RECENT_NOTICES_STALE_TIME,
    gcTime: HOME_RECENT_NOTICES_GC_TIME,
  });
}
