import { useQuery } from '@tanstack/react-query';
import { boardApi } from '@/lib/apis/board';
import { useClubId } from '@/stores/useClubStore';
import { BOARD_STALE_TIME, BOARD_GC_TIME } from '@/constants/board/type';

export function usePostDetailQuery(postId: number) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['posts', postId],
    queryFn: () => boardApi.getPostById(clubId!, postId).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: BOARD_STALE_TIME,
    gcTime: BOARD_GC_TIME,
  });
}
