import { renderHook } from '@testing-library/react';

import { useIsMobile } from '@/hooks/useIsMobile';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onchange: null,
      dispatchEvent: jest.fn(),
    })),
  });
}

describe('useIsMobile', () => {
  it('tablet 브레이크포인트 미만 쿼리로 matchMedia를 구독한다', () => {
    mockMatchMedia(false);
    renderHook(() => useIsMobile());
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 695.98px)');
  });

  it('쿼리가 일치하면 true를 반환한다', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('쿼리가 일치하지 않으면 false를 반환한다', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
