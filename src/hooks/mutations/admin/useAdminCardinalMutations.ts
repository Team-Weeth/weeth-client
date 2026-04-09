import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cardinalApi } from '@/lib/apis/cardinal';
import { useClubId } from '@/stores';

export function useCreateCardinal() {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      cardinalNumber: number;
      year: number;
      semester: number;
      inProgress: boolean;
    }) => cardinalApi.createCardinal(clubId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardinals', clubId] });
    },
  });
}
