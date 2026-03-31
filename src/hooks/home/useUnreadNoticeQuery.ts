import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

export function useUnreadNoticeQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', 'unread-notice', clubId],
    queryFn: () => homeApi.getUnreadNotice(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: 0, // 공지 읽음 상태가 변경될 수 있어 항상 최신 데이터 조회
  });
}
