import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeleteComment } from '@/hooks/board/useDeleteComment';
import { commentApi } from '@/lib/apis/comment';

jest.mock('@/lib/apis/comment', () => ({
  commentApi: { delete: jest.fn() },
}));

jest.mock('@/stores', () => ({
  useClubId: jest.fn(() => 'club-1'),
}));

jest.mock('@/stores/useToastStore', () => ({
  toast: jest.fn(),
}));

const mockDelete = commentApi.delete as jest.Mock;
const BOARD_ID = 10;
const POST_ID = 42;
const COMMENT_ID = 7;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useDeleteComment', () => {
  it('commentApi.delete를 postId·commentId로 호출한다', async () => {
    mockDelete.mockResolvedValue({ data: { code: 200 } });
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useDeleteComment(BOARD_ID, POST_ID), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.deleteComment(COMMENT_ID);
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(mockDelete).toHaveBeenCalledWith(POST_ID, COMMENT_ID);
  });

  it('isPending 중에는 추가 deleteComment 호출을 무시한다', async () => {
    let resolve!: (v: unknown) => void;
    mockDelete.mockReturnValue(new Promise((r) => (resolve = r)));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useDeleteComment(BOARD_ID, POST_ID), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.deleteComment(COMMENT_ID);
    });
    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => {
      result.current.deleteComment(COMMENT_ID);
    });

    expect(mockDelete).toHaveBeenCalledTimes(1);

    act(() => {
      resolve({ data: { code: 200 } });
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));
  });
});
