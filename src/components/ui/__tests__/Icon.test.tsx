import { render, screen } from '@testing-library/react';
import { Icon } from '@/components/ui/Icon';

const mockIcon = { src: '/mock-icon.svg', height: 20, width: 20 };

describe('Icon', () => {
  it('alt가 있으면 role="img"와 aria-label을 갖는다', () => {
    render(<Icon src={mockIcon} alt="화살표 아이콘" />);
    expect(screen.getByRole('img', { name: '화살표 아이콘' })).toBeInTheDocument();
  });

  it('alt가 없으면 role 속성이 없다', () => {
    render(<Icon src={mockIcon} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('size prop이 인라인 스타일에 반영된다', () => {
    render(<Icon src={mockIcon} size={32} alt="아이콘" />);
    const icon = screen.getByRole('img');
    expect(icon).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('size 기본값은 20이다', () => {
    render(<Icon src={mockIcon} alt="아이콘" />);
    const icon = screen.getByRole('img');
    expect(icon).toHaveStyle({ width: '20px', height: '20px' });
  });
});
