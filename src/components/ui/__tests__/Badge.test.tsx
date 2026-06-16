import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('children을 렌더링한다', () => {
    render(<Badge>신규</Badge>);
    expect(screen.getByText('신규')).toBeInTheDocument();
  });

  it.each(['primary', 'inverse'] as const)('variant="%s"로 렌더링된다', (variant) => {
    render(<Badge variant={variant}>신규</Badge>);
    expect(screen.getByText('신규')).toBeInTheDocument();
  });
});
