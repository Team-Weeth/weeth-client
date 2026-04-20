import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

export function useUnreadNoticeQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', 'unread-notice', clubId],
    queryFn: () => homeApi.getUnreadNotice(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: 0,
    refetchOnMount: 'always', // 홈으로 돌아올 때 읽음 상태 반영
  });
}
