import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useCommentMutation } from '@/hooks/board/useCommentMutation';
import { toast } from '@/stores/useToastStore';

jest.mock('@/stores', () => ({
  useClubId: jest.fn(() => 'club-1'),
}));

jest.mock('@/stores/useToastStore', () => ({
  toast: jest.fn(),
}));

const mockToast = toast as jest.Mock;

const CLUB_ID = 'club-1';
const BOARD_ID = 10;
const POST_ID = 42;

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

const defaultOptions = {
  boardId: BOARD_ID,
  postId: POST_ID,
  successMessage: '댓글이 작성되었습니다.',
  errorMessage: '댓글 작성에 실패했습니다.',
};

describe('useCommentMutation', () => {
  describe('onSuccess', () => {
    it('성공 시 successMessage로 success 토스트를 호출한다', async () => {
      const mockFn = jest.fn().mockResolvedValue(undefined);
      const queryClient = createQueryClient();
      const { result } = renderHook(
        () => useCommentMutation({ ...defaultOptions, mutationFn: mockFn }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.mutate({});
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockToast).toHaveBeenCalledWith({
        title: '댓글이 작성되었습니다.',
        variant: 'success',
      });
    });

    it('성공 시 detail 쿼리를 무효화한다', async () => {
      const mockFn = jest.fn().mockResolvedValue(undefined);
      const queryClient = createQueryClient();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(
        () => useCommentMutation({ ...defaultOptions, mutationFn: mockFn }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.mutate({});
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['posts', 'detail', CLUB_ID, BOARD_ID, POST_ID],
      });
    });

    it('invalidatePostList=true이면 posts·home 쿼리도 무효화한다', async () => {
      const mockFn = jest.fn().mockResolvedValue(undefined);
      const queryClient = createQueryClient();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(
        () =>
          useCommentMutation({ ...defaultOptions, mutationFn: mockFn, invalidatePostList: true }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.mutate({});
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['posts', CLUB_ID] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['home', 'recent-posts', CLUB_ID],
      });
    });

    it('invalidatePostList=false(기본값)이면 posts·home 쿼리를 무효화하지 않는다', async () => {
      const mockFn = jest.fn().mockResolvedValue(undefined);
      const queryClient = createQueryClient();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(
        () => useCommentMutation({ ...defaultOptions, mutationFn: mockFn }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.mutate({});
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['posts', CLUB_ID] });
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: ['home', 'recent-posts', CLUB_ID],
      });
    });
  });

  describe('onError', () => {
    it('알려진 에러 코드이면 COMMENT_ACTION_ERRORS 메시지로 error 토스트를 호출한다', async () => {
      const mockFn = jest.fn().mockRejectedValue(makeAxiosError(20500));
      const queryClient = createQueryClient();
      const { result } = renderHook(
        () => useCommentMutation({ ...defaultOptions, mutationFn: mockFn }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.mutate({});
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(mockToast).toHaveBeenCalledWith({
        title: '존재하지 않는 댓글입니다.',
        variant: 'error',
      });
    });

    it('알려지지 않은 에러 코드이면 errorMessage로 error 토스트를 호출한다', async () => {
      const mockFn = jest.fn().mockRejectedValue(makeAxiosError(99999));
      const queryClient = createQueryClient();
      const { result } = renderHook(
        () => useCommentMutation({ ...defaultOptions, mutationFn: mockFn }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.mutate({});
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(mockToast).toHaveBeenCalledWith({
        title: '댓글 작성에 실패했습니다.',
        variant: 'error',
      });
    });

    it('Axios 에러가 아니면 errorMessage로 error 토스트를 호출한다', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('network error'));
      const queryClient = createQueryClient();
      const { result } = renderHook(
        () => useCommentMutation({ ...defaultOptions, mutationFn: mockFn }),
        { wrapper: createWrapper(queryClient) },
      );

      act(() => {
        result.current.mutate({});
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(mockToast).toHaveBeenCalledWith({
        title: '댓글 작성에 실패했습니다.',
        variant: 'error',
      });
    });
  });
});
