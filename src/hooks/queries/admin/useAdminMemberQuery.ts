import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminMemberApi } from '@/lib/apis/adminMember';
import { toMember } from '@/utils/admin/memberMapper';

// TODO: clubId store에서 가져오도로 변경
export const CLUB_ID = 'YUNJcjFKMO';

export function useAdminMembers() {
  return useQuery({
    queryKey: ['admin', 'members', CLUB_ID],
    queryFn: async () => {
      const res = await adminMemberApi.getMembers(CLUB_ID);
      return res.data.data.map(toMember);
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
