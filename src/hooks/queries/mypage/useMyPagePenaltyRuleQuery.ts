import { useQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';

export function useMyPagePenaltyRuleQuery(clubId: string) {
  return useQuery({
    queryKey: ['mypage', 'penaltyRule', clubId],
    queryFn: () => mypageApi.getPenaltyRule(clubId).then((res) => res.data.data.content),
    enabled: Boolean(clubId),
  });
}
