import { useQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';

export function useMyMemberQuery(clubId: string) {
  return useQuery({
    queryKey: ['mypage', 'me', clubId],
    queryFn: () => mypageApi.getMe(clubId).then((res) => res.data.data),
    enabled: Boolean(clubId),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
