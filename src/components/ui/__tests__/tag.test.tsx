import { render, screen } from '@testing-library/react';
import { Tag } from '../tag';

describe('Tag', () => {
  it('children을 렌더링한다', () => {
    render(<Tag>공지</Tag>);
    expect(screen.getByText('공지')).toBeInTheDocument();
  });

  it.each(['notice', 'primary'] as const)('variant="%s"로 렌더링된다', (variant) => {
    render(<Tag variant={variant}>공지</Tag>);
    expect(screen.getByText('공지')).toBeInTheDocument();
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
