import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useLineClamp } from '@/hooks/useLineClamp';

let capturedCallback: ResizeObserverCallback | null = null;

function MockResizeObserver(cb: ResizeObserverCallback) {
  capturedCallback = cb;
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
  };
}

beforeEach(() => {
  capturedCallback = null;
  global.ResizeObserver = jest
    .fn()
    .mockImplementation(MockResizeObserver) as unknown as typeof ResizeObserver;
});

function Fixture({ enabled, content }: { enabled: boolean; content: string }) {
  const { ref, isClamped, isExpanded, setIsExpanded } = useLineClamp<HTMLDivElement>(
    enabled,
    content,
  );
  return (
    <div>
      <div
        ref={ref}
        data-testid="target"
        data-clamped={String(isClamped)}
        data-expanded={String(isExpanded)}
      />
      <button onClick={() => setIsExpanded(true)}>펼치기</button>
    </div>
  );
}

describe('useLineClamp', () => {
  it('초기값: isClamped=false, isExpanded=false', () => {
    render(<Fixture enabled content="텍스트" />);
    const el = screen.getByTestId('target');
    expect(el.dataset.clamped).toBe('false');
    expect(el.dataset.expanded).toBe('false');
  });

  it('setIsExpanded(true) 호출 후 isExpanded가 true가 된다', async () => {
    const user = userEvent.setup();
    render(<Fixture enabled content="텍스트" />);

    await user.click(screen.getByRole('button', { name: '펼치기' }));

    expect(screen.getByTestId('target').dataset.expanded).toBe('true');
  });

  it('enabled=true이면 ResizeObserver가 생성된다', () => {
    render(<Fixture enabled content="텍스트" />);
    expect(global.ResizeObserver).toHaveBeenCalledTimes(1);
  });

  it('enabled=false이면 ResizeObserver observe가 호출되지 않는다', () => {
    render(<Fixture enabled={false} content="텍스트" />);
    const observeMock = (global.ResizeObserver as jest.Mock).mock.results[0]?.value?.observe;
    if (observeMock) {
      expect(observeMock).not.toHaveBeenCalled();
    }
    // enabled=false이면 capturedCallback도 null (effect early return)
    expect(capturedCallback).toBeNull();
  });

  it('scrollHeight > clientHeight이면 ResizeObserver 콜백 후 isClamped가 true가 된다', () => {
    render(<Fixture enabled content="긴 텍스트" />);
    const el = screen.getByTestId('target');

    Object.defineProperty(el, 'scrollHeight', { get: () => 100, configurable: true });
    Object.defineProperty(el, 'clientHeight', { get: () => 50, configurable: true });

    act(() => {
      capturedCallback?.([], new ResizeObserver(() => {}));
    });

    expect(el.dataset.clamped).toBe('true');
  });

  it('scrollHeight <= clientHeight이면 ResizeObserver 콜백 후 isClamped가 false이다', () => {
    render(<Fixture enabled content="짧은 텍스트" />);
    const el = screen.getByTestId('target');

    Object.defineProperty(el, 'scrollHeight', { get: () => 50, configurable: true });
    Object.defineProperty(el, 'clientHeight', { get: () => 50, configurable: true });

    act(() => {
      capturedCallback?.([], new ResizeObserver(() => {}));
    });

    expect(el.dataset.clamped).toBe('false');
  });

  it('언마운트 시 ResizeObserver가 disconnect된다', () => {
    const { unmount } = render(<Fixture enabled content="텍스트" />);
    const disconnectMock = (global.ResizeObserver as jest.Mock).mock.results[0]?.value?.disconnect;

    unmount();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});
