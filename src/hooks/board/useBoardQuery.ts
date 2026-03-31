import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { boardApi } from '@/lib/apis/board';
import { useClubId } from '@/stores/useClubStore';

const BOARD_STALE_TIME = 5 * 60 * 1000;
const BOARD_GC_TIME = 10 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 10;

const TYPE_ORDER = { NOTICE: 0, ALL: 1, GENERAL: 2 } as const;

export function useBoardList() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['boards', clubId],
    queryFn: () => boardApi.getBoards(clubId!),
    select: (response) =>
      [...response.data.data].sort(
        (a, b) => (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99),
      ),
    enabled: !!clubId,
    staleTime: BOARD_STALE_TIME,
    gcTime: BOARD_GC_TIME,
  });
}

/**
 * activeBoardId가 null이면 전체 게시글, 아니면 게시판별 게시글 조회.
 * useInfiniteQuery로 무한스크롤 지원.
 */
export function useBoardPosts(activeBoardId: number | null) {
  const clubId = useClubId();
  const isAll = activeBoardId === null;

  return useInfiniteQuery({
    queryKey: isAll ? ['posts', clubId] : ['posts', clubId, activeBoardId],
    queryFn: ({ pageParam }) => {
      const params = { pageNumber: pageParam, pageSize: DEFAULT_PAGE_SIZE };
      return isAll
        ? boardApi.getAllPosts(clubId!, params)
        : boardApi.getPosts(clubId!, activeBoardId, params);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const slice = lastPage.data.data;
      return slice.last ? undefined : slice.number + 1;
    },
    select: (data) => data.pages.flatMap((page) => page.data.data.content),
    enabled: !!clubId,
    staleTime: BOARD_STALE_TIME,
    gcTime: BOARD_GC_TIME,
  });
}
