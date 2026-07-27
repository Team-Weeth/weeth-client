import { renderHook, waitFor } from '@testing-library/react';
import { usePostDetailQuery } from '@/hooks/board/usePostDetailQuery';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import { boardApi } from '@/lib/apis/board';
import { useClubId } from '@/stores/useClubStore';
import type { PostDetail } from '@/types/board';

jest.mock('@/lib/apis/board', () => ({
  boardApi: {
    getPostById: jest.fn(),
  },
}));

jest.mock('@/stores/useClubStore', () => ({
  useClubId: jest.fn(() => 'club-1'),
}));

const mockGetPostById = boardApi.getPostById as jest.Mock;
const mockUseClubId = useClubId as jest.Mock;

beforeEach(() => {
  mockUseClubId.mockReturnValue('club-1');
});

const BOARD_ID = 10;
const POST_ID = 42;

const mockPostDetail: PostDetail = {
  id: POST_ID,
  author: { id: 1, name: '작성자', profileImageUrl: '', role: 'USER' },
  boardId: BOARD_ID,
  boardName: '공지사항',
  title: '제목',
  content: '<p>내용</p>',
  time: '2026-03-20T14:30:00',
  commentCount: 0,
  like: { isLiked: false, likeCount: 0 },
  comments: [],
  fileUrls: [],
};

describe('usePostDetailQuery', () => {
  it('clubId가 없으면 API를 호출하지 않는다', () => {
    mockUseClubId.mockReturnValue(null);
    const queryClient = createQueryClient();
    renderHook(() => usePostDetailQuery(BOARD_ID, POST_ID), {
      wrapper: createWrapper(queryClient),
    });
    expect(mockGetPostById).not.toHaveBeenCalled();
  });

  it('boardApi.getPostById를 올바른 인자로 호출한다', async () => {
    mockGetPostById.mockResolvedValue({ data: { data: mockPostDetail } });
    const queryClient = createQueryClient();
    renderHook(() => usePostDetailQuery(BOARD_ID, POST_ID), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(mockGetPostById).toHaveBeenCalledWith('club-1', BOARD_ID, POST_ID));
  });

  it('응답에서 data.data를 추출해 반환한다', async () => {
    mockGetPostById.mockResolvedValue({ data: { data: mockPostDetail } });
    const queryClient = createQueryClient();
    const { result } = renderHook(() => usePostDetailQuery(BOARD_ID, POST_ID), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPostDetail);
  });

  it('올바른 queryKey로 캐시에 데이터를 저장한다', async () => {
    mockGetPostById.mockResolvedValue({ data: { data: mockPostDetail } });
    const queryClient = createQueryClient();
    const { result } = renderHook(() => usePostDetailQuery(BOARD_ID, POST_ID), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData(['posts', 'detail', 'club-1', BOARD_ID, POST_ID]);
    expect(cached).toEqual(mockPostDetail);
  });

  it('initialData 제공 시 즉시 데이터를 반환한다', () => {
    mockGetPostById.mockResolvedValue({ data: { data: mockPostDetail } });
    const queryClient = createQueryClient();
    const { result } = renderHook(() => usePostDetailQuery(BOARD_ID, POST_ID, mockPostDetail), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.data).toEqual(mockPostDetail);
  });
});
