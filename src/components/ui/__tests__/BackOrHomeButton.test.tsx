import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { BackOrHomeButton } from '../BackOrHomeButton';

describe('BackOrHomeButton', () => {
  let mockBack: jest.Mock;
  let mockPush: jest.Mock;

  beforeEach(() => {
    const router = useRouter();
    mockBack = router.back as jest.Mock;
    mockPush = router.push as jest.Mock;
    Object.defineProperty(document, 'referrer', { value: '', configurable: true });
    Object.defineProperty(window.history, 'length', { value: 1, configurable: true });
  });

  it('children을 렌더링한다', () => {
    render(<BackOrHomeButton fallbackHref="/home">뒤로</BackOrHomeButton>);
    expect(screen.getByRole('button', { name: '뒤로' })).toBeInTheDocument();
  });

  it('referrer가 없으면 fallbackHref로 이동한다', async () => {
    const user = userEvent.setup();
    render(<BackOrHomeButton fallbackHref="/home">뒤로</BackOrHomeButton>);

    await user.click(screen.getByRole('button', { name: '뒤로' }));

    expect(mockPush).toHaveBeenCalledWith('/home');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('동일 오리진 referrer이고 history.length > 1이면 router.back()을 호출한다', async () => {
    const user = userEvent.setup();
    Object.defineProperty(document, 'referrer', {
      value: `${window.location.origin}/some-page`,
      configurable: true,
    });
    Object.defineProperty(window.history, 'length', { value: 2, configurable: true });

    render(<BackOrHomeButton fallbackHref="/home">뒤로</BackOrHomeButton>);
    await user.click(screen.getByRole('button', { name: '뒤로' }));

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('외부 오리진 referrer면 fallbackHref로 이동한다', async () => {
    const user = userEvent.setup();
    Object.defineProperty(document, 'referrer', {
      value: 'https://external.example.com/page',
      configurable: true,
    });

    render(<BackOrHomeButton fallbackHref="/home">뒤로</BackOrHomeButton>);
    await user.click(screen.getByRole('button', { name: '뒤로' }));

    expect(mockPush).toHaveBeenCalledWith('/home');
    expect(mockBack).not.toHaveBeenCalled();
  });
});
