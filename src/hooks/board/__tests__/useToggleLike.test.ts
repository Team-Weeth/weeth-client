import { renderHook, act, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import type { InfiniteData } from '@tanstack/react-query';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useToggleLike } from '@/hooks/board/useToggleLike';
import { boardApi } from '@/lib/apis/board';
import { toast } from '@/stores/useToastStore';
import { useClubId } from '@/stores/useClubStore';
import type { PostDetail, PostListItem, PostLike, PostLikeResponse } from '@/types/board';
import type { ApiResponse } from '@/types/common';
import type { PageData, RecentPost } from '@/types/home';

jest.mock('@/lib/apis/board', () => ({
  boardApi: { addLike: jest.fn(), removeLike: jest.fn() },
}));

jest.mock('@/stores/useToastStore', () => ({
  toast: jest.fn(),
}));

jest.mock('@/stores/useClubStore', () => ({
  useClubId: jest.fn(),
}));

type ListData = InfiniteData<AxiosResponse<ApiResponse<{ content: PostListItem[] }>>>;
type HomeData = InfiniteData<PageData<RecentPost>>;

const mockAddLike = boardApi.addLike as jest.Mock;
const mockRemoveLike = boardApi.removeLike as jest.Mock;
const mockToast = toast as jest.Mock;
const mockUseClubId = useClubId as jest.Mock;

const CLUB_ID = 'club-1';
const BOARD_ID = 10;
const POST_ID = 42;

const detailKey = ['posts', 'detail', CLUB_ID, BOARD_ID, POST_ID] as const;
const listKey = ['posts', CLUB_ID] as const;
const homePostsKey = ['home', 'recent-posts', CLUB_ID] as const;

function makeLikeResponse(
  isLiked: boolean,
  likeCount: number,
): AxiosResponse<ApiResponse<PostLikeResponse>> {
  return {
    data: { code: 200, message: 'OK', data: { isLiked, likeCount, boardId: BOARD_ID } },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as unknown as InternalAxiosRequestConfig,
  };
}

function makePostDetail(like: PostLike): PostDetail {
  return {
    id: POST_ID,
    author: { id: 1, name: '작성자', profileImageUrl: '', role: 'USER' },
    boardId: BOARD_ID,
    boardName: '자유게시판',
    title: '테스트 게시글',
    content: '내용',
    time: '2024-01-01',
    commentCount: 0,
    like,
    comments: [],
    fileUrls: [],
  };
}

function makePostListItem(like: PostLike): PostListItem {
  return {
    id: POST_ID,
    author: { id: 1, name: '작성자', profileImageUrl: '', role: 'USER' },
    boardId: BOARD_ID,
    boardName: '자유게시판',
    title: '테스트 게시글',
    content: '내용',
    time: '2024-01-01',
    commentCount: 0,
    like,
    fileUrls: [],
    isNew: false,
  };
}

