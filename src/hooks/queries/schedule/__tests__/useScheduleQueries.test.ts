import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import {
  useMonthlySchedulesQuery,
  useScheduleDetailQuery,
} from '@/hooks/queries/schedule/useScheduleQueries';
import { scheduleApi } from '@/lib/apis/schedule';
import { useClubId } from '@/stores';
import { createQueryClient, createWrapper } from '@/test-utils/query';

jest.mock('@/lib/apis/schedule', () => ({
  scheduleApi: {
    getMonthly: jest.fn(),
    getDetail: jest.fn(),
  },
}));

jest.mock('@/stores', () => ({
  useClubId: jest.fn(() => 'club-1'),
}));

const mockGetMonthly = scheduleApi.getMonthly as jest.Mock;
const mockGetDetail = scheduleApi.getDetail as jest.Mock;
const mockUseClubId = useClubId as jest.Mock;

beforeEach(() => {
  mockUseClubId.mockReturnValue('club-1');
});

// ── useMonthlySchedulesQuery ──────────────────────────────────────────────────

describe('useMonthlySchedulesQuery', () => {
  it('clubId가 null이면 API를 호출하지 않는다', () => {
    mockUseClubId.mockReturnValue(null);
    renderHook(() => useMonthlySchedulesQuery(2026, 9, 7), {
      wrapper: createWrapper(createQueryClient()),
    });
    expect(mockGetMonthly).not.toHaveBeenCalled();
  });

  it('cardinal이 undefined이면 API를 호출하지 않는다', () => {
    renderHook(() => useMonthlySchedulesQuery(2026, 9, undefined), {
      wrapper: createWrapper(createQueryClient()),
    });
    expect(mockGetMonthly).not.toHaveBeenCalled();
  });

  it('clubId·cardinal·월 범위를 올바른 인자로 API에 전달한다 (9월)', async () => {
    mockGetMonthly.mockResolvedValue({ data: { data: [] } });
    renderHook(() => useMonthlySchedulesQuery(2026, 9, 7), {
      wrapper: createWrapper(createQueryClient()),
    });
    await waitFor(() =>
      expect(mockGetMonthly).toHaveBeenCalledWith(
        'club-1',
        7,
        '2026-09-01T00:00:00',
        '2026-09-30T23:59:59',
      ),
    );
  });

  it('윤년이 아닌 2월의 end가 28일로 설정된다', async () => {
    mockGetMonthly.mockResolvedValue({ data: { data: [] } });
    renderHook(() => useMonthlySchedulesQuery(2026, 2, 7), {
      wrapper: createWrapper(createQueryClient()),
    });
    await waitFor(() =>
      expect(mockGetMonthly).toHaveBeenCalledWith(
        'club-1',
        7,
        '2026-02-01T00:00:00',
        '2026-02-28T23:59:59',
      ),
    );
  });

  it('응답 data.data를 반환한다', async () => {
    const mockData = [
      {
        id: 1,
        title: '정기모임',
        start: '2026-09-20T14:00:00',
        end: '2026-09-20T16:00:00',
        type: 'SESSION',
        cardinal: 7,
      },
    ];
    mockGetMonthly.mockResolvedValue({ data: { data: mockData } });

    const { result } = renderHook(() => useMonthlySchedulesQuery(2026, 9, 7), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});

// ── useScheduleDetailQuery ────────────────────────────────────────────────────

function createSuspenseWrapper(queryClient: ReturnType<typeof createQueryClient>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(React.Suspense, { fallback: null }, children),
    );
  };
}

describe('useScheduleDetailQuery', () => {
  it('clubId·id·type을 올바른 인자로 API에 전달한다', async () => {
    mockGetDetail.mockResolvedValue({
      data: {
        data: {
          id: 42,
          type: 'SESSION',
          title: '1차 정기모임',
          start: '2026-09-20T14:00:00',
          end: '2026-09-20T16:00:00',
        },
      },
    });

    renderHook(() => useScheduleDetailQuery(42, 'SESSION'), {
      wrapper: createSuspenseWrapper(createQueryClient()),
    });

    await waitFor(() => expect(mockGetDetail).toHaveBeenCalledWith('club-1', 42, 'SESSION'));
  });

  it('응답 data.data를 반환한다', async () => {
    const mockData = {
      id: 42,
      type: 'SESSION',
      title: '1차 정기모임',
      start: '2026-09-20T14:00:00',
      end: '2026-09-20T16:00:00',
    };
    mockGetDetail.mockResolvedValue({ data: { data: mockData } });

    const { result } = renderHook(() => useScheduleDetailQuery(42, 'SESSION'), {
      wrapper: createSuspenseWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.data).toEqual(mockData));
  });

  it('올바른 queryKey로 캐시에 저장된다', async () => {
    const mockData = {
      id: 42,
      type: 'SESSION',
      title: '1차 정기모임',
      start: '2026-09-20T14:00:00',
      end: '2026-09-20T16:00:00',
    };
    mockGetDetail.mockResolvedValue({ data: { data: mockData } });

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useScheduleDetailQuery(42, 'SESSION'), {
      wrapper: createSuspenseWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    const cached = queryClient.getQueryData(['schedules', 'detail', 'club-1', 42, 'SESSION']);
    expect(cached).toEqual(mockData);
  });
});
