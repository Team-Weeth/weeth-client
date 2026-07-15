import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBoardList, useBoardPosts } from '@/hooks/board/useBoardQuery';
import { boardApi } from '@/lib/apis/board';
import { useClubId } from '@/stores/useClubStore';

jest.mock('@/lib/apis/board', () => ({
  boardApi: {
    getBoards: jest.fn(),
    getAllPosts: jest.fn(),
    getPosts: jest.fn(),
  },
}));

jest.mock('@/stores/useClubStore', () => ({
  useClubId: jest.fn(() => 'club-1'),
}));

const mockGetBoards = boardApi.getBoards as jest.Mock;
const mockGetAllPosts = boardApi.getAllPosts as jest.Mock;
const mockGetPosts = boardApi.getPosts as jest.Mock;
const mockUseClubId = useClubId as jest.Mock;

beforeEach(() => {
  mockUseClubId.mockReturnValue('club-1');
});

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useBoardList', () => {
  it('clubId가 없으면 API를 호출하지 않는다', () => {
    mockUseClubId.mockReturnValue(null);
    const queryClient = createQueryClient();
    renderHook(() => useBoardList(), { wrapper: createWrapper(queryClient) });
    expect(mockGetBoards).not.toHaveBeenCalled();
  });

  it('boardApi.getBoards를 clubId로 호출한다', async () => {
    mockGetBoards.mockResolvedValue({ data: { data: [] } });
    const queryClient = createQueryClient();
    renderHook(() => useBoardList(), { wrapper: createWrapper(queryClient) });
    await waitFor(() => expect(mockGetBoards).toHaveBeenCalledWith('club-1'));
  });

  it('boards를 BOARD_TYPE_ORDER에 따라 정렬한다', async () => {
    mockGetBoards.mockResolvedValue({
      data: {
        data: [
          { id: 3, name: '자유게시판', type: 'GENERAL' },
          { id: null, name: '전체', type: 'ALL' },
          { id: 2, name: '공지사항', type: 'NOTICE' },
        ],
      },
    });

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useBoardList(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      { id: null, name: '전체', type: 'ALL' },
      { id: 2, name: '공지사항', type: 'NOTICE' },
      { id: 3, name: '자유게시판', type: 'GENERAL' },
    ]);
  });
});

describe('useBoardPosts', () => {
  describe('activeBoardId=null (전체 게시글)', () => {
    it('boardApi.getAllPosts를 호출하고 getPosts는 호출하지 않는다', async () => {
      mockGetAllPosts.mockResolvedValue({
        data: { data: { content: [], last: true, number: 0 } },
      });

      const queryClient = createQueryClient();
      renderHook(() => useBoardPosts(null), { wrapper: createWrapper(queryClient) });

      await waitFor(() => expect(mockGetAllPosts).toHaveBeenCalled());
      expect(mockGetPosts).not.toHaveBeenCalled();
    });
  });

  describe('activeBoardId=10 (특정 게시판)', () => {
    it('boardApi.getPosts를 호출하고 getAllPosts는 호출하지 않는다', async () => {
      mockGetPosts.mockResolvedValue({
        data: { data: { content: [], last: true, number: 0 } },
      });

      const queryClient = createQueryClient();
      renderHook(() => useBoardPosts(10), { wrapper: createWrapper(queryClient) });

      await waitFor(() => expect(mockGetPosts).toHaveBeenCalled());
      expect(mockGetAllPosts).not.toHaveBeenCalled();
    });
  });

  it('select로 pages를 flat한 PostListItem 배열로 변환한다', async () => {
    const post1 = { id: 1, title: '게시글1' };
    const post2 = { id: 2, title: '게시글2' };
    mockGetAllPosts.mockResolvedValue({
      data: { data: { content: [post1, post2], last: true, number: 0 } },
    });

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useBoardPosts(null), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([post1, post2]);
  });

  it('last=false이면 hasNextPage가 true다', async () => {
    mockGetAllPosts.mockResolvedValue({
      data: { data: { content: [], last: false, number: 0 } },
    });

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useBoardPosts(null), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('last=true이면 hasNextPage가 false다', async () => {
    mockGetAllPosts.mockResolvedValue({
      data: { data: { content: [], last: true, number: 0 } },
    });

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useBoardPosts(null), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('clubId가 없으면 API를 호출하지 않는다', () => {
    mockUseClubId.mockReturnValue(null);
    const queryClient = createQueryClient();
    renderHook(() => useBoardPosts(null), { wrapper: createWrapper(queryClient) });
    expect(mockGetAllPosts).not.toHaveBeenCalled();
  });
});
