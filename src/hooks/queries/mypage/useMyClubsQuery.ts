import { useQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';

export function useMyClubsQuery() {
  return useQuery({
    queryKey: ['mypage', 'clubs'],
    queryFn: () => mypageApi.getMyClubs().then((res) => res.data.data),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
