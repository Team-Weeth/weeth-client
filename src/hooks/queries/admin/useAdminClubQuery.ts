import { useQuery } from '@tanstack/react-query';
import { adminClubApi } from '@/lib/apis/adminClub';
import { useClubId } from '@/stores';
import { adminQueryKeys } from './adminQueryKeys';

export function useAdminClubQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: adminQueryKeys.club(clubId),
    queryFn: () => adminClubApi.getDetail(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
