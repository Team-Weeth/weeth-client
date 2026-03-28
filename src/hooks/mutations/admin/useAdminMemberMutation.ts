import { CLUB_ID } from '@/hooks/queries/admin/useAdminMemberQuery';
import { adminMemberApi } from '@/lib/apis';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useChangeToAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubMemberId: number) =>
      adminMemberApi.updateMemberRole(CLUB_ID, clubMemberId, 'ADMIN'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members', CLUB_ID] });
    },
  });
}
