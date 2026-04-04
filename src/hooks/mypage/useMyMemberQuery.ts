import { useQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import { useClubId } from '@/stores/useClubStore';

export function useMyMemberQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['mypage', 'me', clubId],
    queryFn: () => mypageApi.getMe(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
