import { useSuspenseQueries } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import { useClubId } from '@/stores/useClubStore';

export function useMyPageQueries() {
  const clubId = useClubId();

  return useSuspenseQueries({
    queries: [
      {
        queryKey: ['mypage', 'me', clubId],
        queryFn: () => mypageApi.getMe(clubId!).then((res) => res.data.data),
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
      },
      {
        queryKey: ['mypage', 'clubs'],
        queryFn: () => mypageApi.getMyClubs().then((res) => res.data.data),
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
      },
    ],
  });
}
