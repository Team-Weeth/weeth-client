import { useInfiniteQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';

const MYPAGE_PENALTIES_PAGE_SIZE = 5;

/** 기수 단위로만 조회한다. cardinalNumber가 정해지기 전에는 요청하지 않는다. */
export function useMyPagePenaltiesQuery(clubId: string, cardinalNumber: number | null) {
  return useInfiniteQuery({
    queryKey: ['mypage', 'penalties', clubId, cardinalNumber],
    queryFn: ({ pageParam }) =>
      mypageApi
        .getMyPenalties(clubId, {
          pageNumber: pageParam,
          pageSize: MYPAGE_PENALTIES_PAGE_SIZE,
          ...(cardinalNumber !== null && { cardinalNumber }),
        })
        .then((res) => res.data.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.penalties.hasNext ? lastPage.penalties.pageNumber + 1 : undefined,
    // 집계는 페이지마다 동일하게 내려오므로 첫 페이지 값을 사용한다.
    select: (data) => ({
      penalties: data.pages.flatMap((page) => page.penalties.content),
      penaltyCount: data.pages[0]?.penaltyCount ?? null,
      warningCount: data.pages[0]?.warningCount ?? null,
    }),
    // 기수를 바꾸는 동안 이전 결과를 유지한다.
    placeholderData: (previousData) => previousData,
    enabled: Boolean(clubId) && cardinalNumber !== null,
  });
}
