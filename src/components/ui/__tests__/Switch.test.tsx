import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '@/components/ui/Switch';

describe('Switch', () => {
  it('렌더링된다', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('checked=true일 때 aria-checked="true"이다', () => {
    render(<Switch checked onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('checked=false일 때 aria-checked="false"이다', () => {
    render(<Switch checked={false} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('클릭 시 onCheckedChange가 호출된다', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Switch onCheckedChange={handleChange} />);

    await user.click(screen.getByRole('switch'));

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서 클릭해도 onCheckedChange가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Switch disabled onCheckedChange={handleChange} />);

    await user.click(screen.getByRole('switch'));

    expect(handleChange).not.toHaveBeenCalled();
  });
});
