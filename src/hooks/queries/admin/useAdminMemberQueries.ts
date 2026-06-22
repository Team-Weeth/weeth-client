import { useQuery } from '@tanstack/react-query';

import { adminMemberApi } from '@/lib/apis/adminMember';
import { toMember } from '@/utils/admin/memberMapper';
import { useClubId } from '@/stores';
import { adminQueryKeys } from './adminQueryKeys';

export function useAdminMembers() {
  const clubId = useClubId();

  return useQuery({
    queryKey: adminQueryKeys.members(clubId),
    queryFn: async () => {
      const res = await adminMemberApi.getMembers(clubId!);
      return res.data.data.map(toMember);
    },
    enabled: !!clubId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
