import { useQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';

export function useMyPagePenaltyRuleQuery(clubId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['mypage', 'penaltyRule', clubId],
    // null을 여기서 흡수해, 소비하는 쪽은 항상 문자열만 다루면 되도록 한다
    queryFn: () => mypageApi.getPenaltyRule(clubId).then((res) => res.data.data.content ?? ''),
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}
