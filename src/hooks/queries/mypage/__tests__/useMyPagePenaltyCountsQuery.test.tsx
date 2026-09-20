import { renderHook, waitFor } from '@testing-library/react';
import { apiClient } from '@/lib/apis/client';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import { useMyPagePenaltyCountsQuery } from '../useMyPagePenaltyCountsQuery';

jest.mock('@/lib/apis/client', () => ({ apiClient: { get: jest.fn() } }));
const getMock = jest.mocked(apiClient.get);

beforeEach(() => getMock.mockReset());

it('전체 페이지를 조회하고 유형별 기록 건수를 집계한다', async () => {
  getMock
    .mockResolvedValueOnce({
      data: {
        data: {
          content: [
            { penaltyId: 1, penaltyType: 'PENALTY' },
            { penaltyId: 2, penaltyType: 'WARNING' },
          ],
          hasNext: true,
        },
      },
    })
    .mockResolvedValueOnce({
      data: {
        data: {
          content: [
            { penaltyId: 2, penaltyType: 'WARNING' },
            { penaltyId: 3, penaltyType: 'WARNING' },
          ],
          hasNext: false,
        },
      },
    });
  const { result } = renderHook(() => useMyPagePenaltyCountsQuery('club-1'), {
    wrapper: createWrapper(createQueryClient()),
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual({ penaltyCount: 1, warningCount: 2 });
  expect(getMock.mock.calls.map(([, config]) => config?.params)).toEqual([
    { pageNumber: 0, pageSize: 100 },
    { pageNumber: 1, pageSize: 100 },
  ]);
});

it('빈 목록은 두 횟수를 모두 0으로 반환한다', async () => {
  getMock.mockResolvedValue({ data: { data: { content: [], hasNext: false } } });
  const { result } = renderHook(() => useMyPagePenaltyCountsQuery('club-1'), {
    wrapper: createWrapper(createQueryClient()),
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual({ penaltyCount: 0, warningCount: 0 });
});

it('중간 페이지 조회 실패 시 부분 집계를 총횟수로 반환하지 않는다', async () => {
  getMock
    .mockResolvedValueOnce({
      data: {
        data: {
          content: [{ penaltyId: 1, penaltyType: 'PENALTY' }],
          hasNext: true,
        },
      },
    })
    .mockRejectedValueOnce(new Error('조회 실패'));
  const { result } = renderHook(() => useMyPagePenaltyCountsQuery('club-1'), {
    wrapper: createWrapper(createQueryClient()),
  });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.data).toBeUndefined();
});
