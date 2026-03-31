import { useQuery } from '@tanstack/react-query';
import { boardApi } from '@/lib/apis/board';
import { useClubId } from '@/stores/useClubStore';

const BOARD_STALE_TIME = 5 * 60 * 1000;
const BOARD_GC_TIME = 10 * 60 * 1000;

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
 * TODO: 게시판 type 추가 예정
 */
export function useBoardPosts(
  activeBoardId: number | null,
  params?: { pageNumber?: number; pageSize?: number },
) {
  const clubId = useClubId();
  const isAll = activeBoardId === null;

  return useQuery({
    queryKey: isAll ? ['posts', clubId, params] : ['posts', clubId, activeBoardId, params],
    queryFn: () =>
      isAll
        ? boardApi.getAllPosts(clubId!, params)
        : boardApi.getPosts(clubId!, activeBoardId, params),
    select: (response) => response.data.data,
    enabled: !!clubId,
    staleTime: BOARD_STALE_TIME,
    gcTime: BOARD_GC_TIME,
  });
}

