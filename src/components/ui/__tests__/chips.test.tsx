import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chip, ChipList } from '../chips';

describe('Chip', () => {
  it('children을 렌더링한다', () => {
    render(<Chip>전체</Chip>);
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
  });

  it('onClick이 호출된다', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Chip onClick={handleClick}>전체</Chip>);

    await user.click(screen.getByRole('button', { name: '전체' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it.each(['square', 'round'] as const)('shape="%s"로 렌더링된다', (shape) => {
    render(<Chip shape={shape}>전체</Chip>);
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
  });
});

describe('ChipList', () => {
  it('children을 렌더링한다', () => {
    render(
      <ChipList>
        <Chip>전체</Chip>
        <Chip>진행 중</Chip>
      </ChipList>,
    );
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '진행 중' })).toBeInTheDocument();
  });
});
