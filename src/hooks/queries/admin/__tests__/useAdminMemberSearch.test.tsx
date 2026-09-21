import { renderHook, waitFor } from '@testing-library/react';
import { apiClient } from '@/lib/apis/client';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import { useAdminMemberSearch } from '../useAdminMemberQueries';

jest.mock('@/lib/apis/client', () => ({ apiClient: { get: jest.fn() } }));
jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));

const getMock = jest.mocked(apiClient.get);

beforeEach(() => {
  getMock.mockReset();
  getMock.mockResolvedValue({
    data: {
      data: [
        {
          userId: 42,
          clubMemberId: 52,
          name: '김다현',
          memberRole: 'USER',
          memberStatus: 'BANNED',
          cardinals: [5],
        },
      ],
    },
  });
});

it('이름 검색 API에 기수를 전달하고 서버 결과를 멤버로 변환한다', async () => {
  const { result } = renderHook(() => useAdminMemberSearch('김', 5), {
    wrapper: createWrapper(createQueryClient()),
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(getMock).toHaveBeenCalledWith('/admin/clubs/club-1/members/search', {
    params: { keyword: '김', cardinalNumber: 5 },
    signal: expect.any(AbortSignal),
  });
  expect(result.current.data).toEqual([
    expect.objectContaining({ id: '42', name: '김다현', status: 'BANNED' }),
  ]);
});

it('전체 기수 검색 및 기수 변경 시 각각 API를 호출한다', async () => {
  const { result, rerender } = renderHook(
    ({ cardinal }: { cardinal?: number }) => useAdminMemberSearch('김', cardinal),
    {
      initialProps: { cardinal: undefined as number | undefined },
      wrapper: createWrapper(createQueryClient()),
    },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(getMock.mock.calls[0][1]?.params).toEqual({ keyword: '김', cardinalNumber: undefined });
  rerender({ cardinal: 5 });
  await waitFor(() => expect(getMock).toHaveBeenCalledTimes(2));
  expect(getMock.mock.calls[1][1]?.params).toEqual({ keyword: '김', cardinalNumber: 5 });
});

it('빈 검색어나 비활성화 상태에서는 검색 API를 호출하지 않는다', () => {
  const { rerender } = renderHook(
    ({ keyword, enabled }) => useAdminMemberSearch(keyword, undefined, enabled),
    {
      initialProps: { keyword: '', enabled: true },
      wrapper: createWrapper(createQueryClient()),
    },
  );
  rerender({ keyword: '김', enabled: false });
  expect(getMock).not.toHaveBeenCalled();
});
