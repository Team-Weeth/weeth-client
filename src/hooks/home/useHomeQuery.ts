import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';
import { useUserStore } from '@/stores/useUserStore';
import type { HomeDashboard } from '@/types/home';

interface UseHomeQueryOptions<TData> {
  select?: (data: HomeDashboard) => TData;
}

export function useHomeQuery<TData = HomeDashboard>(options?: UseHomeQueryOptions<TData>) {
  const clubId = useClubId();

  return useQuery<HomeDashboard, Error, TData>({
    queryKey: ['home', clubId],
    queryFn: async () => {
      const res = await homeApi.getDashboard(clubId!);
      const data = res.data.data;
      useUserStore.getState().setUser(data.myInfo.userInfo);
      return data;
    },
    enabled: !!clubId,
    staleTime: Infinity, // 홈 진입 시 1회만 조회 후 캐싱 (회의 결정)
    select: options?.select,
  });
}
