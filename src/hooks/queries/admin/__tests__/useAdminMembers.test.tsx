import { renderHook, waitFor } from '@testing-library/react';
import { apiClient } from '@/lib/apis/client';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import { useAdminMembers } from '../useAdminMemberQueries';

jest.mock('@/lib/apis/client', () => ({ apiClient: { get: jest.fn() } }));
jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));

const getMock = jest.mocked(apiClient.get);

beforeEach(() => {
  getMock.mockReset();
  getMock.mockImplementation(async (_url, config) => {
    const page = config?.params.page as number;
    return {
      data: {
        data: {
          content: Array.from({ length: page === 2 ? 9 : 10 }, (_, index) => ({
            userId: page * 10 + index + 1,
            clubMemberId: page * 10 + index + 1,
            memberRole: 'USER',
          })),
          pageNumber: page,
          pageSize: 10,
          totalElements: 29,
          totalPages: 3,
        },
      },
    };
  });
});

it('PC 페이지 이동 시 0부터 시작하는 페이지를 요청하고 목록을 교체한다', async () => {
  const { result, rerender } = renderHook(({ page }) => useAdminMembers(page, 10), {
    initialProps: { page: 0 },
    wrapper: createWrapper(createQueryClient()),
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.content).toHaveLength(10);
  expect(result.current.data?.content[0].id).toBe('1');
  expect(result.current.data?.totalPages).toBe(3);
  expect(result.current.data?.totalElements).toBe(29);

  rerender({ page: 1 });
  await waitFor(() => expect(result.current.data?.pageNumber).toBe(1));
  expect(result.current.data?.content).toHaveLength(10);
  expect(result.current.data?.content[0].id).toBe('11');

  rerender({ page: 2 });
  await waitFor(() => expect(result.current.data?.pageNumber).toBe(2));
  expect(result.current.data?.content).toHaveLength(9);
  expect(result.current.data?.content[0].id).toBe('21');
  expect(getMock.mock.calls.map(([url, config]) => [url, config?.params])).toEqual([
    ['/admin/clubs/club-1/members', { page: 0, size: 10 }],
    ['/admin/clubs/club-1/members', { page: 1, size: 10 }],
    ['/admin/clubs/club-1/members', { page: 2, size: 10 }],
  ]);

  rerender({ page: 0 });
  await waitFor(() => expect(result.current.data?.pageNumber).toBe(0));
  expect(result.current.data?.content[0].id).toBe('1');
  expect(getMock).toHaveBeenCalledTimes(3);
});

it('빈 페이지 응답의 전체 개수와 페이지 수를 유지한다', async () => {
  getMock.mockResolvedValue({
    data: {
      data: {
        content: [],
        pageNumber: 0,
        pageSize: 0,
        totalElements: 0,
        totalPages: 0,
      },
    },
  });
  const { result } = renderHook(() => useAdminMembers(), {
    wrapper: createWrapper(createQueryClient()),
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual({
    content: [],
    pageNumber: 0,
    pageSize: 0,
    totalElements: 0,
    totalPages: 0,
  });
});

it('PC 조회가 비활성화되어 있으면 요청하지 않는다', () => {
  renderHook(() => useAdminMembers(0, 10, false), {
    wrapper: createWrapper(createQueryClient()),
  });
  expect(getMock).not.toHaveBeenCalled();
});
