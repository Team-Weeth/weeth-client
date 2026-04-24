import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '@/lib/apis/board';
import { useClubId } from '@/stores/useClubStore';
import type { PostDetail, PostListItem, PostLike } from '@/types/board';
import type { PageData, RecentPost } from '@/types/home';
import type { ApiResponse } from '@/types/common';
import type { InfiniteData } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

interface UseToggleLikeParams {
  postId: number;
  initialIsLiked?: boolean;
  initialLikeCount?: number;
}

type ListData = InfiniteData<AxiosResponse<ApiResponse<{ content: PostListItem[] }>>>;
type HomeData = InfiniteData<PageData<RecentPost>>;

function toggledLike(like: PostLike): PostLike {
  return {
    isLiked: !like.isLiked,
    likeCount: like.isLiked ? like.likeCount - 1 : like.likeCount + 1,
  };
}

function updateListPages(
  old: ListData | undefined,
  postId: number,
  updater: (like: PostLike) => PostLike,
) {
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
            item.id === postId ? { ...item, like: updater(item.like) } : item,
          ),
        },
      },
    })),
  };
}

function updateHomePages(
  old: HomeData | undefined,
  postId: number,
  updater: (like: PostLike) => PostLike,
) {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      content: page.content.map((item) =>
        item.id === postId ? { ...item, like: updater(item.like) } : item,
      ),
    })),
  };
}

function useToggleLike({
  postId,
  initialIsLiked = false,
  initialLikeCount = 0,
}: UseToggleLikeParams) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  const detailKey = ['posts', 'detail', clubId, postId] as const;
  const listKey = ['posts', clubId] as const;
  const homePostsKey = ['home', 'recent-posts', clubId] as const;

  const mutation = useMutation({
    mutationFn: (wasLiked: boolean) =>
      wasLiked ? boardApi.removeLike(clubId!, postId) : boardApi.addLike(clubId!, postId),
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey }),
        queryClient.cancelQueries({ queryKey: listKey, type: 'all' }),
        queryClient.cancelQueries({ queryKey: homePostsKey }),
      ]);

      const previousDetail = queryClient.getQueryData<PostDetail>(detailKey);
      const previousHomePosts = queryClient.getQueryData<HomeData>(homePostsKey);
      const previousList = queryClient.getQueriesData<ListData>({
        queryKey: listKey,
        type: 'all',
      });

      queryClient.setQueryData<PostDetail>(detailKey, (old) => {
        if (!old) return old;
        return { ...old, like: toggledLike(old.like) };
      });

      queryClient.setQueriesData<ListData>({ queryKey: listKey, type: 'all' }, (old) =>
        updateListPages(old, postId, toggledLike),
      );

      queryClient.setQueryData<HomeData>(homePostsKey, (old) =>
        updateHomePages(old, postId, toggledLike),
      );

      return { previousDetail, previousHomePosts, previousList };
    },
    onSuccess: (res) => {
      const serverLike = res.data.data;
      const replace = () => serverLike;

      queryClient.setQueryData<PostDetail>(detailKey, (old) => {
        if (!old) return old;
        return { ...old, like: serverLike };
      });

      queryClient.setQueriesData<ListData>({ queryKey: listKey, type: 'all' }, (old) =>
        updateListPages(old, postId, replace),
      );

      queryClient.setQueryData<HomeData>(homePostsKey, (old) =>
        updateHomePages(old, postId, replace),
      );
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }
      if (context?.previousList) {
        for (const [key, data] of context.previousList) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.previousHomePosts) {
        queryClient.setQueryData(homePostsKey, context.previousHomePosts);
      }
    },
  });

  const detail = queryClient.getQueryData<PostDetail>(detailKey);
  const isLiked = detail?.like.isLiked ?? initialIsLiked;
  const likeCount = detail?.like.likeCount ?? initialLikeCount;

  const toggleLike = () => {
    if (!clubId || mutation.isPending) return;
    mutation.mutate(isLiked);
  };

  return { isLiked, likeCount, toggleLike, isPending: mutation.isPending };
}

export { useToggleLike, type UseToggleLikeParams };
