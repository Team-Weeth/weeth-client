import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';
import type { MutationCallbacks } from '@/types';
import type { HomeDashboard } from '@/types/home';

interface UseHomeQueryOptions<TData> {
  select?: (data: HomeDashboard) => TData;
  callback?: Pick<MutationCallbacks, 'onSuccess'>;
}

export function useHomeQuery<TData = HomeDashboard>(options?: UseHomeQueryOptions<TData>) {
  const clubId = useClubId();
  const onSuccess = options?.callback?.onSuccess;

  const query = useQuery<HomeDashboard, Error, TData>({
    queryKey: ['home', clubId],
    queryFn: () => homeApi.getDashboard(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: Infinity, // 홈 진입 시 1회만 조회 후 캐싱 (회의 결정)
    select: options?.select,
  });

  useEffect(() => {
    if (!query.isSuccess) return;
    onSuccess?.();
  }, [query.isSuccess, onSuccess]);

  return query;
}
