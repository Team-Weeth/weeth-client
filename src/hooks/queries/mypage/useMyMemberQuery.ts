import { useQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';

const MYPAGE_ME_STALE_TIME = 10 * 60 * 1000;
const MYPAGE_ME_GC_TIME = 30 * 60 * 1000;

export function useMyMemberQuery(clubId: string) {
  return useQuery({
    queryKey: ['mypage', 'me', clubId],
    queryFn: () => mypageApi.getMe(clubId).then((res) => res.data.data),
    enabled: Boolean(clubId),
    staleTime: MYPAGE_ME_STALE_TIME,
    gcTime: MYPAGE_ME_GC_TIME,
  });
}
