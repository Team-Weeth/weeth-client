import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { AdminScheduleMobileHeader } from '@/components/admin/schedule/general/AdminScheduleMobileHeader';
import type { AdminScheduleMobileHeaderProps } from '@/components/admin/schedule/general/AdminScheduleMobileHeader';
import type { Cardinal } from '@/types/admin/cardinal';

const CARDINAL_7 = { id: 7, cardinalNumber: 7 } as Cardinal;

function renderHeader(props: Partial<AdminScheduleMobileHeaderProps> = {}) {
  const handlers = {
    onPrevMonth: jest.fn(),
    onNextMonth: jest.fn(),
    onGoToToday: jest.fn(),
    onOpenMonthPicker: jest.fn(),
    onCardinalSelect: jest.fn(),
    onCardinalSelectAll: jest.fn(),
    onSearchClick: jest.fn(),
  };
  render(
    <AdminScheduleMobileHeader
      year={2026}
      month={6}
      showTodayButton={false}
      cardinals={[CARDINAL_7]}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, user: userEvent.setup() };
}

describe('AdminScheduleMobileHeader', () => {
  it('제목·연월·기수 선택을 표시한다', () => {
    renderHeader();

    expect(screen.getByRole('heading', { name: '일정 관리' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026.06, 월 선택' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '기수 선택' })).toHaveTextContent('전체');
  });

  it('선택된 기수가 있으면 기수 선택에 표시한다', () => {
    renderHeader({ activeCardinal: CARDINAL_7 });

    expect(screen.getByRole('button', { name: '기수 선택' })).toHaveTextContent('7기');
  });

  it.each([
    [false, false],
    [true, true],
  ])('showTodayButton이 %s면 [오늘] 버튼 노출 여부가 %s다', (showTodayButton, visible) => {
    renderHeader({ showTodayButton });

    expect(Boolean(screen.queryByRole('button', { name: '오늘' }))).toBe(visible);
  });

  it.each([
    ['2026.06, 월 선택', 'onOpenMonthPicker'],
    ['이전 달', 'onPrevMonth'],
    ['다음 달', 'onNextMonth'],
    ['검색', 'onSearchClick'],
  ] as const)('%s 버튼을 누르면 %s를 호출한다', async (name, handler) => {
    const callbacks = renderHeader();

    await callbacks.user.click(screen.getByRole('button', { name }));

    expect(callbacks[handler]).toHaveBeenCalledTimes(1);
  });

  it('[오늘] 버튼을 누르면 onGoToToday를 호출한다', async () => {
    const { user, onGoToToday } = renderHeader({ showTodayButton: true });

    await user.click(screen.getByRole('button', { name: '오늘' }));

    expect(onGoToToday).toHaveBeenCalledTimes(1);
  });

  it('뒤로 가기를 누르면 이전 페이지로 이동한다', async () => {
    const { user } = renderHeader();

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(useRouter().back).toHaveBeenCalledTimes(1);
  });
});
