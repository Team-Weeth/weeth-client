import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('크래시 없이 렌더링된다', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });

  it.each([
    ['primary'],
    ['secondary'],
  ] as const)('variant=%s 렌더링', (variant) => {
    render(<Button variant={variant}>버튼</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('disabled 상태에서 클릭이 무시된다', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button disabled onClick={handleClick}>버튼</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('onClick 핸들러가 호출된다', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>버튼</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('ref가 DOM 버튼 요소에 연결된다', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>버튼</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('asChild prop으로 다른 요소로 렌더링된다', () => {
    render(
      <Button asChild>
        <a href="/test">링크 버튼</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: '링크 버튼' })).toBeInTheDocument();
  });
});
