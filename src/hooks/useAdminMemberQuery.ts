import { useQuery } from '@tanstack/react-query';

import { adminMemberApi } from '@/lib/apis/adminMember';
import { toMember } from '@/utils/admin/memberMapper';

// TODO: clubId를 실제 값으로 교체해야 함 (로그인 후 받아오거나 환경변수로 관리)
const CLUB_ID = 1;

export function useAdminMembers() {
  return useQuery({
    queryKey: ['admin', 'members', CLUB_ID],
    queryFn: async () => {
      const res = await adminMemberApi.getMembers(CLUB_ID);
      return res.data.map(toMember);
    },
  });
}
