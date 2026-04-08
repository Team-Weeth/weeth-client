import { useSuspenseQuery, skipToken } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import { useClubId } from '@/stores/useClubStore';

export function useMyMemberQuery() {
  const clubId = useClubId();

  return useSuspenseQuery({
    queryKey: ['mypage', 'me', clubId],
    queryFn: clubId
      ? () => mypageApi.getMe(clubId).then((res) => res.data.data)
      : skipToken,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
