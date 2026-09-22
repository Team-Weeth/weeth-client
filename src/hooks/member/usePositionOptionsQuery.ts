import { useQuery } from '@tanstack/react-query';
import { positionApi } from '@/lib/apis/position';

export function usePositionOptionsQuery(clubId: string) {
  return useQuery({
    queryKey: ['positions', clubId],
    queryFn: () => positionApi.getOptions(clubId).then((res) => res.data.data),
    enabled: Boolean(clubId),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
