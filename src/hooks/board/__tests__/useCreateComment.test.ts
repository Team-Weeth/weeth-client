import { renderHook, act, waitFor } from '@testing-library/react';
import { useCreateComment } from '@/hooks/board/useCreateComment';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import { commentApi } from '@/lib/apis/comment';

jest.mock('@/lib/apis/comment', () => ({
  commentApi: { create: jest.fn() },
}));

jest.mock('@/stores', () => ({
  useClubId: jest.fn(() => 'club-1'),
}));

jest.mock('@/stores/useToastStore', () => ({
  toast: jest.fn(),
}));

const mockCreate = commentApi.create as jest.Mock;
const BOARD_ID = 10;
const POST_ID = 42;

describe('useCreateComment', () => {
  describe('반환값', () => {
    it('성공 시 true를 반환한다', async () => {
      mockCreate.mockResolvedValue({ data: { code: 200 } });
      const queryClient = createQueryClient();
      const { result } = renderHook(() => useCreateComment(BOARD_ID, POST_ID), {
        wrapper: createWrapper(queryClient),
      });

      let returned: boolean;
      await act(async () => {
        returned = await result.current.createComment('댓글 내용');
      });

      expect(returned!).toBe(true);
    });

    it('실패 시 false를 반환하고 예외를 던지지 않는다', async () => {
      mockCreate.mockRejectedValue(new Error('network error'));
      const queryClient = createQueryClient();
      const { result } = renderHook(() => useCreateComment(BOARD_ID, POST_ID), {
        wrapper: createWrapper(queryClient),
      });

      let returned: boolean;
      await act(async () => {
        returned = await result.current.createComment('댓글 내용');
      });

      expect(returned!).toBe(false);
    });

    it('isPending 중에는 false를 반환하고 API를 한 번만 호출한다', async () => {
      let resolve!: (v: unknown) => void;
      mockCreate.mockReturnValue(new Promise((r) => (resolve = r)));

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useCreateComment(BOARD_ID, POST_ID), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        void result.current.createComment('첫 번째');
      });
      await waitFor(() => expect(result.current.isPending).toBe(true));

      let returned: boolean;
      await act(async () => {
        returned = await result.current.createComment('두 번째');
      });

      expect(returned!).toBe(false);
      expect(mockCreate).toHaveBeenCalledTimes(1);

      act(() => {
        resolve({ data: { code: 200 } });
      });
      await waitFor(() => expect(result.current.isPending).toBe(false));
    });
  });

  describe('API 호출 인자', () => {
    it('parentCommentId 없이 commentApi.create를 올바른 인자로 호출한다', async () => {
      mockCreate.mockResolvedValue({ data: { code: 200 } });
      const queryClient = createQueryClient();
      const { result } = renderHook(() => useCreateComment(BOARD_ID, POST_ID), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.createComment('댓글 내용');
      });

      expect(mockCreate).toHaveBeenCalledWith(POST_ID, {
        content: '댓글 내용',
        files: [],
        parentCommentId: undefined,
      });
    });

    it('parentCommentId를 함께 commentApi.create에 전달한다', async () => {
      mockCreate.mockResolvedValue({ data: { code: 200 } });
      const queryClient = createQueryClient();
      const { result } = renderHook(() => useCreateComment(BOARD_ID, POST_ID), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.createComment('답글 내용', 99);
      });

      expect(mockCreate).toHaveBeenCalledWith(POST_ID, {
        content: '답글 내용',
        files: [],
        parentCommentId: 99,
      });
    });
  });
});
