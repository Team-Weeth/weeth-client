import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import type { ProfileStatus } from '@/types/home';
import type { ClubDto, MyClubMemberSummary } from '@/types/mypage';

export function useInitCardinalsMutation(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardinals: number[]) => mypageApi.initCardinals(clubId, cardinals),
    onSuccess: (_, cardinals) => {
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

      queryClient.setQueryData<MyClubMemberSummary>(['mypage', 'club-summary', clubId], (old) => {
        if (!old) return old;
        return {
          ...old,
          cardinals: nextCardinals,
        };
      });

      queryClient.setQueryData<ProfileStatus>(['home', 'profile-status', clubId], (old) => {
        if (!old) return old;
        return {
          ...old,
          cardinalAssigned: nextCardinals.length > 0,
        };
      });

      queryClient.invalidateQueries({ queryKey: ['mypage', 'clubs'] });
      queryClient.invalidateQueries({ queryKey: ['mypage', 'club-summary', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'profile-status', clubId] });
    },
  });
}
