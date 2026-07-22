import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import { useClubId } from '@/stores/useClubStore';
import type { ProfileStatus } from '@/types/home';
import type { ClubDto } from '@/types/mypage';

export function useInitCardinalsMutation() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: (cardinals: number[]) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return mypageApi.initCardinals(clubId, cardinals);
    },
    onSuccess: (_, cardinals) => {
      if (clubId) {
        const nextCardinals = [...cardinals].sort((a, b) => a - b);

        queryClient.setQueryData<ClubDto[]>(['mypage', 'clubs'], (old) => {
          if (!old) return old;
          return old.map((club) =>
            club.id === clubId
              ? {
                  ...club,
                  cardinals: nextCardinals,
                }
              : club,
          );
        });

        queryClient.setQueryData<ProfileStatus>(['home', 'profile-status', clubId], (old) => {
          if (!old) return old;
          return {
            ...old,
            cardinalAssigned: nextCardinals.length > 0,
          };
        });
      }

      queryClient.invalidateQueries({ queryKey: ['mypage', 'clubs'] });
      if (clubId) {
        queryClient.invalidateQueries({ queryKey: ['home', 'profile-status', clubId] });
      }
    },
  });
}
