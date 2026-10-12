import { renderHook, act, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useUpdatePost } from '@/hooks/board/useUpdatePost';

// useUpdatePost.onSuccess가 setTimeout(push, 0)을 호출하므로 fake timer로 누수 방지
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
});
import { createQueryClient, createWrapper } from '@/test-utils/query';
import { toast } from '@/stores/useToastStore';
import type { UploadFileItem } from '@/stores/usePostStore';

jest.mock('@/lib/actions/board', () => ({
  updatePost: jest.fn(),
}));

jest.mock('@/stores/useClubStore', () => ({
  useClubId: jest.fn(() => 42),
}));

jest.mock('@/stores/useToastStore', () => ({
  toast: jest.fn(),
}));

jest.mock('@/hooks/board/validatePost', () => ({
  validatePost: jest.fn(() => true),
}));

jest.mock('@/lib/board', () => ({
  buildPostPath: jest.fn(
    (clubId: string, postId: number, boardId: number) =>
      `/clubs/${clubId}/boards/${boardId}/posts/${postId}`,
  ),
}));

jest.mock('@/stores/usePostStore', () => ({
  usePostStore: { getState: jest.fn() },
}));

import { updatePost as updatePostApi } from '@/lib/actions/board';
import { validatePost } from '@/hooks/board/validatePost';
import { usePostStore } from '@/stores/usePostStore';

const mockUpdatePostApi = updatePostApi as jest.Mock;
const mockValidatePost = validatePost as jest.Mock;
const mockToast = toast as jest.Mock;
const mockGetState = (usePostStore as unknown as { getState: jest.Mock }).getState;

function makeFile(overrides: Partial<UploadFileItem> = {}): UploadFileItem {
  return {
    id: 'file-1',
    fileName: 'test.png',
    fileUrl: 'https://example.com/test.png',
    storageKey: 'key/test.png',
    fileSize: 1024,
    contentType: 'image/png',
    uploaded: true,
    isExisting: true,
    ...overrides,
  };
}

function makeStoreState(
  overrides: Partial<{
    board: number;
    title: string;
    content: string;
    files: UploadFileItem[];
    _snapshot: { title: string; content: string; fileIds: string[] } | null;
    _allowNavigation: (() => void) | null;
    reset: () => void;
  }> = {},
) {
  return {
    board: 10,
    title: '테스트 게시글',
    content: '<p>내용</p>',
    files: [],
    _snapshot: { title: '이전 제목', content: '<p>이전 내용</p>', fileIds: [] },
    _allowNavigation: null,
    reset: jest.fn(),
    ...overrides,
  };
}

