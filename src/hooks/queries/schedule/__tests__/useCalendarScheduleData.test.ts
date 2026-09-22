import { renderHook, waitFor } from '@testing-library/react';

import { useCalendarScheduleData } from '@/hooks/queries/schedule/useCalendarScheduleData';
import { scheduleApi } from '@/lib/apis/schedule';
import { useClubId } from '@/stores';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import type { ScheduleDetail } from '@/types/calendar';

// ── mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/stores', () => ({
  useClubId: jest.fn(() => 'club-1'),
}));

jest.mock('@/stores/useCalendarStore', () => ({
  useCalendarYear: jest.fn(),
  useCalendarMonth: jest.fn(),
  useCalendarFilters: jest.fn(),
  useCalendarSelectedDate: jest.fn(),
  useCalendarSelectedSchedule: jest.fn(),
}));

jest.mock('@/hooks/queries/schedule/useScheduleQueries', () => ({
  useMonthlySchedulesQuery: jest.fn(),
}));

jest.mock('@/lib/apis/schedule', () => ({
  scheduleApi: {
    getDetail: jest.fn(),
  },
}));

jest.mock('@/utils/calendar/calendarScheduleMapper', () => ({
  toBaseUiSchedule: jest.fn((item) => ({ ...item, dDay: 0 })),
  toUiScheduleDetail: jest.fn((api, clubId) => ({ ...api, clubId, mapped: true })),
}));

jest.mock('@/utils/shared/date', () => ({
  toDateInputValue: jest.fn(),
}));

// ── helpers ───────────────────────────────────────────────────────────────────

import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarFilters,
  useCalendarSelectedDate,
  useCalendarSelectedSchedule,
} from '@/stores/useCalendarStore';
import { useMonthlySchedulesQuery } from '@/hooks/queries/schedule/useScheduleQueries';
import { toDateInputValue } from '@/utils/shared/date';

const mockYear = useCalendarYear as jest.Mock;
const mockMonth = useCalendarMonth as jest.Mock;
const mockFilters = useCalendarFilters as jest.Mock;
const mockSelectedDate = useCalendarSelectedDate as jest.Mock;
const mockSelectedSchedule = useCalendarSelectedSchedule as jest.Mock;
const mockMonthlyQuery = useMonthlySchedulesQuery as jest.Mock;
const mockGetDetail = scheduleApi.getDetail as jest.Mock;
const mockToDateInputValue = toDateInputValue as jest.Mock;
const mockUseClubId = useClubId as jest.Mock;

const defaultFilters = { sessionEnabled: true, eventEnabled: true, attendanceOnly: false };

function setupDefaults(overrides?: {
  year?: number;
  month?: number;
  filters?: typeof defaultFilters;
  selectedDate?: string | null;
  selectedSchedule?: ScheduleDetail | null;
  rawSchedules?: object[];
}) {
  const FIXED_NOW = new Date('2026-09-14T12:00:00');
  jest.useFakeTimers();
  jest.setSystemTime(FIXED_NOW);
  mockToDateInputValue.mockReturnValue('2026-09-14');

  mockUseClubId.mockReturnValue('club-1');
  mockYear.mockReturnValue(overrides?.year ?? 2026);
  mockMonth.mockReturnValue(overrides?.month ?? 9);
  mockFilters.mockReturnValue(overrides?.filters ?? defaultFilters);
  mockSelectedDate.mockReturnValue(overrides?.selectedDate ?? null);
  mockSelectedSchedule.mockReturnValue(overrides?.selectedSchedule ?? null);
  mockMonthlyQuery.mockReturnValue({ data: overrides?.rawSchedules ?? [] });
  mockGetDetail.mockResolvedValue({ data: { data: null } });
}

afterEach(() => {
  jest.useRealTimers();
});

