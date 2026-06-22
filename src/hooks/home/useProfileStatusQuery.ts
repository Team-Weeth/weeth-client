import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

const PROFILE_STATUS_STALE_TIME = 5 * 60 * 1000;
const PROFILE_STATUS_GC_TIME = 30 * 60 * 1000;

export function useProfileStatusQuery(clubIdOverride?: string) {
  const storedClubId = useClubId();
  const clubId = clubIdOverride ?? storedClubId;

  return useQuery({
    queryKey: ['home', 'profile-status', clubId],
    queryFn: () => homeApi.getProfileStatus(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: PROFILE_STATUS_STALE_TIME,
    gcTime: PROFILE_STATUS_GC_TIME,
  });
}