describe('useUpdatePost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidatePost.mockReturnValue(true);
  });

  describe('updatePost 호출', () => {
    it('updatePostApi를 올바른 인자로 호출한다', async () => {
      mockGetState.mockReturnValue(makeStoreState());
      mockUpdatePostApi.mockResolvedValue({ id: 99, boardId: 10 });

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdatePost(), { wrapper: createWrapper(queryClient) });

      act(() => {
        result.current.updatePost(99);
      });

      await waitFor(() => expect(mockUpdatePostApi).toHaveBeenCalledTimes(1));

      expect(mockUpdatePostApi).toHaveBeenCalledWith(42, 10, 99, {
        title: '테스트 게시글',
        content: '<p>내용</p>',
        files: null, // 변경 없음 → null
      });
    });

    it('validatePost가 false를 반환하면 updatePostApi를 호출하지 않는다', async () => {
      mockGetState.mockReturnValue(makeStoreState());
      mockValidatePost.mockReturnValue(false);

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdatePost(), { wrapper: createWrapper(queryClient) });

      await act(async () => {
        result.current.updatePost(1);
      });

      expect(mockUpdatePostApi).not.toHaveBeenCalled();
    });
  });

  describe('이미지 URL 순서 정렬', () => {
    it('HTML 등장 순서대로 파일을 정렬하여 API에 전달한다', async () => {
      const fileA = makeFile({
        id: 'a',
        fileUrl: 'https://example.com/a.png',
        storageKey: 'k/a',
        fileName: 'a.png',
        isExisting: false,
      });
      const fileB = makeFile({
        id: 'b',
        fileUrl: 'https://example.com/b.png',
        storageKey: 'k/b',
        fileName: 'b.png',
        isExisting: false,
      });

      // b가 a보다 먼저 HTML에 등장
      const content =
        '<img src="https://example.com/b.png" /><img src="https://example.com/a.png" />';

      mockGetState.mockReturnValue(
        makeStoreState({ files: [fileA, fileB], content, _snapshot: null }),
      );
      mockUpdatePostApi.mockResolvedValue({ id: 1, boardId: 10 });

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdatePost(), { wrapper: createWrapper(queryClient) });

      act(() => {
        result.current.updatePost(1);
      });

      await waitFor(() => expect(mockUpdatePostApi).toHaveBeenCalled());

      const [, , , payload] = mockUpdatePostApi.mock.calls[0] as [
        unknown,
        unknown,
        unknown,
        { files: Array<{ fileName: string }> | null },
      ];
      expect(payload.files?.[0].fileName).toBe('b.png');
      expect(payload.files?.[1].fileName).toBe('a.png');
    });

    it('src 속성의 &amp; 엔티티를 디코딩하여 fileUrl과 비교한다', async () => {
      const url = 'https://s3.example.com/img?foo=1&bar=2';
      const file = makeFile({
        id: 'q',
        fileUrl: url,
        storageKey: 'k/q',
        fileName: 'q.png',
        isExisting: false,
      });
      // HTML에서 &는 &amp;로 인코딩됨
      const content = `<img src="https://s3.example.com/img?foo=1&amp;bar=2" />`;

      mockGetState.mockReturnValue(makeStoreState({ files: [file], content, _snapshot: null }));
      mockUpdatePostApi.mockResolvedValue({ id: 2, boardId: 10 });

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdatePost(), { wrapper: createWrapper(queryClient) });

      act(() => {
        result.current.updatePost(2);
      });

      await waitFor(() => expect(mockUpdatePostApi).toHaveBeenCalled());

      const [, , , payload] = mockUpdatePostApi.mock.calls[0] as [
        unknown,
        unknown,
        unknown,
        { files: Array<{ fileName: string }> | null },
      ];
      // &amp; 디코딩이 올바르면 파일이 참조된 것으로 판단되어 순서 기준으로 포함됨
      expect(payload.files).not.toBeNull();
      expect(payload.files).toHaveLength(1);
    });
  });

  describe('성공 처리', () => {
    it('성공 시 성공 토스트를 표시한다', async () => {
      mockGetState.mockReturnValue(makeStoreState());
      mockUpdatePostApi.mockResolvedValue({ id: 5, boardId: 10 });

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdatePost(), { wrapper: createWrapper(queryClient) });

      act(() => {
        result.current.updatePost(5);
      });

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' })),
      );
    });

    it('성공 시 router.push로 게시글 상세 페이지로 이동한다', async () => {
      mockGetState.mockReturnValue(makeStoreState());
      mockUpdatePostApi.mockResolvedValue({ id: 7, boardId: 10 });
      const { push } = useRouter();

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdatePost(), { wrapper: createWrapper(queryClient) });

      act(() => {
        result.current.updatePost(7);
      });

      await waitFor(() => expect(push).toHaveBeenCalled());
      expect(push).toHaveBeenCalledWith(expect.stringContaining('7'));
    });

    it('성공 시 store.reset을 호출한다', async () => {
      const reset = jest.fn();
      mockGetState.mockReturnValue(makeStoreState({ reset }));
      mockUpdatePostApi.mockResolvedValue({ id: 8, boardId: 10 });

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdatePost(), { wrapper: createWrapper(queryClient) });

      act(() => {
        result.current.updatePost(8);
      });

      await waitFor(() => expect(reset).toHaveBeenCalled());
    });
  });

  describe('실패 처리', () => {
    it('API 오류 시 에러 토스트를 표시한다', async () => {
      mockGetState.mockReturnValue(makeStoreState());
      mockUpdatePostApi.mockRejectedValue(new Error('network error'));

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdatePost(), { wrapper: createWrapper(queryClient) });

      act(() => {
        result.current.updatePost(1);
      });

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' })),
      );
    });
  });

  describe('isPending 상태', () => {
    it('mutate 호출 중 isPending이 true가 된다', async () => {
      mockGetState.mockReturnValue(makeStoreState());
      let resolve!: (v: unknown) => void;
      mockUpdatePostApi.mockReturnValue(new Promise((r) => (resolve = r)));

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useUpdatePost(), { wrapper: createWrapper(queryClient) });

      act(() => {
        result.current.updatePost(1);
      });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      act(() => {
        resolve({ id: 1, boardId: 10 });
      });
    });
  });
});