const makeRawSchedule = (overrides: object) => ({
  id: 1,
  title: '테스트',
  start: '2026-09-14T14:00:00',
  end: '2026-09-14T16:00:00',
  type: 'SESSION',
  cardinal: 7,
  ...overrides,
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useCalendarScheduleData — filteredSchedules 필터링', () => {
  it('기본값(모두 활성): SESSION과 EVENT 모두 포함된다', () => {
    setupDefaults({
      rawSchedules: [
        makeRawSchedule({ id: 1, type: 'SESSION' }),
        makeRawSchedule({ id: 2, type: 'EVENT' }),
      ],
    });

    const { result } = renderHook(() => useCalendarScheduleData(7), {
      wrapper: createWrapper(createQueryClient()),
    });

    expect(result.current.filteredSchedules).toHaveLength(2);
  });

  it('sessionEnabled=false이면 SESSION 타입이 제외된다', () => {
    setupDefaults({
      filters: { sessionEnabled: false, eventEnabled: true, attendanceOnly: false },
      rawSchedules: [
        makeRawSchedule({ id: 1, type: 'SESSION' }),
        makeRawSchedule({ id: 2, type: 'EVENT' }),
      ],
    });

    const { result } = renderHook(() => useCalendarScheduleData(7), {
      wrapper: createWrapper(createQueryClient()),
    });

    expect(result.current.filteredSchedules).toHaveLength(1);
    expect(result.current.filteredSchedules[0].type).toBe('EVENT');
  });

  it('eventEnabled=false이면 EVENT 타입이 제외된다', () => {
    setupDefaults({
      filters: { sessionEnabled: true, eventEnabled: false, attendanceOnly: false },
      rawSchedules: [
        makeRawSchedule({ id: 1, type: 'SESSION' }),
        makeRawSchedule({ id: 2, type: 'EVENT' }),
      ],
    });

    const { result } = renderHook(() => useCalendarScheduleData(7), {
      wrapper: createWrapper(createQueryClient()),
    });

    expect(result.current.filteredSchedules).toHaveLength(1);
    expect(result.current.filteredSchedules[0].type).toBe('SESSION');
  });

  it('attendanceOnly=true이면 SESSION만 포함된다', () => {
    setupDefaults({
      filters: { sessionEnabled: true, eventEnabled: true, attendanceOnly: true },
      rawSchedules: [
        makeRawSchedule({ id: 1, type: 'SESSION' }),
        makeRawSchedule({ id: 2, type: 'EVENT' }),
      ],
    });

    const { result } = renderHook(() => useCalendarScheduleData(7), {
      wrapper: createWrapper(createQueryClient()),
    });

    expect(result.current.filteredSchedules).toHaveLength(1);
    expect(result.current.filteredSchedules[0].type).toBe('SESSION');
  });
});

describe('useCalendarScheduleData — activeDateStr', () => {
  it('selectedDate가 있으면 해당 날짜를 사용한다', () => {
    setupDefaults({ selectedDate: '2026-09-20' });

    const { result } = renderHook(() => useCalendarScheduleData(7), {
      wrapper: createWrapper(createQueryClient()),
    });

    expect(result.current.activeDateStr).toBe('2026-09-20');
  });

  it('selectedDate가 null이고 현재 월이면 오늘 날짜를 사용한다', () => {
    setupDefaults({ year: 2026, month: 9, selectedDate: null });
    // FIXED_NOW = 2026-09-14, toDateInputValue → '2026-09-14'

    const { result } = renderHook(() => useCalendarScheduleData(7), {
      wrapper: createWrapper(createQueryClient()),
    });

    expect(result.current.activeDateStr).toBe('2026-09-14');
  });

  it('selectedDate가 null이고 다른 월이면 해당 월의 1일을 사용한다', () => {
    setupDefaults({ year: 2026, month: 8, selectedDate: null });

    const { result } = renderHook(() => useCalendarScheduleData(7), {
      wrapper: createWrapper(createQueryClient()),
    });

    expect(result.current.activeDateStr).toBe('2026-08-01');
  });
});

describe('useCalendarScheduleData — selectedDateSchedules', () => {
  it('activeDateStr과 start가 일치하는 일정만 반환한다', () => {
    setupDefaults({
      selectedDate: '2026-09-14',
      rawSchedules: [
        makeRawSchedule({ id: 1, start: '2026-09-14T14:00:00' }),
        makeRawSchedule({ id: 2, start: '2026-09-15T14:00:00' }),
      ],
    });

    const { result } = renderHook(() => useCalendarScheduleData(7), {
      wrapper: createWrapper(createQueryClient()),
    });

    expect(result.current.selectedDateSchedules).toHaveLength(1);
    expect(result.current.selectedDateSchedules[0].id).toBe(1);
  });
});

describe('useCalendarScheduleData — fullDetail', () => {
  it('apiDetail이 없으면 selectedSchedule을 그대로 사용한다', () => {
    const selectedSchedule = makeRawSchedule({ id: 99 }) as unknown as ScheduleDetail;
    setupDefaults({ selectedSchedule });
    mockGetDetail.mockResolvedValue({ data: { data: null } });

    const { result } = renderHook(() => useCalendarScheduleData(7), {
      wrapper: createWrapper(createQueryClient()),
    });

    expect(result.current.fullDetail).toBe(selectedSchedule);
  });

  it('apiDetail이 있으면 toUiScheduleDetail로 변환한 값을 사용한다', async () => {
    const selectedSchedule = makeRawSchedule({ id: 5 }) as unknown as ScheduleDetail;
    const apiDetail = makeRawSchedule({ id: 5, description: '상세내용' });
    setupDefaults({ selectedSchedule });
    mockGetDetail.mockResolvedValue({ data: { data: apiDetail } });

    const { result } = renderHook(() => useCalendarScheduleData(7), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() =>
      // toUiScheduleDetail mock returns { ...api, clubId, mapped: true }
      expect((result.current.fullDetail as unknown as Record<string, unknown>)?.mapped).toBe(true),
    );
  });
});
