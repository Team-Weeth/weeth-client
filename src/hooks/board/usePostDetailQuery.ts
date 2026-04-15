import { useQuery } from '@tanstack/react-query';
import { boardApi } from '@/lib/apis/board';
import { useClubId } from '@/stores/useClubStore';
import { BOARD_STALE_TIME, BOARD_GC_TIME } from '@/constants/board/type';
import type { PostDetail } from '@/types/board';

export function usePostDetailQuery(postId: number, initialData?: PostDetail) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['posts', 'detail', postId],
    queryFn: () => boardApi.getPostById(clubId!, postId).then((res) => res.data.data),
    initialData,
    enabled: !!clubId,
    staleTime: BOARD_STALE_TIME,
    gcTime: BOARD_GC_TIME,
  });
}
