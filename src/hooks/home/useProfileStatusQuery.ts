import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

export function useProfileStatusQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', 'profile-status', clubId],
    queryFn: () => homeApi.getProfileStatus(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: Infinity, // 홈/로그인 시 1회만 조회 후 캐싱
  });
}
