import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';
import { useUserStore } from '@/stores/useUserStore';

export function useHomeQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', clubId],
    queryFn: async () => {
      const res = await homeApi.getDashboard(clubId!);
      const data = res.data.data;
      useUserStore.getState().setUser(data.myInfo.userInfo);
      return data;
    },
    enabled: !!clubId,
    staleTime: Infinity, // 홈 진입 시 1회만 조회 후 캐싱 (회의 결정)
  });
}
