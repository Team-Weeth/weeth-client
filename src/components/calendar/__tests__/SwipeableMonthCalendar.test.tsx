import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SwipeableMonthCalendar } from '@/components/calendar/SwipeableMonthCalendar';
import type { SwipeableMonthCalendarProps } from '@/components/calendar/SwipeableMonthCalendar';
import type { ScheduleDetail } from '@/types/calendar';

const EVENT_ON_JUNE_10: ScheduleDetail = {
  id: 1,
  title: '팀 회의',
  type: 'EVENT',
  start: '2026-06-10T10:00:00',
  end: '2026-06-10T12:00:00',
};

function renderCalendar(props: Partial<SwipeableMonthCalendarProps> = {}) {
  const handlers = { onDateClick: jest.fn(), onPrevMonth: jest.fn(), onNextMonth: jest.fn() };
  render(
    <SwipeableMonthCalendar
      year={2026}
      month={6}
      selectedDate={null}
      schedules={[EVENT_ON_JUNE_10]}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, user: userEvent.setup({ advanceTimers: jest.advanceTimersByTime }) };
}

describe('SwipeableMonthCalendar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // 표시 범위(5~7월)와 겹치지 않는 날짜로 고정해 (오늘) 라벨이 붙지 않게 한다.
    jest.setSystemTime(new Date(2026, 0, 1, 9, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('요일 헤더를 일요일부터 표시한다', () => {
    renderCalendar();

    ['일', '월', '화', '수', '목', '금', '토'].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('이전·현재·다음 달 패널을 함께 렌더링한다', () => {
    renderCalendar();

    expect(screen.getByRole('button', { name: '2026-05-15' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '2026-07-15' })).toBeEnabled();
  });

  it('일정 표시는 현재 달 패널에만 적용한다', () => {
    renderCalendar();

    expect(screen.getAllByRole('button', { name: '2026-06-10, 일반 일정 있음' })).toHaveLength(1);
  });

  it('선택한 날짜를 aria-pressed로 표시한다', () => {
    renderCalendar({ selectedDate: '2026-06-20' });

    expect(screen.getByRole('button', { name: '2026-06-20' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('현재 달 날짜를 누르면 onDateClick에 날짜를 넘긴다', async () => {
    const { user, onDateClick } = renderCalendar();

    await user.click(screen.getByRole('button', { name: '2026-06-20' }));

    expect(onDateClick).toHaveBeenCalledWith('2026-06-20');
  });

  it('1월이면 이전 패널을 전년도 12월로 구성한다', () => {
    renderCalendar({ year: 2026, month: 1, schedules: [] });

    expect(screen.getByRole('button', { name: '2025-12-15' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '2026-02-15' })).toBeEnabled();
  });
});
