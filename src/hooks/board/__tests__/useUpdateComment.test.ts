import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateComment } from '@/hooks/board/useUpdateComment';
import { commentApi } from '@/lib/apis/comment';

jest.mock('@/lib/apis/comment', () => ({
  commentApi: { update: jest.fn() },
}));

jest.mock('@/stores', () => ({
  useClubId: jest.fn(() => 'club-1'),
}));

jest.mock('@/stores/useToastStore', () => ({
  toast: jest.fn(),
}));

const mockUpdate = commentApi.update as jest.Mock;
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

describe('useUpdateComment', () => {
  describe('반환값', () => {
    it('성공 시 true를 반환한다', async () => {
      mockUpdate.mockResolvedValue({ data: { code: 200 } });
      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdateComment(BOARD_ID, POST_ID), {
        wrapper: createWrapper(queryClient),
      });

      let returned: boolean;
      await act(async () => {
        returned = await result.current.updateComment(COMMENT_ID, '수정된 내용');
      });

      expect(returned!).toBe(true);
    });

    it('실패 시 false를 반환하고 예외를 던지지 않는다', async () => {
      mockUpdate.mockRejectedValue(new Error('network error'));
      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdateComment(BOARD_ID, POST_ID), {
        wrapper: createWrapper(queryClient),
      });

      let returned: boolean;
      await act(async () => {
        returned = await result.current.updateComment(COMMENT_ID, '수정된 내용');
      });

      expect(returned!).toBe(false);
    });

    it('isPending 중에는 false를 반환하고 API를 한 번만 호출한다', async () => {
      let resolve!: (v: unknown) => void;
      mockUpdate.mockReturnValue(new Promise((r) => (resolve = r)));

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdateComment(BOARD_ID, POST_ID), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        void result.current.updateComment(COMMENT_ID, '첫 번째 수정');
      });
      await waitFor(() => expect(result.current.isPending).toBe(true));

      let returned: boolean;
      await act(async () => {
        returned = await result.current.updateComment(COMMENT_ID, '두 번째 수정');
      });

      expect(returned!).toBe(false);
      expect(mockUpdate).toHaveBeenCalledTimes(1);

      act(() => {
        resolve({ data: { code: 200 } });
      });
      await waitFor(() => expect(result.current.isPending).toBe(false));
    });
  });

  describe('API 호출 인자', () => {
    it('commentApi.update를 올바른 인자로 호출한다', async () => {
      mockUpdate.mockResolvedValue({ data: { code: 200 } });
      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdateComment(BOARD_ID, POST_ID), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.updateComment(COMMENT_ID, '수정된 내용');
      });

      expect(mockUpdate).toHaveBeenCalledWith(POST_ID, COMMENT_ID, {
        content: '수정된 내용',
        files: null,
      });
    });
  });
});
