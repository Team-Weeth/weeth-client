import { act, renderHook, waitFor } from '@testing-library/react';
import { apiClient } from '@/lib/apis/client';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import { useAdminMembersInfinite } from '../useAdminMemberQueries';

jest.mock('@/lib/apis/client', () => ({ apiClient: { get: jest.fn() } }));
jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));

beforeEach(() => {
  jest.mocked(apiClient.get).mockReset();
});

it('hasNext 없는 서버 응답에서 totalPages로 판단하고 다음 10명씩 요청한다', async () => {
  const getMock = jest.mocked(apiClient.get);
  getMock.mockImplementation(async (_url, config) => {
    const page = config?.params.page as number;
    return {
      data: {
        data: {
          content: Array.from({ length: page === 2 ? 9 : 10 }, (_, index) => ({
            userId: page * 10 + index + 1,
            clubMemberId: page * 10 + index + 1,
            memberRole: 'USER',
            memberStatus: 'ACTIVE',
          })),
          pageNumber: page,
          pageSize: 10,
          totalElements: 29,
          totalPages: 3,
        },
      },
    };
  });
  const { result } = renderHook(() => useAdminMembersInfinite(10), {
    wrapper: createWrapper(createQueryClient()),
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(10);
  expect(getMock).toHaveBeenCalledTimes(1);
  expect(result.current.hasNextPage).toBe(true);

  await act(async () => {
    await result.current.fetchNextPage();
  });
  await waitFor(() => expect(result.current.data).toHaveLength(20));
  expect(result.current.hasNextPage).toBe(true);
  await act(async () => {
    await result.current.fetchNextPage();
  });
  await waitFor(() => expect(result.current.data).toHaveLength(29));
  expect(new Set(result.current.data?.map((member) => member.id)).size).toBe(29);
  expect(result.current.hasNextPage).toBe(false);
  await act(async () => {
    await result.current.fetchNextPage();
  });
  expect(getMock).toHaveBeenCalledTimes(3);
  expect(getMock.mock.calls.map((call) => call[1]?.params)).toEqual([
    { page: 0, size: 10 },
    { page: 1, size: 10 },
    { page: 2, size: 10 },
  ]);
});

it.each([0, 9, 10])(
  '전체 %i명인 단일 페이지 또는 빈 목록은 추가 요청하지 않는다',
  async (total) => {
    const getMock = jest.mocked(apiClient.get);
    getMock.mockResolvedValue({
      data: {
        data: {
          content: Array.from({ length: total }, (_, index) => ({
            userId: index + 1,
            clubMemberId: index + 1,
            memberRole: 'USER',
          })),
          pageNumber: 0,
          pageSize: total === 0 ? 0 : 10,
          totalElements: total,
          totalPages: total === 0 ? 0 : 1,
        },
      },
    });
    const { result } = renderHook(() => useAdminMembersInfinite(10), {
      wrapper: createWrapper(createQueryClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(total);
    expect(result.current.hasNextPage).toBe(false);
    await act(async () => {
      await result.current.fetchNextPage();
    });
    expect(getMock).toHaveBeenCalledTimes(1);
  },
);

it('모바일 조회가 비활성화되어 있으면 요청하지 않는다', () => {
  renderHook(() => useAdminMembersInfinite(10, false), {
    wrapper: createWrapper(createQueryClient()),
  });
  expect(apiClient.get).not.toHaveBeenCalled();
});
