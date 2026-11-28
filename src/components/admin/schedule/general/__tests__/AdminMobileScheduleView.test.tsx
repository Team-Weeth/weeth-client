import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminMobileScheduleView } from '@/components/admin/schedule/general/AdminMobileScheduleView';
import type { AdminMobileScheduleViewProps } from '@/components/admin/schedule/general/AdminMobileScheduleView';
import type { ScheduleDetail } from '@/types/calendar';

function createSchedule(overrides: Partial<ScheduleDetail> = {}): ScheduleDetail {
  return {
    id: 1,
    title: '팀 회의',
    type: 'EVENT',
    start: '2026-06-15T10:00:00',
    end: '2026-06-15T12:00:00',
    location: '회의실 A',
    ...overrides,
  };
}

function renderView(props: Partial<AdminMobileScheduleViewProps> = {}) {
  const handlers = {
    onPrevMonth: jest.fn(),
    onNextMonth: jest.fn(),
    onGoToToday: jest.fn(),
    onOpenMonthPicker: jest.fn(),
    onDateClick: jest.fn(),
    onCardinalSelect: jest.fn(),
    onCardinalSelectAll: jest.fn(),
    onSearchClick: jest.fn(),
    onScheduleClick: jest.fn(),
  };
  render(
    <AdminMobileScheduleView
      year={2026}
      month={6}
      selectedDate={null}
      calendarSchedules={[]}
      selectedDateSchedules={[]}
      cardinals={[]}
      isPending={false}
      isError={false}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, user: userEvent.setup({ advanceTimers: jest.advanceTimersByTime }) };
}

describe('AdminMobileScheduleView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 15, 9, 0)); // 2026-06-15 (월)
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('선택한 날짜가 없으면 오늘 날짜 헤더와 일정 개수를 표시한다', () => {
    renderView({ selectedDateSchedules: [createSchedule()] });

    expect(screen.getByText('6월 15일 (월)')).toBeInTheDocument();
    expect(screen.getByText('일정 1개')).toBeInTheDocument();
  });

  it('선택한 날짜가 있으면 그 날짜를 헤더에 표시한다', () => {
    renderView({ selectedDate: '2026-06-20' });

    expect(screen.getByText('6월 20일 (토)')).toBeInTheDocument();
  });

  it('선택한 날짜의 일정을 누르면 onScheduleClick을 호출한다', async () => {
    const schedule = createSchedule();
    const { user, onScheduleClick } = renderView({ selectedDateSchedules: [schedule] });

    await user.click(screen.getByRole('button', { name: /팀 회의/ }));

    expect(onScheduleClick).toHaveBeenCalledWith(schedule);
  });

  it('선택한 날짜에 일정이 없으면 빈 상태 문구를 표시한다', () => {
    renderView();

    expect(screen.getByText('등록된 일정이 없어요')).toBeInTheDocument();
    expect(screen.getByText('일정 0개')).toBeInTheDocument();
  });

  it('조회에 실패하면 에러 문구를 표시하고 목록을 숨긴다', () => {
    renderView({ isError: true });

    expect(screen.getByText('일정을 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.queryByText('등록된 일정이 없어요')).not.toBeInTheDocument();
  });

  it('로딩 중에는 날짜 헤더와 목록을 표시하지 않는다', () => {
    renderView({ isPending: true });

    expect(screen.queryByText('6월 15일 (월)')).not.toBeInTheDocument();
    expect(screen.queryByText('등록된 일정이 없어요')).not.toBeInTheDocument();
  });

  describe('[오늘] 버튼', () => {
    it.each([
      ['이번 달에서 날짜를 선택하지 않았으면', {}],
      ['이번 달에서 오늘을 선택했으면', { selectedDate: '2026-06-15' }],
    ])('%s 숨긴다', (_, props) => {
      renderView(props);

      expect(screen.queryByRole('button', { name: '오늘' })).not.toBeInTheDocument();
    });

    it.each([
      ['오늘이 아닌 날짜를 선택했으면', { selectedDate: '2026-06-20' }],
      ['다른 달을 보고 있으면', { month: 7 }],
      ['다른 연도를 보고 있으면', { year: 2025 }],
    ])('%s 표시한다', (_, props) => {
      renderView(props);

      expect(screen.getByRole('button', { name: '오늘' })).toBeInTheDocument();
    });

    it('누르면 onGoToToday를 호출한다', async () => {
      const { user, onGoToToday } = renderView({ selectedDate: '2026-06-20' });

      await user.click(screen.getByRole('button', { name: '오늘' }));

      expect(onGoToToday).toHaveBeenCalledTimes(1);
    });
  });
});
