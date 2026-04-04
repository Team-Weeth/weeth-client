import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CLUB_ID } from '@/hooks/queries/admin/useAdminMemberQueries';
import { cardinalApi } from '@/lib/apis';

export function useCreateCardinal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { cardinalNumber: number; year: number; semester: number; inProgress: boolean }) =>
      cardinalApi.createCardinal(CLUB_ID, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardinals', CLUB_ID] });
    },
  });
}
