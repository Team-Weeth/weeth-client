import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthNavigator } from '@/components/admin/schedule/general/MonthNavigator';
import type { MonthNavigatorProps } from '@/components/admin/schedule/general/MonthNavigator';

function renderNavigator(props: Partial<MonthNavigatorProps> = {}) {
  const onPrev = jest.fn();
  const onNext = jest.fn();
  render(<MonthNavigator year={2026} month={6} onPrev={onPrev} onNext={onNext} {...props} />);
  return { onPrev, onNext, user: userEvent.setup() };
}

describe('MonthNavigator', () => {
  it('연·월을 YYYY.MM 형식으로 표시한다', () => {
    renderNavigator({ month: 3 });

    expect(screen.getByText('2026.03')).toBeInTheDocument();
  });

  it.each([
    ['이전 달', 'onPrev'],
    ['다음 달', 'onNext'],
  ] as const)('%s 버튼을 누르면 %s를 호출한다', async (name, handler) => {
    const callbacks = renderNavigator();

    await callbacks.user.click(screen.getByRole('button', { name }));

    expect(callbacks[handler]).toHaveBeenCalledTimes(1);
  });

  it('onLabelClick이 없으면 연·월은 버튼이 아니다', () => {
    renderNavigator();

    expect(screen.queryByRole('button', { name: /월 선택/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('onLabelClick이 있으면 연·월을 월 선택 버튼으로 렌더링하고 누르면 호출한다', async () => {
    const onLabelClick = jest.fn();
    const { user } = renderNavigator({ onLabelClick });

    const labelButton = screen.getByRole('button', { name: '2026.06, 월 선택' });
    expect(labelButton).toHaveTextContent('2026.06');

    await user.click(labelButton);

    expect(onLabelClick).toHaveBeenCalledTimes(1);
  });
});
