import { useQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';

// 목록 API에 집계 필드가 없어 전체 페이지의 기록 건수를 계산한다.
// 백엔드에서 총횟수를 지원하면 집계 응답으로 대체한다.
export function useMyPagePenaltyCountsQuery(clubId: string) {
  return useQuery({
    queryKey: ['mypage', 'penalty-counts', clubId],
    enabled: Boolean(clubId),
    queryFn: async ({ signal }) => {
      let pageNumber = 0;
      let penaltyCount = 0;
      let warningCount = 0;
      const seen = new Set<number>();
      while (true) {
        signal.throwIfAborted();
        const { data: response } = await mypageApi.getMyPenalties(clubId, {
          pageNumber,
          pageSize: 100,
        });
        for (const record of response.data.content) {
          if (seen.has(record.penaltyId)) continue;
          seen.add(record.penaltyId);
          if (record.penaltyType === 'WARNING') warningCount++;
          else penaltyCount++;
        }
        if (!response.data.hasNext) break;
        pageNumber++;
      }
      return { penaltyCount, warningCount };
    },
  });
}
