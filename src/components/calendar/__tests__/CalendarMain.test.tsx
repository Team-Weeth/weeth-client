import { render, screen } from '@testing-library/react';
import { CalendarMain } from '@/components/calendar/CalendarMain';

// ── child component stubs ──────────────────────────────────────────────────

jest.mock('@/components/calendar/CalendarMobileGrid', () => ({
  CalendarMobileGrid: () => null,
}));

jest.mock('@/components/calendar/CalendarGrid', () => ({
  CalendarGrid: () => null,
}));

jest.mock('@/components/calendar/CalendarMini', () => ({
  CalendarMini: () => null,
}));

jest.mock('@/components/calendar/CalendarFilter', () => ({
  CalendarFilter: () => null,
}));

jest.mock('@/components/calendar/CalendarMonthPicker', () => ({
  CalendarMonthPicker: () => null,
}));

jest.mock('@/components/calendar/CalendarUpcomingPanel', () => ({
  CalendarUpcomingPanel: () => null,
  UpcomingItem: ({ schedule }: { schedule: { title: string } }) => <div>{schedule.title}</div>,
}));

jest.mock('@/components/calendar/CalendarAttendancePanel', () => ({
  CalendarAttendancePanel: () => null,
}));

jest.mock('@/components/calendar/CalendarScheduleDetailContentMobile', () => ({
  CalendarScheduleDetailContentMobile: () => null,
}));

jest.mock('@/components/calendar/CalendarAttendeeListContent', () => ({
  CalendarAttendeeListContent: () => null,
}));

jest.mock('@/components/calendar/CalendarScheduleModal', () => ({
  CalendarScheduleModal: () => null,
}));

jest.mock('@/components/common/CardinalDropdown', () => ({
  CardinalDropdown: () => null,
}));

// ── hook stubs ─────────────────────────────────────────────────────────────

jest.mock('@/stores', () => ({
  useClubId: jest.fn(() => 1),
}));

jest.mock('@/hooks/useIsTablet', () => ({
  useIsTablet: jest.fn(() => false),
}));

jest.mock('@/hooks/useCardinalSelector', () => ({
  useCardinalSelector: jest.fn(() => ({
    cardinals: [],
    activeCardinal: null,
    setSelectedCardinalId: jest.fn(),
  })),
}));

jest.mock('@/hooks/useScrollableList', () => ({
  useScrollableList: jest.fn(() => ({
    listRef: { current: null },
    hasScrolled: false,
    onScroll: jest.fn(),
  })),
}));

// ── calendar store mock (values set per-test via jest.fn().mockReturnValue) ─

jest.mock('@/stores/useCalendarStore', () => ({
  useCalendarYear: jest.fn(),
  useCalendarMonth: jest.fn(),
  useCalendarSelectedDate: jest.fn(),
  useCalendarFilters: jest.fn(),
  useCalendarMonthPickerOpen: jest.fn(),
  useCalendarAttendeeListOpen: jest.fn(),
  useCalendarSelectedSchedule: jest.fn(),
  useCalendarActions: jest.fn(),
}));

// ── test data ──────────────────────────────────────────────────────────────

// Override MOCK_SCHEDULES with an empty list so schedule filtering does not
// interfere with date-header assertions.
jest.mock('@/mocks/calendar', () => ({ MOCK_SCHEDULES: [] }));

// ── helpers ────────────────────────────────────────────────────────────────

function mockStore(overrides: { year: number; month: number; selectedDate?: string | null }) {
  const {
    useCalendarYear,
    useCalendarMonth,
    useCalendarSelectedDate,
    useCalendarFilters,
    useCalendarMonthPickerOpen,
    useCalendarAttendeeListOpen,
    useCalendarSelectedSchedule,
    useCalendarActions,
  } = jest.requireMock('@/stores/useCalendarStore') as Record<string, jest.Mock>;

  useCalendarYear.mockReturnValue(overrides.year);
  useCalendarMonth.mockReturnValue(overrides.month);
  useCalendarSelectedDate.mockReturnValue(overrides.selectedDate ?? null);
  useCalendarFilters.mockReturnValue({
    sessionEnabled: true,
    eventEnabled: true,
    attendanceOnly: false,
  });
  useCalendarMonthPickerOpen.mockReturnValue(false);
  useCalendarAttendeeListOpen.mockReturnValue(false);
  useCalendarSelectedSchedule.mockReturnValue(null);
  useCalendarActions.mockReturnValue({
    toggleDate: jest.fn(),
    goToYearMonth: jest.fn(),
    openMonthPicker: jest.fn(),
    closeMonthPicker: jest.fn(),
    openScheduleDetail: jest.fn(),
    closeScheduleDetail: jest.fn(),
    openAttendeeList: jest.fn(),
    closeAttendeeList: jest.fn(),
    reset: jest.fn(),
  });
}

// ── tests ──────────────────────────────────────────────────────────────────

describe('CalendarMain — 모바일 날짜 헤더 (activeDateStr)', () => {
  const FIXED_NOW = new Date('2026-09-10T12:00:00');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('selectedDate가 null이고 현재 월(2026-09)이면 오늘 날짜(9월 10일)가 헤더에 표시된다', () => {
    mockStore({ year: 2026, month: 9, selectedDate: null });

    render(<CalendarMain />);

    expect(screen.getByText(/9월 10일/)).toBeInTheDocument();
  });

  it('selectedDate가 null이고 다른 월(2026-08)이면 해당 월의 1일(8월 1일)이 헤더에 표시된다', () => {
    mockStore({ year: 2026, month: 8, selectedDate: null });

    render(<CalendarMain />);

    expect(screen.getByText(/8월 1일/)).toBeInTheDocument();
  });

  it('selectedDate가 명시적으로 설정되어 있으면 그 날짜가 헤더에 표시된다', () => {
    mockStore({ year: 2026, month: 8, selectedDate: '2026-08-12' });

    render(<CalendarMain />);

    expect(screen.getByText(/8월 12일/)).toBeInTheDocument();
  });
});
