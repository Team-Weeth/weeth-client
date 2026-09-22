import { useQuery } from '@tanstack/react-query';

import { adminPositionApi } from '@/lib/apis/adminPosition';
import { useClubId } from '@/stores';
import { toMemberPositionOptions } from '@/utils/admin/memberPositionMapper';
import { adminQueryKeys } from './adminQueryKeys';

/** 포지션 옵션은 관리자가 직접 바꿀 때만 변하므로 길게 캐싱한다. */
export function useAdminPositionOptions(enabled = true) {
  const clubId = useClubId();

  return useQuery({
    queryKey: adminQueryKeys.positions(clubId),
    queryFn: async () => {
      const res = await adminPositionApi.getOptions(clubId!);
      return toMemberPositionOptions(res.data.data);
    },
    enabled: !!clubId && enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
