import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '@/lib/apis/board';
import { useClubId } from '@/stores/useClubStore';
import type { PostDetail, PostListItem } from '@/types/board';
import type { ApiResponse } from '@/types/common';
import type { InfiniteData } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

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
  const queryClient = useQueryClient();

  const detailKey = ['posts', 'detail', clubId, postId] as const;

  const mutation = useMutation({
    mutationFn: () => boardApi.toggleLike(clubId!, postId),
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey }),
        queryClient.cancelQueries({ queryKey: ['posts', clubId], type: 'all' }),
      ]);

      const previousDetail = queryClient.getQueryData<PostDetail>(detailKey);

      queryClient.setQueryData<PostDetail>(detailKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          like: {
            isLiked: !old.like.isLiked,
            likeCount: old.like.isLiked ? old.like.likeCount - 1 : old.like.likeCount + 1,
          },
        };
      });

      return { previousDetail };
    },
    onSuccess: (res) => {
      const serverLike = res.data.data;

      queryClient.setQueryData<PostDetail>(detailKey, (old) => {
        if (!old) return old;
        return { ...old, like: serverLike };
      });

      queryClient.setQueriesData<
        InfiniteData<AxiosResponse<ApiResponse<{ content: PostListItem[] }>>>
      >({ queryKey: ['posts', clubId], type: 'all' }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              data: {
                ...page.data.data,
                content: page.data.data.content.map((item) =>
                  item.id === postId ? { ...item, like: serverLike } : item,
                ),
              },
            },
          })),
        };
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }
    },
  });

  const detail = queryClient.getQueryData<PostDetail>(detailKey);
  const isLiked = detail?.like.isLiked ?? initialIsLiked;
  const likeCount = detail?.like.likeCount ?? initialLikeCount;

  const toggleLike = () => {
    if (!clubId || mutation.isPending) return;
    mutation.mutate();
  };

  return { isLiked, likeCount, toggleLike, isPending: mutation.isPending };
}

export { useToggleLike, type UseToggleLikeParams };
