import { useState } from 'react';
import { boardApi } from '@/lib/apis/board';
import { useClubId } from '@/stores/useClubStore';

interface UseToggleLikeParams {
  postId: number;
  initialIsLiked?: boolean;
  initialLikeCount?: number;
}

function useToggleLike({
  postId,
  initialIsLiked = false,
  initialLikeCount = 0,
}: UseToggleLikeParams) {
  const clubId = useClubId();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, setIsPending] = useState(false);

  const toggleLike = async () => {
    if (!clubId || isPending) return;

    const prevIsLiked = isLiked;
    const prevLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsPending(true);

    try {
      const res = await boardApi.toggleLike(clubId, postId);
      const { isLiked: serverIsLiked, likeCount: serverLikeCount } = res.data.data;
      setIsLiked(serverIsLiked);
      setLikeCount(serverLikeCount);
    } catch {
      setIsLiked(prevIsLiked);
      setLikeCount(prevLikeCount);
    } finally {
      setIsPending(false);
    }
  };

  return { isLiked, likeCount, toggleLike, isPending };
}

export { useToggleLike, type UseToggleLikeParams };