function makeListData(items: PostListItem[]): ListData {
  return {
    pages: [
      {
        data: { code: 200, message: 'OK', data: { content: items } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as unknown as InternalAxiosRequestConfig,
      },
    ],
    pageParams: [null],
  };
}

function makeHomeData(posts: RecentPost[]): HomeData {
  return {
    pages: [
      {
        size: posts.length,
        content: posts,
        number: 0,
        sort: { empty: false, unsorted: true, sorted: false },
        pageable: {
          offset: 0,
          sort: { empty: false, unsorted: true, sorted: false },
          pageNumber: 0,
          pageSize: 10,
          paged: true,
          unpaged: false,
        },
        numberOfElements: posts.length,
        first: true,
        last: true,
        empty: posts.length === 0,
      },
    ],
    pageParams: [null],
  };
}

function makeRecentPost(like: PostLike): RecentPost {
  return {
    id: POST_ID,
    boardId: BOARD_ID,
    author: { id: 1, name: '작성자', profileImageUrl: null, role: 'USER' as const },
    title: '테스트 게시글',
    content: '내용',
    time: '2024-01-01',
    commentCount: 0,
    like,
    fileUrls: [],
    isNew: false,
  };
}

function makeAxiosError(code: number): AxiosError<{ code: number }> {
  return new AxiosError<{ code: number }>(
    'Request failed',
    String(code),
    {} as unknown as InternalAxiosRequestConfig,
    undefined,
    {
      data: { code },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as unknown as InternalAxiosRequestConfig,
    },
  );
}

const defaultParams = { postId: POST_ID, boardId: BOARD_ID };

describe('useToggleLike', () => {
  beforeEach(() => {
    mockUseClubId.mockReturnValue(CLUB_ID);
    jest.clearAllMocks();
  });

  describe('초기값', () => {
    it('캐시가 없으면 initialIsLiked·initialLikeCount 폴백을 반환한다', () => {
      const queryClient = createQueryClient();
      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: true, initialLikeCount: 7 }),
        { wrapper: createWrapper(queryClient) },
      );

      expect(result.current.isLiked).toBe(true);
      expect(result.current.likeCount).toBe(7);
      expect(result.current.isPending).toBe(false);
    });

    it('캐시가 있으면 initialIsLiked·initialLikeCount보다 캐시 값을 우선 반환한다', () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData(detailKey, makePostDetail({ isLiked: true, likeCount: 3 }));

      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false, initialLikeCount: 0 }),
        { wrapper: createWrapper(queryClient) },
      );

      expect(result.current.isLiked).toBe(true);
      expect(result.current.likeCount).toBe(3);
    });
  });

  describe('toggleLike 가드', () => {
    it('clubId가 null이면 API를 호출하지 않는다', () => {
      mockUseClubId.mockReturnValue(null);
      const queryClient = createQueryClient();
      const { result } = renderHook(() => useToggleLike(defaultParams), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        result.current.toggleLike();
      });

      expect(mockAddLike).not.toHaveBeenCalled();
      expect(mockRemoveLike).not.toHaveBeenCalled();
    });

    it('isPending 중에는 추가 toggleLike 호출을 무시한다', async () => {
      let resolve!: (v: unknown) => void;
      mockAddLike.mockReturnValue(new Promise((r) => (resolve = r)));

      const queryClient = createQueryClient();
      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });
      await waitFor(() => expect(result.current.isPending).toBe(true));

      act(() => {
        result.current.toggleLike();
      });

      expect(mockAddLike).toHaveBeenCalledTimes(1);

      resolve(makeLikeResponse(true, 1));
      await waitFor(() => expect(result.current.isPending).toBe(false));
    });
  });

  describe('API 호출 방향', () => {
    it('isLiked=false이면 addLike를 호출한다', async () => {
      mockAddLike.mockResolvedValue(makeLikeResponse(true, 1));
      const queryClient = createQueryClient();
      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));
      expect(mockAddLike).toHaveBeenCalledWith(CLUB_ID, BOARD_ID, POST_ID);
      expect(mockRemoveLike).not.toHaveBeenCalled();
    });

    it('isLiked=true이면 removeLike를 호출한다', async () => {
      mockRemoveLike.mockResolvedValue(makeLikeResponse(false, 0));
      const queryClient = createQueryClient();
      queryClient.setQueryData(detailKey, makePostDetail({ isLiked: true, likeCount: 1 }));

      const { result } = renderHook(() => useToggleLike(defaultParams), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));
      expect(mockRemoveLike).toHaveBeenCalledWith(CLUB_ID, BOARD_ID, POST_ID);
      expect(mockAddLike).not.toHaveBeenCalled();
    });
  });

  describe('낙관적 업데이트 (onMutate)', () => {
    it('toggleLike 호출 후 detailKey 캐시가 즉시 반전된다', async () => {
      let resolve!: (v: unknown) => void;
      mockAddLike.mockReturnValue(new Promise((r) => (resolve = r)));

      const queryClient = createQueryClient();
      queryClient.setQueryData(detailKey, makePostDetail({ isLiked: false, likeCount: 2 }));

      const { result } = renderHook(() => useToggleLike(defaultParams), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => {
        const cached = queryClient.getQueryData<PostDetail>(detailKey);
        expect(cached?.like.isLiked).toBe(true);
        expect(cached?.like.likeCount).toBe(3);
      });

      resolve(makeLikeResponse(true, 3));
      await waitFor(() => expect(result.current.isPending).toBe(false));
    });

    it('toggleLike 호출 후 listKey 캐시의 해당 게시글 like가 반전된다', async () => {
      let resolve!: (v: unknown) => void;
      mockAddLike.mockReturnValue(new Promise((r) => (resolve = r)));

      const queryClient = createQueryClient();
      queryClient.setQueryData(
        listKey,
        makeListData([makePostListItem({ isLiked: false, likeCount: 0 })]),
      );

      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => {
        const cached = queryClient.getQueryData<ListData>(listKey);
        const item = cached?.pages[0].data.data.content.find((p) => p.id === POST_ID);
        expect(item?.like.isLiked).toBe(true);
        expect(item?.like.likeCount).toBe(1);
      });

      resolve(makeLikeResponse(true, 1));
      await waitFor(() => expect(result.current.isPending).toBe(false));
    });

    it('toggleLike 호출 후 homePostsKey 캐시의 해당 게시글 like가 반전된다', async () => {
      let resolve!: (v: unknown) => void;
      mockAddLike.mockReturnValue(new Promise((r) => (resolve = r)));

      const queryClient = createQueryClient();
      queryClient.setQueryData(
        homePostsKey,
        makeHomeData([makeRecentPost({ isLiked: false, likeCount: 1 })]),
      );

      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => {
        const cached = queryClient.getQueryData<HomeData>(homePostsKey);
        const post = cached?.pages[0].content.find((p) => p.id === POST_ID);
        expect(post?.like.isLiked).toBe(true);
        expect(post?.like.likeCount).toBe(2);
      });

      resolve(makeLikeResponse(true, 2));
      await waitFor(() => expect(result.current.isPending).toBe(false));
    });
  });

  describe('서버 응답 반영 (onSuccess)', () => {
    it('API 성공 후 detailKey 캐시가 서버 값으로 덮어써진다', async () => {
      mockAddLike.mockResolvedValue(makeLikeResponse(true, 5));
      const queryClient = createQueryClient();
      queryClient.setQueryData(detailKey, makePostDetail({ isLiked: false, likeCount: 4 }));

      const { result } = renderHook(() => useToggleLike(defaultParams), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      const cached = queryClient.getQueryData<PostDetail>(detailKey);
      expect(cached?.like.isLiked).toBe(true);
      expect(cached?.like.likeCount).toBe(5);
    });

    it('API 성공 후 listKey 캐시가 서버 값으로 덮어써진다', async () => {
      mockAddLike.mockResolvedValue(makeLikeResponse(true, 10));
      const queryClient = createQueryClient();
      queryClient.setQueryData(
        listKey,
        makeListData([makePostListItem({ isLiked: false, likeCount: 9 })]),
      );

      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      const cached = queryClient.getQueryData<ListData>(listKey);
      const item = cached?.pages[0].data.data.content.find((p) => p.id === POST_ID);
      expect(item?.like.isLiked).toBe(true);
      expect(item?.like.likeCount).toBe(10);
    });

    it('API 성공 후 homePostsKey 캐시가 서버 값으로 덮어써진다', async () => {
      mockAddLike.mockResolvedValue(makeLikeResponse(true, 7));
      const queryClient = createQueryClient();
      queryClient.setQueryData(
        homePostsKey,
        makeHomeData([makeRecentPost({ isLiked: false, likeCount: 6 })]),
      );

      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      const cached = queryClient.getQueryData<HomeData>(homePostsKey);
      const post = cached?.pages[0].content.find((p) => p.id === POST_ID);
      expect(post?.like.isLiked).toBe(true);
      expect(post?.like.likeCount).toBe(7);
    });
  });

  describe('롤백 (onError)', () => {
    it('API 실패 시 detailKey 캐시가 이전 값으로 복원된다', async () => {
      mockAddLike.mockRejectedValue(new Error('network error'));
      const queryClient = createQueryClient();
      queryClient.setQueryData(detailKey, makePostDetail({ isLiked: false, likeCount: 2 }));

      const { result } = renderHook(() => useToggleLike(defaultParams), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      const cached = queryClient.getQueryData<PostDetail>(detailKey);
      expect(cached?.like.isLiked).toBe(false);
      expect(cached?.like.likeCount).toBe(2);
    });

    it('API 실패 시 listKey 캐시가 이전 값으로 복원된다', async () => {
      mockAddLike.mockRejectedValue(new Error('network error'));
      const queryClient = createQueryClient();
      queryClient.setQueryData(
        listKey,
        makeListData([makePostListItem({ isLiked: false, likeCount: 0 })]),
      );

      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      const cached = queryClient.getQueryData<ListData>(listKey);
      const item = cached?.pages[0].data.data.content.find((p) => p.id === POST_ID);
      expect(item?.like.isLiked).toBe(false);
      expect(item?.like.likeCount).toBe(0);
    });

    it('API 실패 시 homePostsKey 캐시가 이전 값으로 복원된다', async () => {
      mockAddLike.mockRejectedValue(new Error('network error'));
      const queryClient = createQueryClient();
      queryClient.setQueryData(
        homePostsKey,
        makeHomeData([makeRecentPost({ isLiked: false, likeCount: 3 })]),
      );

      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      const cached = queryClient.getQueryData<HomeData>(homePostsKey);
      const post = cached?.pages[0].content.find((p) => p.id === POST_ID);
      expect(post?.like.isLiked).toBe(false);
      expect(post?.like.likeCount).toBe(3);
    });

    it('알려진 에러 코드이면 toast를 호출한다', async () => {
      mockAddLike.mockRejectedValue(makeAxiosError(20413));
      const queryClient = createQueryClient();

      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      expect(mockToast).toHaveBeenCalledWith({
        title: '잠시 후 다시 시도해주세요',
        variant: 'error',
      });
    });

    it('알려지지 않은 에러 코드이면 toast를 호출하지 않는다', async () => {
      mockAddLike.mockRejectedValue(makeAxiosError(99999));
      const queryClient = createQueryClient();

      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      expect(mockToast).not.toHaveBeenCalled();
    });

    it('Axios 에러가 아니면 toast를 호출하지 않는다', async () => {
      mockAddLike.mockRejectedValue(new Error('일반 에러'));
      const queryClient = createQueryClient();

      const { result } = renderHook(
        () => useToggleLike({ ...defaultParams, initialIsLiked: false }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.toggleLike();
      });

      await waitFor(() => expect(result.current.isPending).toBe(false));

      expect(mockToast).not.toHaveBeenCalled();
    });
  });
});
