import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tag } from '@/components/ui/tag';

describe('Tag', () => {
  it('children을 렌더링한다', () => {
    render(<Tag>공지</Tag>);
    expect(screen.getByText('공지')).toBeInTheDocument();
  });

  it.each([
    'caution',
    'error',
    'success',
    'complete',
    'end',
    'neutral',
    'pink',
    'primary',
    'purple',
    'secondary',
  ] as const)('variant="%s"로 렌더링된다', (variant) => {
    render(<Tag variant={variant}>공지</Tag>);
    expect(screen.getByText('공지')).toBeInTheDocument();
  });

  it('dot=true일 때 bullet을 렌더링한다', () => {
    const { container } = render(<Tag dot>공지</Tag>);
    expect(container.querySelector('span.rounded-full')).toBeInTheDocument();
  });

  it('onDelete가 있을 때 삭제 버튼을 렌더링하고 클릭 시 호출한다', async () => {
    const handleDelete = jest.fn();
    render(<Tag onDelete={handleDelete}>공지</Tag>);
    await userEvent.setup().click(screen.getByRole('button', { name: '태그 삭제' }));
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('asChild=true일 때 자식 요소로 렌더링된다', () => {
    render(
      <Tag asChild>
        <a href="/notice">공지</a>
      </Tag>,
    );
    const link = screen.getByRole('link', { name: '공지' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/notice');
  });
});
