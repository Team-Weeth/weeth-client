import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { boardApi } from '@/lib/apis/board';
import {
  BOARD_TYPE_ORDER,
  BOARD_STALE_TIME,
  BOARD_GC_TIME,
  DEFAULT_PAGE_SIZE,
} from '@/constants/board/type';
import { useClubId } from '@/stores/useClubStore';

export function useBoardList() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['boards', clubId],
    queryFn: () => boardApi.getBoards(clubId!),
    select: (response) =>
      [...response.data.data].sort(
        (a, b) => (BOARD_TYPE_ORDER[a.type] ?? 99) - (BOARD_TYPE_ORDER[b.type] ?? 99),
      ),
    enabled: !!clubId,
    staleTime: BOARD_STALE_TIME,
    gcTime: BOARD_GC_TIME,
  });
}

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
      const slice = lastPage.data?.data;
      if (!slice) return undefined;
      return slice.last ? undefined : slice.number + 1;
    },
    select: (data) => data.pages.flatMap((page) => page.data?.data?.content ?? []),
    enabled: !!clubId,
    staleTime: BOARD_STALE_TIME,
    gcTime: BOARD_GC_TIME,
  });
}
