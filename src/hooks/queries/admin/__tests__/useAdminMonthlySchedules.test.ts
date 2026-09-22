import { renderHook, waitFor } from '@testing-library/react';
import { useAdminMonthlySchedules } from '../useAdminScheduleQueries';
import { adminScheduleApi } from '@/lib/apis/adminSchedule';
import { createQueryClient, createWrapper } from '@/test-utils/query';

jest.mock('@/lib/apis/adminSchedule', () => ({
  adminScheduleApi: { getEventList: jest.fn() },
}));
jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));

it('같은 월에서 전체 → 기수 → 다른 기수로 변경하면 별도로 조회하고 캐시한다', async () => {
  const getEventList = adminScheduleApi.getEventList as jest.Mock;
  getEventList.mockImplementation(async (_club, _start, _end, cardinal) => ({
    data: { data: [{ id: cardinal ?? 100, title: cardinal ? `${cardinal}기 일정` : '전체 일정' }] },
  }));
  const { result, rerender } = renderHook(
    ({ cardinal }: { cardinal: number | undefined }) => useAdminMonthlySchedules(2026, 9, cardinal),
    {
      initialProps: { cardinal: undefined as number | undefined },
      wrapper: createWrapper(createQueryClient()),
    },
  );

  for (const cardinal of [undefined, 7, 8]) {
    rerender({ cardinal });
    await waitFor(() => expect(result.current.data?.[0]?.id).toBe(cardinal ?? 100));
    expect(getEventList).toHaveBeenLastCalledWith(
      'club-1',
      '2026-09-01T00:00:00',
      '2026-09-30T23:59:59',
      cardinal,
    );
  }
  expect(getEventList).toHaveBeenCalledTimes(3);

  rerender({ cardinal: 7 });
  await waitFor(() => expect(result.current.data?.[0]?.id).toBe(7));
  rerender({ cardinal: undefined });
  await waitFor(() => expect(result.current.data?.[0]?.id).toBe(100));
  expect(getEventList).toHaveBeenCalledTimes(3);
});
