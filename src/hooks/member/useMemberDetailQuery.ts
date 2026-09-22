import { useQuery } from '@tanstack/react-query';
import { memberApi } from '@/lib/apis/member';
import { toMemberProfileFromDetail } from '@/utils/member/memberMapper';

export function useMemberDetailQuery(clubId: string, clubMemberId: number, enabled = true) {
  return useQuery({
    queryKey: ['members', clubId, 'detail', clubMemberId],
    queryFn: () => memberApi.getMemberDetail(clubId, clubMemberId).then((res) => res.data.data),
    select: toMemberProfileFromDetail,
    enabled: enabled && Boolean(clubId) && Number.isFinite(clubMemberId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
