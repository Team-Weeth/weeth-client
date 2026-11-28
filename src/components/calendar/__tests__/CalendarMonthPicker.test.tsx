import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarMonthPicker } from '@/components/calendar/CalendarMonthPicker';
import type { CalendarMonthPickerProps } from '@/components/calendar/CalendarMonthPicker';

function renderPicker(props: Partial<CalendarMonthPickerProps> = {}) {
  const handlers = {
    onMonthSelect: jest.fn(),
    onYearChange: jest.fn(),
    onGoToToday: jest.fn(),
  };
  render(<CalendarMonthPicker year={2026} selectedMonth={6} {...handlers} {...props} />);
  return { ...handlers, user: userEvent.setup() };
}

describe('CalendarMonthPicker', () => {
  it('연도와 1~12월 버튼, 안내 문구를 표시한다', () => {
    renderPicker();

    expect(screen.getByRole('heading', { name: '2026년' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^2026년 \d+월$/ })).toHaveLength(12);
    expect(
      screen.getByText('캘린더에서 좌우로 스와이프하면 월을 빠르게 이동할 수 있어요.'),
    ).toBeInTheDocument();
  });

  it('선택한 월만 aria-pressed=true다', () => {
    renderPicker({ selectedMonth: 6 });

    expect(screen.getByRole('button', { name: '2026년 6월' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '2026년 7월' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('선택한 월이 없으면(null) 어떤 월도 선택 상태가 아니다', () => {
    renderPicker({ selectedMonth: null });

    expect(screen.queryByRole('button', { pressed: true })).not.toBeInTheDocument();
  });

  it('월을 누르면 onMonthSelect에 월 숫자를 넘긴다', async () => {
    const { user, onMonthSelect } = renderPicker();

    await user.click(screen.getByRole('button', { name: '2026년 11월' }));

    expect(onMonthSelect).toHaveBeenCalledWith(11);
  });

  it.each([
    ['이전 연도', 2025],
    ['다음 연도', 2027],
  ])('%s를 누르면 onYearChange(%i)를 호출한다', async (name, expected) => {
    const { user, onYearChange } = renderPicker();

    await user.click(screen.getByRole('button', { name }));

    expect(onYearChange).toHaveBeenCalledWith(expected);
  });

  it('오늘 날짜로 이동을 누르면 onGoToToday를 호출한다', async () => {
    const { user, onGoToToday } = renderPicker();

    await user.click(screen.getByRole('button', { name: '오늘 날짜로 이동' }));

    expect(onGoToToday).toHaveBeenCalledTimes(1);
  });

  it('선택 핸들러 없이도 연도 이동 버튼을 눌러 오류가 나지 않는다', async () => {
    const user = userEvent.setup();
    render(<CalendarMonthPicker year={2026} selectedMonth={6} onMonthSelect={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: '다음 연도' }));

    expect(screen.getByRole('heading', { name: '2026년' })).toBeInTheDocument();
  });
});
