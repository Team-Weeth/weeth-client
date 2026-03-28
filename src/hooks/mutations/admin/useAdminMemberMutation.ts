import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CLUB_ID } from '@/hooks/queries/admin/useAdminMemberQuery';
import { adminMemberApi } from '@/lib/apis';
import type { ClubMemberRole } from '@/types/admin/member';

export function useChangeMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubMemberId,
      memberRole,
    }: {
      clubMemberId: number;
      memberRole: ClubMemberRole;
    }) => adminMemberApi.updateMemberRole(CLUB_ID, clubMemberId, memberRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members', CLUB_ID] });
    },
  });
}
