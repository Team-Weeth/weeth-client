import { renderHook, waitFor } from '@testing-library/react';
import { apiClient } from '@/lib/apis/client';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import { useAdminMembers } from '../useAdminMemberQueries';
import type { ClubMemberSort } from '@/lib/apis/adminMember';

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

it('기수를 고르면 서버에 기수를 넘겨 다시 조회한다', async () => {
  const { result, rerender } = renderHook(
    ({ cardinalNumber }: { cardinalNumber?: number }) =>
      useAdminMembers(0, 10, true, cardinalNumber),
    {
      initialProps: {} as { cardinalNumber?: number },
      wrapper: createWrapper(createQueryClient()),
    },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  rerender({ cardinalNumber: 3 });
  await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2));

  expect(getMock.mock.calls.map(([, config]) => config?.params)).toEqual([
    { page: 0, size: 10, cardinalNumber: undefined, sort: undefined },
    { page: 0, size: 10, cardinalNumber: 3, sort: undefined },
  ]);
});

it('정렬을 바꾸면 서버에 정렬 값을 넘겨 다시 조회한다', async () => {
  const { result, rerender } = renderHook(
    ({ sort }: { sort?: ClubMemberSort }) => useAdminMembers(0, 10, true, undefined, sort),
    {
      initialProps: { sort: 'CARDINAL_DESC' } as { sort?: ClubMemberSort },
      wrapper: createWrapper(createQueryClient()),
    },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  rerender({ sort: 'NAME_ASC' });
  await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2));

  expect(getMock.mock.calls.map(([, config]) => config?.params.sort)).toEqual([
    'CARDINAL_DESC',
    'NAME_ASC',
  ]);
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

it('조회 개수를 바꾸면 해당 size로 다시 요청하고 이전 크기의 캐시와 구분한다', async () => {
  getMock.mockImplementation(async (_url, config) => {
    const size = config?.params.size as number;
    return {
      data: {
        data: {
          content: Array.from({ length: size }, (_, index) => ({
            userId: index + 1,
            clubMemberId: index + 1,
            memberRole: 'USER',
          })),
          pageNumber: 0,
          pageSize: size,
          totalPages: Math.ceil(100 / size),
          totalElements: 100,
        },
      },
    };
  });
  const { result, rerender } = renderHook(({ size }) => useAdminMembers(0, size), {
    initialProps: { size: 10 },
    wrapper: createWrapper(createQueryClient()),
  });
  for (const size of [10, 20, 50]) {
    rerender({ size });
    await waitFor(() => expect(result.current.data?.content).toHaveLength(size));
    expect(getMock).toHaveBeenLastCalledWith('/admin/clubs/club-1/members', {
      params: { page: 0, size },
    });
  }
  rerender({ size: 10 });
  await waitFor(() => expect(result.current.data?.content).toHaveLength(10));
  expect(getMock).toHaveBeenCalledTimes(3);
});
