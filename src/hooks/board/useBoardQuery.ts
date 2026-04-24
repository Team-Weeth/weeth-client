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
    refetchOnMount: 'always',
    staleTime: BOARD_STALE_TIME,
    gcTime: BOARD_GC_TIME,
  });
}

/** NOTICE 타입 게시판의 ID를 반환 (대시보드 API에 boardId가 없을 때 사용) */
export function useNoticeBoardId() {
  const { data } = useBoardList();
  return data?.find((b) => b.type === 'NOTICE')?.id ?? undefined;
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
