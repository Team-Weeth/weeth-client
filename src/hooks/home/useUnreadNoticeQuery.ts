import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

const UNREAD_NOTICE_STALE_TIME = 60 * 1000;
const UNREAD_NOTICE_GC_TIME = 10 * 60 * 1000;

export function useUnreadNoticeQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', 'unread-notice', clubId],
    queryFn: () => homeApi.getUnreadNotice(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: UNREAD_NOTICE_STALE_TIME,
    gcTime: UNREAD_NOTICE_GC_TIME,
  });
}
