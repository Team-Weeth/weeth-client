import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import type { MonthGridProps } from '@/components/calendar/MonthGrid';

function renderGrid(props: Partial<MonthGridProps> = {}) {
  const onDateClick = jest.fn();
  render(
    <MonthGrid year={2026} month={6} selectedDate={null} onDateClick={onDateClick} {...props} />,
  );
  return { onDateClick, user: userEvent.setup({ advanceTimers: jest.advanceTimersByTime }) };
}

describe('MonthGrid', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 15, 9, 0)); // 2026-06-15
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('6주(42칸) 날짜 버튼을 렌더링한다', () => {
    renderGrid();

    expect(screen.getAllByRole('button')).toHaveLength(42);
  });

  it('이번 달 날짜만 선택할 수 있고 앞뒤 달 날짜는 비활성화한다', () => {
    renderGrid();

    expect(screen.getByRole('button', { name: '2026-06-01' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '2026-06-30' })).toBeEnabled();
    // 2026년 6월 1일은 월요일이라 첫 칸(일요일)은 5월 31일이다.
    expect(screen.getByRole('button', { name: '2026-05-31' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '2026-07-01' })).toBeDisabled();
  });

  it('오늘 날짜에 (오늘) 라벨을 붙인다', () => {
    renderGrid();

    expect(screen.getByRole('button', { name: '2026-06-15 (오늘)' })).toBeInTheDocument();
  });

  it('선택한 날짜만 aria-pressed=true다', () => {
    renderGrid({ selectedDate: '2026-06-20' });

    expect(screen.getByRole('button', { name: '2026-06-20' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '2026-06-21' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('이번 달 날짜를 누르면 onDateClick에 날짜 문자열을 넘긴다', async () => {
    const { user, onDateClick } = renderGrid();

    await user.click(screen.getByRole('button', { name: '2026-06-10' }));

    expect(onDateClick).toHaveBeenCalledWith('2026-06-10');
  });

  it('다른 달 날짜를 눌러도 onDateClick을 호출하지 않는다', async () => {
    const { user, onDateClick } = renderGrid();

    await user.click(screen.getByRole('button', { name: '2026-07-01' }));

    expect(onDateClick).not.toHaveBeenCalled();
  });

  it('1월이면 이전 칸을 전년도 12월 날짜로 채운다', () => {
    renderGrid({ year: 2026, month: 1 });

    // 2026년 1월 1일은 목요일이라 앞 4칸이 2025년 12월이다.
    expect(screen.getByRole('button', { name: '2025-12-28' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '2026-01-01' })).toBeEnabled();
  });
});
