import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('children을 렌더링한다', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });

  it('type 기본값은 button이다', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('type="submit"을 전달할 수 있다', () => {
    render(<Button type="submit">제출</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('onClick이 호출된다', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서 onClick이 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        클릭
      </Button>,
    );

    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disabled 속성이 적용된다', () => {
    render(<Button disabled>클릭</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it.each(['primary', 'secondary', 'tertiary', 'danger', 'kakao', 'apple'] as const)(
    'variant="%s"로 렌더링된다',
    (variant) => {
      render(<Button variant={variant}>클릭</Button>);
      expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
    },
  );

  it.each(['lg', 'md', 'sm', 'social', 'icon-md', 'icon-sm'] as const)(
    'size="%s"로 렌더링된다',
    (size) => {
      render(<Button size={size}>클릭</Button>);
      expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
    },
  );
});
