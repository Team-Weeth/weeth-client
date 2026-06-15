import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';
import type { MutationCallbacks } from '@/types';
import type { HomeDashboard } from '@/types/home';

const HOME_DASHBOARD_STALE_TIME = 5 * 60 * 1000;
const HOME_DASHBOARD_GC_TIME = 30 * 60 * 1000;

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
    staleTime: HOME_DASHBOARD_STALE_TIME,
    gcTime: HOME_DASHBOARD_GC_TIME,
    select: options?.select,
  });

  useEffect(() => {
    if (!query.isSuccess) return;
    onSuccess?.();
  }, [query.isSuccess, onSuccess]);

  return query;
}
