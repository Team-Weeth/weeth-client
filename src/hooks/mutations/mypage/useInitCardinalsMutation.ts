import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import { useClubId } from '@/stores/useClubStore';

export function useInitCardinalsMutation() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: (cardinals: number[]) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return mypageApi.initCardinals(clubId, cardinals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mypage', 'clubs'] });
      if (clubId) {
        queryClient.invalidateQueries({ queryKey: ['mypage', 'me', clubId] });
        queryClient.invalidateQueries({ queryKey: ['home', 'profile-status', clubId] });
      }
    },
  });
}
